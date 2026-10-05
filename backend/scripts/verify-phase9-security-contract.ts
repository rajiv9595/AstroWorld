/**
 * ASTROWORLD — Phase 9 Security Contract
 *
 * Structural regression guard for security-critical boundaries. This is not a
 * substitute for live auth integration tests; it makes unsafe patterns fail
 * deterministically before deployment.
 */

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..');
const read = (relative: string): string => fs.readFileSync(path.join(repoRoot, relative), 'utf8');

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
    pass: !files.aiRoutes.includes('x-user-id'),
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
    pass: files.server.includes("Access-Control-Allow-Credentials",) &&
      !files.server.includes("Access-Control-Allow-Origin', '*'"),
    detail: 'Credentialed CORS must use an explicit origin allowlist.',
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
    pass: !files.frontendAi.includes('x-user-id') && !files.frontendCharts.includes('x-user-id'),
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
    pass: !files.frontendAuth.includes('astroworld_supabase_auth_token') ||
      files.frontendAuth.includes("localStorage.removeItem('astroworld_supabase_auth_token')"),
    detail: 'No browser-accessible token storage may be introduced.',
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
