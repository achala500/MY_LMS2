import localDb from '../src/lib/storage/localDb';
import { safeStorage } from '../src/lib/storage/safeStorage';

const STUDY_ID = 'SG-MATH-0001';

// Setup dataset
const forms = [];
for (let i = 0; i < 50; i++) {
  forms.push({
    formId: `FORM-BENCH-${i}`,
    title: `Survey ${i}`,
    description: 'Test survey',
    targetAudience: 'all' as const,
    fields: [],
    createdBy: 'admin@test.com',
    createdAt: new Date().toISOString(),
    isActive: true,
    responseCount: 10,
  });
}
safeStorage.setJson('studysync_db_admin_forms', forms);

const responses = [];
for (let i = 0; i < 50; i++) {
  for (let j = 0; j < 20; j++) {
    responses.push({
      responseId: `RESP-${i}-${j}`,
      formId: `FORM-BENCH-${i}`,
      studyId: j % 2 === 0 ? STUDY_ID : `SG-MATH-${1000 + j}`,
      studentName: 'Student',
      studentEmail: 'student@test.com',
      answers: {},
      submittedAt: new Date().toISOString(),
    });
  }
}
safeStorage.setJson('studysync_db_form_responses', responses);

// Warmup
localDb.getStudentInbox(STUDY_ID);

const ITERATIONS = 200;
const start = performance.now();
for (let k = 0; k < ITERATIONS; k++) {
  safeStorage.setJson('studysync_db_inbox', {});
  localDb.getStudentInbox(STUDY_ID);
}
const elapsed = performance.now() - start;

console.log(`[BENCHMARK] Total time for ${ITERATIONS} iterations: ${elapsed.toFixed(2)} ms (${(elapsed / ITERATIONS).toFixed(3)} ms/op)`);
