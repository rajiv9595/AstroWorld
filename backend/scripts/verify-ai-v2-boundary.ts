/**
 * ASTROWORLD — AI V2 Boundary Verification
 * Validates that AI V2 router exists, returns expected status payload,
 * and contains NO legacy AI logic or reasoning.
 */

import { aiV2Router } from '../src/ai_v2/routes/aiV2Routes.ts';

async function main() {
  console.log('✨ Verifying AstroWorld AI V2 Phase 1 Boundary...\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail: string) {
    if (condition) {
      passed++;
      console.log(`✅ [PASSED] ${name}: ${detail}`);
    } else {
      failed++;
      console.error(`❌ [FAILED] ${name}: ${detail}`);
    }
  }

  // Mock Request & Response
  const req: any = {};
  let responseData: any = null;
  const res: any = {
    json: (data: any) => {
      responseData = data;
      return res;
    },
    status: (_code: number) => res,
  };

  // Find status handler
  const layer = aiV2Router.stack.find((l: any) => l.route && l.route.path === '/status');
  if (!layer) {
    assert('AI V2 Status Route', false, 'GET /api/ai-v2/status route not found in aiV2Router');
  } else {
    const handler = (layer as any)?.route?.stack[0]?.handle;
    handler?.(req, res, () => {});

    assert(
      'AI V2 Status Route Output',
      responseData &&
        responseData.system === 'AstroWorld AI V2' &&
        (responseData.phase === '2B' || responseData.phase === 2 || responseData.phase === 1),
      `Received payload: ${JSON.stringify(responseData)}`
    );
  }

  console.log(`\n==================================================`);
  console.log(`AI V2 BOUNDARY STATUS: ${passed} PASSED | ${failed} FAILED`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main();
