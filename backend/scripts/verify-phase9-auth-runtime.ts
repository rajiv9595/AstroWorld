/**
 * ASTROWORLD — Phase 9 Authentication Runtime Contract
 *
 * Uses a deterministic stub for the Supabase Auth methods so the contract can
 * exercise the real middleware without requiring network credentials.
 */

import {
  authenticateRequest,
  createCsrfToken,
  getAuthenticatedUser,
  requireAdmin,
} from '../src/middleware/authMiddleware.ts';
import { supabase } from '../src/services/supabaseService.ts';

type MockRequest = {
  method: string;
  headers: Record<string, string | undefined>;
  ip?: string;
  authenticatedUser?: unknown;
};

type MockResponse = {
  statusCode: number;
  headers: Record<string, string[]>;
  body: unknown;
  status: (code: number) => MockResponse;
  append: (name: string, value: string) => void;
  json: (body: unknown) => MockResponse;
};

function makeResponse(): MockResponse {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    append(name, value) {
      this.headers[name] = [...(this.headers[name] || []), value];
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function makeRequest(
  method: string,
  headers: Record<string, string | undefined> = {},
): MockRequest {
  return { method, headers, ip: '127.0.0.1' };
}

async function runMiddleware(
  request: MockRequest,
): Promise<{ request: MockRequest; response: MockResponse; nextCalled: boolean }> {
  const response = makeResponse();
  let nextCalled = false;
  await authenticateRequest(
    request as any,
    response as any,
    (() => {
      nextCalled = true;
    }) as any,
  );
  return { request, response, nextCalled };
}

async function main(): Promise<void> {
  const authClient = (supabase as any).auth;
  const originalGetUser = authClient.getUser;
  const originalRefreshSession = authClient.refreshSession;

  let passed = 0;
  let failed = 0;

  const pass = (name: string) => {
    passed++;
    console.log('✅ ' + name);
  };

  const fail = (name: string, error: unknown) => {
    failed++;
    console.error(
      '❌ ' + name + ' — ' + (error instanceof Error ? error.message : String(error)),
    );
  };

  try {
    authClient.getUser = async (token: string) => ({
      data: {
        user:
          token === 'valid-user-token'
            ? {
                id: 'user_123',
                email: 'user@example.com',
                app_metadata: {},
              }
            : null,
      },
      error: token === 'valid-user-token' ? null : new Error('invalid token'),
    });

    authClient.refreshSession = async () => ({
      data: {
        user: {
          id: 'refreshed_user',
          email: 'refreshed@example.com',
          app_metadata: {},
        },
        session: {
          access_token: 'refreshed-access-token',
          refresh_token: 'refreshed-refresh-token',
        },
      },
      error: null,
    });

    {
      const result = await runMiddleware(
        makeRequest('GET', {
          authorization: 'Bearer valid-user-token',
        }),
      );
      try {
        if (!result.nextCalled) throw new Error('next() was not called.');
        if ((result.request as any).authenticatedUser?.userId !== 'user_123') {
          throw new Error('server did not derive user id from verified token');
        }
        pass('Valid Bearer token establishes server identity');
      } catch (error) {
        fail('Valid Bearer token establishes server identity', error);
      }
    }

    {
      const result = await runMiddleware(makeRequest('GET'));
      try {
        if (result.response.statusCode !== 401) {
          throw new Error('expected HTTP 401, got ' + result.response.statusCode);
        }
        pass('Missing token returns 401');
      } catch (error) {
        fail('Missing token returns 401', error);
      }
    }

    {
      const csrf = createCsrfToken();
      const cookie =
        'aw_access_token=valid-user-token; aw_csrf_token=' + csrf + '; aw_remember=1';
      const result = await runMiddleware(
        makeRequest('POST', {
          cookie,
          'content-type': 'application/json',
        }),
      );
      try {
        if (result.response.statusCode !== 403) {
          throw new Error('expected HTTP 403 without CSRF header');
        }
        pass('Cookie session rejects missing CSRF header');
      } catch (error) {
        fail('Cookie session rejects missing CSRF header', error);
      }
    }

    {
      const csrf = createCsrfToken();
      const cookie =
        'aw_access_token=valid-user-token; aw_csrf_token=' + csrf + '; aw_remember=1';
      const result = await runMiddleware(
        makeRequest('POST', {
          cookie,
          'x-csrf-token': csrf,
          'content-type': 'application/json',
        }),
      );
      try {
        if (!result.nextCalled) throw new Error('next() was not called.');
        if ((result.request as any).authenticatedUser?.userId !== 'user_123') {
          throw new Error('cookie session resolved incorrect user');
        }
        pass('Valid cookie session passes CSRF and authentication');
      } catch (error) {
        fail('Valid cookie session passes CSRF and authentication', error);
      }
    }

    {
      const csrf = createCsrfToken();
      const cookie =
        'aw_access_token=expired-token; aw_refresh_token=refresh-token; aw_csrf_token=' +
        csrf +
        '; aw_remember=1';
      const result = await runMiddleware(
        makeRequest('POST', {
          cookie,
          'x-csrf-token': csrf,
          'content-type': 'application/json',
        }),
      );
      try {
        if (!result.nextCalled) throw new Error('refresh path did not call next()');
        if ((result.request as any).authenticatedUser?.userId !== 'refreshed_user') {
          throw new Error('refresh path did not use refreshed identity');
        }
        const setCookies = result.response.headers['Set-Cookie'] || [];
        if (!setCookies.some((v) => v.includes('aw_access_token=refreshed-access-token'))) {
          throw new Error('refreshed access cookie was not issued');
        }
        if (!setCookies.some((v) => v.includes('aw_csrf_token=' + csrf))) {
          throw new Error('existing CSRF token was not preserved');
        }
        pass('Expired access token silently refreshes without rotating CSRF');
      } catch (error) {
        fail('Expired access token silently refreshes without rotating CSRF', error);
      }
    }

    {
      const request = makeRequest('GET');
      (request as any).authenticatedUser = { userId: 'admin_1', email: 'admin@example.com', role: 'admin' };
      const response = makeResponse();
      let nextCalled = false;
      requireAdmin(request as any, response as any, () => {
        nextCalled = true;
      });
      try {
        if (!nextCalled) throw new Error('admin user was rejected');
        pass('Admin role passes requireAdmin');
      } catch (error) {
        fail('Admin role passes requireAdmin', error);
      }
    }

    {
      const request = makeRequest('GET');
      (request as any).authenticatedUser = { userId: 'user_1', email: 'user@example.com', role: 'user' };
      const response = makeResponse();
      let nextCalled = false;
      requireAdmin(request as any, response as any, () => {
        nextCalled = true;
      });
      try {
        if (nextCalled || response.statusCode !== 403) {
          throw new Error('non-admin request was not rejected with 403');
        }
        pass('Non-admin role is rejected by requireAdmin');
      } catch (error) {
        fail('Non-admin role is rejected by requireAdmin', error);
      }
    }

    console.log('\\n==================================================');
    console.log('PHASE 9 AUTH RUNTIME CONTRACT: ' + passed + ' PASSED | ' + failed + ' FAILED');
    console.log('==================================================');

    if (failed > 0) process.exitCode = 1;
  } finally {
    authClient.getUser = originalGetUser;
    authClient.refreshSession = originalRefreshSession;
  }
}

main().catch((error) => {
  console.error('❌ Phase 9 auth runtime contract failed:', error);
  process.exitCode = 1;
});
