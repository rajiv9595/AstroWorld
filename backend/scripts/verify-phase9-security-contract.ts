/**
 * ASTROWORLD — Phase 9 Security Contract
 *
 * Structural regression guard for security-critical boundaries. This is not a
 * substitute for live auth integration tests; it makes unsafe patterns fail
 * deterministically before deployment and scans the full route/client surface.
 */

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..');
const read = (relative: string): string =>
  fs.readFileSync(path.join(repoRoot, relative), 'utf8');

function collectFiles(directory: string): string[] {
  const absolute = path.join(repoRoot, directory);
  const output: string[] = [];

  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const fullPath = path.join(absolute, entry.name);
    if (entry.isDirectory()) {
      output.push(...collectFiles(path.relative(repoRoot, fullPath)));
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      output.push(fullPath);
    }
  }

  return output;
}

const files = {
  authMiddleware: read('backend/src/middleware/authMiddleware.ts'),
  authRoutes: read('backend/src/routes/authRoutes.ts'),
  chartRoutes: read('backend/src/routes/chartRoutes.ts'),
  aiRoutes: read('backend/src/ai_v2/routes/aiV2Routes.ts'),
  server: read('backend/src/server.ts'),
  frontendAuth: read('frontend/src/lib/supabase.ts'),
  frontendAi: read('frontend/src/services/aiV2ApiClient.ts'),
  frontendCharts: read('frontend/src/services/chartService.ts'),
  authView: read('frontend/src/views/AuthView.tsx'),
};

const frontendSource = collectFiles('frontend/src')
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
const protectedBackendRoutes = [
  read('backend/src/routes/authRoutes.ts'),
  read('backend/src/routes/chartRoutes.ts'),
  read('backend/src/routes/astrologyRoutes.ts'),
  read('backend/src/ai_v2/routes/aiV2Routes.ts'),
].join('\n');

type Contract = {
  name: string;
  pass: boolean;
  detail: string;
};

const contracts: Contract[] = [
  {
    name: 'Server verifies Supabase access tokens',
    pass: files.authMiddleware.includes('supabase.auth.getUser(accessToken)'),
    detail: 'authMiddleware must verify the presented access token with Supabase Auth.',
  },
  {
    name: 'Authenticated user id is server-derived',
    pass: files.aiRoutes.includes('getAuthenticatedUser(req)') && !files.aiRoutes.includes('function getRequestUserId'),
    detail: 'AI routes must use verified request identity, never a client user-id resolver.',
  },
  {
    name: 'AI routes never trust x-user-id',
    pass: !files.aiRoutes.includes('x-user-id') && !protectedBackendRoutes.includes("headers['x-user-id']"),
    detail: 'The deprecated x-user-id authorization header must not exist in the AI route.',
  },
  {
    name: 'AI routes never fall back to default_user',
    pass: !files.aiRoutes.includes('default_user'),
    detail: 'No protected AI route may invent an identity when authentication is absent.',
  },
  {
    name: 'AI mutation routes enforce authentication middleware',
    pass: files.aiRoutes.includes('aiV2Router.use(authenticateRequest)'),
    detail: 'All protected AI routes must pass through the verified auth boundary.',
  },
  {
    name: 'Metrics endpoint is admin protected',
    pass: files.aiRoutes.includes("aiV2Router.get('/metrics', requireAdmin"),
    detail: 'Operational metrics should not be publicly exposed.',
  },
  {
    name: 'Chart routes use verified identity',
    pass: files.chartRoutes.includes('getAuthenticatedUser(req)') && !files.chartRoutes.includes('/:userId'),
    detail: 'Saved charts must be scoped by server-derived user identity.',
  },
  {
    name: 'Chart routes do not accept userId in request body',
    pass: !files.chartRoutes.includes('const { userId, chart }'),
    detail: 'Client user ids must not be used as the authorization scope.',
  },
  {
    name: 'Signup never deletes an existing account',
    pass: !files.authRoutes.includes('admin.deleteUser'),
    detail: 'Existing account collisions must not trigger destructive recreation.',
  },
  {
    name: 'Login creates an HttpOnly session',
    pass: files.authRoutes.includes('setAuthSessionCookies'),
    detail: 'Supabase access/refresh tokens must be stored server-side in protected cookies.',
  },
  {
    name: 'Authenticated session endpoint exists',
    pass: files.authRoutes.includes("authRouter.get('/session'"),
    detail: 'Browser auth state must be reconstructed from the server session.',
  },
  {
    name: 'CSRF token is present',
    pass: files.authMiddleware.includes('AUTH_CSRF_COOKIE') &&
      files.authMiddleware.includes('x-csrf-token'),
    detail: 'Cross-site cookie sessions require a CSRF boundary on unsafe requests.',
  },
  {
    name: 'Cross-site sessions use explicit credentialed CORS',
    pass: files.server.includes("Access-Control-Allow-Credentials") &&
      !files.server.includes("Access-Control-Allow-Origin', '*'") &&
      files.server.includes('CORS_ORIGINS'),
    detail: 'Credentialed CORS must use an explicit configured origin allowlist.',
  },
  {
    name: 'Production does not implicitly allow localhost',
    pass: files.server.includes("process.env.NODE_ENV === 'production'") &&
      files.server.includes("['http://localhost:5173', 'http://127.0.0.1:5173']"),
    detail: 'Development origins must be conditional, not globally allowed in production.',
  },
  {
    name: 'Production trusts the proxy correctly',
    pass: files.server.includes("app.set('trust proxy', 1)"),
    detail: 'Express should derive req.ip from the configured deployment proxy.',
  },
  {
    name: 'Request body size is bounded',
    pass: files.server.includes("express.json({ limit: '1mb' })"),
    detail: 'The API should not accept the previous unrestricted 10MB JSON body budget.',
  },
  {
    name: 'Frontend does not send x-user-id',
    pass: !frontendSource.includes("'x-user-id'") &&
      !frontendSource.includes('"x-user-id"') &&
      !frontendSource.includes('x-user-id'),
    detail: 'Browser clients must never present a user id as authorization.',
  },
  {
    name: 'Frontend uses credentialed fetch',
    pass: files.frontendAuth.includes("credentials: 'include'") &&
      files.frontendAi.includes("credentials: 'include'") &&
      files.frontendCharts.includes("credentials: 'include'"),
    detail: 'Cross-origin deployments require session cookies to be included.',
  },
  {
    name: 'Frontend auth tokens are not persisted',
    pass: !files.frontendAuth.includes("localStorage.setItem('astroworld_supabase_auth_token'") &&
      !files.frontendAuth.includes("localStorage.setItem(\"astroworld_supabase_auth_token\""),
    detail: 'No Supabase access/refresh token may be stored in browser localStorage.',
  },
  {
    name: 'Logout is authenticated',
    pass: files.authRoutes.includes("authRouter.post('/logout', authenticateRequest"),
    detail: 'Session termination must use the authenticated cookie/CSRF boundary.',
  },
  {
    name: 'Session response exposes CSRF bootstrap only',
    pass: files.authRoutes.includes('csrfToken') && !files.authRoutes.match(/\n\s*token:\s*data\.session/),
    detail: 'Auth responses may return CSRF bootstrap data but not raw Supabase access tokens.',
  },
  {
    name: 'Whole frontend has no client identity authorization header',
    pass: !frontendSource.includes('x-user-id') &&
      !frontendSource.includes('astroworld_supabase_auth_token'),
    detail: 'No frontend source file may authorize requests with client identity or browser-stored Supabase tokens.',
  },
  {
    name: 'Whole protected backend route surface has no userId-auth helper',
    pass: !protectedBackendRoutes.includes('function getRequestUserId') &&
      !protectedBackendRoutes.includes("req.headers['x-user-id']") &&
      !protectedBackendRoutes.includes("req.query.userId"),
    detail: 'Protected route sources must never derive tenant identity from caller-controlled ids.',
  },
  {
    name: 'Guest-login dead endpoint removed',
    pass: !files.authView.includes('/api/auth/guest-login') && !files.authView.includes('handleGuestLogin'),
    detail: 'The UI must not advertise an endpoint that does not exist.',
  },
];

let passed = 0;
for (const contract of contracts) {
  if (contract.pass) {
    passed++;
    console.log('✅ ' + contract.name);
  } else {
    console.error('❌ ' + contract.name + ' — ' + contract.detail);
  }
}

const failed = contracts.length - passed;
console.log('\\n==================================================');
console.log('PHASE 9 SECURITY CONTRACT: ' + passed + ' PASSED | ' + failed + ' FAILED');
console.log('==================================================');

if (failed > 0) process.exitCode = 1;
