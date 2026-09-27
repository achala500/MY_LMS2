/**
 * Performance Benchmark for getAdminForms
 */

import { describe, it, expect, runner } from './e2e-runner.js';
import { ApiClient } from '../src/lib/api.ts';
import localDb from '../src/lib/storage/localDb.ts';

describe("Admin Forms Performance Benchmark", () => {
  it("Measures getAdminForms performance with 100 forms and 5000 total responses", async () => {
    // Seed 100 forms and 50 responses per form (total 5000 responses)
    const forms = Array.from({ length: 100 }, (_, i) => ({
      formId: `FORM-BENCH-${i}`,
      title: `Academic Feedback Form ${i}`,
      description: `Description ${i}`,
      targetAudience: 'all',
      createdBy: 'alwisachalaanurada@gmail.com',
      createdAt: new Date().toISOString(),
      isActive: true,
      responseCount: 50,
      fields: []
    }));

    const responses = [];
    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < 50; j++) {
        responses.push({
          responseId: `RESP-${i}-${j}`,
          formId: `FORM-BENCH-${i}`,
          studyId: `SG-MATH-${String(j).padStart(4, '0')}`,
          answers: { f1: 'Physics', f2: 8 },
          submittedAt: new Date().toISOString()
        });
      }
    }

    localDb.setItem("studysync_db_admin_forms", forms);
    localDb.setItem("studysync_db_form_responses", responses);

    // Warm-up call
    const warmRes = await ApiClient.getAdminForms();
    expect(warmRes.success).toBe(true);
    expect(warmRes.data.forms.length).toBe(100);
    expect(warmRes.data.responses.length).toBe(5000);

    const iterations = 50;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await ApiClient.getAdminForms();
    }
    const duration = performance.now() - start;
    const avgMs = duration / iterations;

    console.log(`\n[BENCHMARK RESULT] ${iterations} calls took ${duration.toFixed(2)}ms (Average: ${avgMs.toFixed(3)}ms / call)\n`);
    expect(avgMs).toBeLessThan(50);
  });
});

if (process.argv[1] && process.argv[1].endsWith('m10-admin-forms-benchmark.test.js')) {
  runner.run().then(success => process.exit(success ? 0 : 1));
}
