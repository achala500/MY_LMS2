#!/usr/bin/env node
/**
 * StudySync Master E2E Test Runner
 * 
 * Executes Tier 1 (Feature Coverage), Tier 2 (Boundary & Limits),
 * Tier 3 (Pairwise Interactions), and Tier 4 (Real-World Workflows).
 * 
 * Usage:
 *   node tests/e2e-runner.js            # Run all 4 Tiers
 *   node tests/e2e-runner.js --tier 1   # Run Tier 1 only
 *   node tests/e2e-runner.js --tier 2   # Run Tier 2 only
 *   node tests/e2e-runner.js --tier 3   # Run Tier 3 only
 *   node tests/e2e-runner.js --tier 4   # Run Tier 4 only
 */

import path from 'node:path';
import { performance } from 'node:perf_hooks';

// ANSI Color Codes
export const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgCyan: "\x1b[46m"
};

// Global Test Registry
class TestRunner {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      startTime: 0,
      endTime: 0,
      tierResults: {}
    };
  }

  describe(title, fn, options = {}) {
    const suite = {
      title,
      tier: options.tier || 1,
      fn,
      tests: [],
      beforeHooks: [],
      afterHooks: [],
      beforeEachHooks: [],
      afterEachHooks: []
    };
    
    const parentSuite = this.currentSuite;
    this.currentSuite = suite;
    this.suites.push(suite);
    
    try {
      fn();
    } finally {
      this.currentSuite = parentSuite;
    }
  }

  it(title, fn) {
    if (!this.currentSuite) {
      throw new Error(`Test '${title}' must be defined inside a describe block`);
    }
    this.currentSuite.tests.push({
      title,
      fn,
      tier: this.currentSuite.tier
    });
  }

  test(title, fn) {
    this.it(title, fn);
  }

  expect(actual) {
    const createMatchers = (isNot = false) => ({
      toBe: (expected) => {
        const pass = actual === expected;
        if (isNot ? pass : !pass) {
          throw new Error(isNot 
            ? `Expected value NOT to be ${JSON.stringify(expected)}` 
            : `Expected ${JSON.stringify(expected)} (${typeof expected}) but got ${JSON.stringify(actual)} (${typeof actual})`);
        }
      },
      toEqual: (expected) => {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        const pass = actualStr === expectedStr;
        if (isNot ? pass : !pass) {
          throw new Error(isNot
            ? `Expected value NOT to equal ${expectedStr}`
            : `Expected deep equal:\n  Expected: ${expectedStr}\n  Received: ${actualStr}`);
        }
      },
      toBeTruthy: () => {
        const pass = Boolean(actual);
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected falsy value but got ${JSON.stringify(actual)}` : `Expected truthy value but got ${JSON.stringify(actual)}`);
        }
      },
      toBeFalsy: () => {
        const pass = !Boolean(actual);
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected truthy value but got ${JSON.stringify(actual)}` : `Expected falsy value but got ${JSON.stringify(actual)}`);
        }
      },
      toBeNull: () => {
        const pass = actual === null;
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected NOT null but got null` : `Expected null but got ${JSON.stringify(actual)}`);
        }
      },
      toBeUndefined: () => {
        const pass = actual === undefined;
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected NOT undefined but got undefined` : `Expected undefined but got ${JSON.stringify(actual)}`);
        }
      },
      toBeDefined: () => {
        const pass = actual !== undefined;
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected undefined but got defined` : `Expected defined but got undefined`);
        }
      },
      toBeGreaterThan: (expected) => {
        const pass = actual > expected;
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected ${actual} NOT to be greater than ${expected}` : `Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeGreaterThanOrEqual: (expected) => {
        const pass = actual >= expected;
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected ${actual} NOT to be >= ${expected}` : `Expected ${actual} to be greater than or equal to ${expected}`);
        }
      },
      toBeLessThan: (expected) => {
        const pass = actual < expected;
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected ${actual} NOT to be less than ${expected}` : `Expected ${actual} to be less than ${expected}`);
        }
      },
      toBeLessThanOrEqual: (expected) => {
        const pass = actual <= expected;
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected ${actual} NOT to be <= ${expected}` : `Expected ${actual} to be less than or equal to ${expected}`);
        }
      },
      toContain: (expected) => {
        let pass = false;
        if (typeof actual === 'string') {
          pass = actual.includes(expected);
        } else if (Array.isArray(actual)) {
          pass = actual.includes(expected);
        } else {
          throw new Error(`toContain requires string or array, got ${typeof actual}`);
        }
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected NOT to contain '${expected}'` : `Expected to contain '${expected}', got '${actual}'`);
        }
      },
      toMatch: (regex) => {
        const pass = regex.test(String(actual));
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected NOT to match ${regex}` : `Expected '${actual}' to match regex ${regex}`);
        }
      },
      toThrow: (expectedPattern) => {
        if (typeof actual !== 'function') {
          throw new Error(`toThrow requires a function, got ${typeof actual}`);
        }
        let threw = false;
        let caughtError = null;
        try {
          actual();
        } catch (err) {
          threw = true;
          caughtError = err;
        }
        if (isNot) {
          if (threw) {
            throw new Error(`Expected function NOT to throw, but threw '${caughtError.message}'`);
          }
          return;
        }
        if (!threw) {
          throw new Error("Expected function to throw an error, but it returned without throwing");
        }
        if (expectedPattern) {
          if (expectedPattern instanceof RegExp) {
            if (!expectedPattern.test(caughtError.message)) {
              throw new Error(`Expected error message to match ${expectedPattern}, got '${caughtError.message}'`);
            }
          } else if (typeof expectedPattern === 'string') {
            if (!caughtError.message.includes(expectedPattern)) {
              throw new Error(`Expected error message to include '${expectedPattern}', got '${caughtError.message}'`);
            }
          }
        }
      },
      toHaveLength: (len) => {
        if (!actual || typeof actual.length !== 'number') {
          throw new Error(`Expected object to have length property, got ${typeof actual}`);
        }
        const pass = actual.length === len;
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected length NOT to be ${len}` : `Expected length ${len}, got ${actual.length}`);
        }
      },
      toHaveProperty: (prop) => {
        if (!actual || typeof actual !== 'object') {
          throw new Error(`Expected object, got ${typeof actual}`);
        }
        const pass = prop in actual;
        if (isNot ? pass : !pass) {
          throw new Error(isNot ? `Expected object NOT to have property '${prop}'` : `Expected object to have property '${prop}'`);
        }
      }
    });

    const matchers = createMatchers(false);
    matchers.not = createMatchers(true);
    return matchers;
  }

  async run(filterTier = null) {
    this.results.startTime = performance.now();
    
    console.log(`\n${COLORS.bold}${COLORS.cyan}======================================================================${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.cyan}  STUDYSYNC OPAQUE-BOX E2E TEST RUNNER                                 ${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.cyan}======================================================================${COLORS.reset}`);
    if (filterTier) {
      console.log(`${COLORS.yellow}Filter: Executing Tier ${filterTier} only${COLORS.reset}\n`);
    } else {
      console.log(`${COLORS.white}Mode: Executing All 4 Tiers (T1: Feature, T2: Boundary, T3: Pairwise, T4: Scenarios)${COLORS.reset}\n`);
    }

    const suitesToRun = filterTier 
      ? this.suites.filter(s => String(s.tier) === String(filterTier))
      : this.suites;

    if (suitesToRun.length === 0) {
      console.log(`${COLORS.yellow}No test suites matched the filter.${COLORS.reset}`);
      return true;
    }

    let currentTierDisplay = null;

    for (const suite of suitesToRun) {
      if (currentTierDisplay !== suite.tier) {
        currentTierDisplay = suite.tier;
        console.log(`\n${COLORS.bold}${COLORS.magenta}▶ TIER ${suite.tier}: ${this.getTierDescription(suite.tier)}${COLORS.reset}`);
        console.log(`${COLORS.dim}──────────────────────────────────────────────────────────────────────${COLORS.reset}`);
      }

      console.log(`\n  ${COLORS.bold}${COLORS.white}${suite.title}${COLORS.reset}`);

      for (const test of suite.tests) {
        const testStart = performance.now();
        const tierKey = `Tier ${test.tier}`;
        if (!this.results.tierResults[tierKey]) {
          this.results.tierResults[tierKey] = { passed: 0, failed: 0, total: 0 };
        }

        this.results.total++;
        this.results.tierResults[tierKey].total++;

        try {
          await test.fn();
          const testDuration = (performance.now() - testStart).toFixed(1);
          this.results.passed++;
          this.results.tierResults[tierKey].passed++;
          console.log(`    ${COLORS.green}✔${COLORS.reset} ${COLORS.dim}[${testDuration}ms]${COLORS.reset} ${test.title}`);
        } catch (err) {
          const testDuration = (performance.now() - testStart).toFixed(1);
          this.results.failed++;
          this.results.tierResults[tierKey].failed++;
          console.log(`    ${COLORS.red}✖ [${testDuration}ms] ${test.title}${COLORS.reset}`);
          console.log(`      ${COLORS.red}${COLORS.bold}Error:${COLORS.reset} ${COLORS.red}${err.message}${COLORS.reset}`);
          if (err.stack) {
            const stackLines = err.stack.split('\n').slice(1, 4).join('\n      ');
            console.log(`      ${COLORS.dim}${stackLines}${COLORS.reset}`);
          }
        }
      }
    }

    this.results.endTime = performance.now();
    this.printSummary();
    return this.results.failed === 0;
  }

  getTierDescription(tier) {
    switch (Number(tier)) {
      case 1: return "Feature Isolation Coverage (27 Features × ≥5 Tests)";
      case 2: return "Boundary, Limits & Corner Cases (27 Features × ≥5 Tests)";
      case 3: return "Cross-Feature Pairwise Combinatorial Interactions (≥27 Tests)";
      case 4: return "Real-World End-to-End Application Scenarios (S1-S5)";
      case 5: return "Adversarial Edge Case Stress Tests & Security (T5.1-T5.7)";
      default: return "Test Suite";
    }
  }

  printSummary() {
    const totalDuration = ((this.results.endTime - this.results.startTime) / 1000).toFixed(2);
    
    console.log(`\n${COLORS.bold}${COLORS.cyan}======================================================================${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.cyan}  TEST EXECUTION SUMMARY                                               ${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.cyan}======================================================================${COLORS.reset}`);
    
    for (const [tier, res] of Object.entries(this.results.tierResults)) {
      const tierStatus = res.failed === 0 
        ? `${COLORS.green}PASS${COLORS.reset}` 
        : `${COLORS.red}FAIL (${res.failed})${COLORS.reset}`;
      console.log(`  ${COLORS.bold}${tier.padEnd(10)}${COLORS.reset} : ${String(res.passed).padStart(3)} passed / ${String(res.total).padStart(3)} total  [${tierStatus}]`);
    }

    console.log(`${COLORS.dim}──────────────────────────────────────────────────────────────────────${COLORS.reset}`);
    console.log(`  ${COLORS.bold}Total Tests${COLORS.reset} : ${COLORS.bold}${this.results.total}${COLORS.reset}`);
    console.log(`  ${COLORS.bold}Passed     ${COLORS.reset} : ${COLORS.green}${COLORS.bold}${this.results.passed}${COLORS.reset}`);
    console.log(`  ${COLORS.bold}Failed     ${COLORS.reset} : ${this.results.failed > 0 ? COLORS.red + COLORS.bold : COLORS.white}${this.results.failed}${COLORS.reset}`);
    console.log(`  ${COLORS.bold}Duration   ${COLORS.reset} : ${totalDuration}s`);
    console.log(`${COLORS.bold}${COLORS.cyan}======================================================================${COLORS.reset}`);

    if (this.results.failed === 0) {
      console.log(`\n${COLORS.bgGreen}${COLORS.bold}  ✓ ALL TESTS PASSED SUCCESSFULLY  ${COLORS.reset}\n`);
    } else {
      console.log(`\n${COLORS.bgRed}${COLORS.bold}  ✖ ${this.results.failed} TEST(S) FAILED  ${COLORS.reset}\n`);
    }
  }
}

// Global Singleton Instance
export const runner = new TestRunner();
export const describe = (title, fn, options) => runner.describe(title, fn, options);
export const it = (title, fn) => runner.it(title, fn);
export const test = (title, fn) => runner.test(title, fn);
export const expect = (actual) => runner.expect(actual);

// CLI Entry Point
if (process.argv[1] && process.argv[1].endsWith('e2e-runner.js')) {
  const args = process.argv.slice(2);
  let tierFilter = null;
  const tierIdx = args.indexOf('--tier');
  if (tierIdx !== -1 && args[tierIdx + 1]) {
    tierFilter = args[tierIdx + 1];
  }

  // Dynamically load test suites
  async function loadAndRun() {
    try {
      if (!tierFilter || tierFilter === '1') {
        await import('./tier1-feature.test.js');
      }
      if (!tierFilter || tierFilter === '2') {
        await import('./tier2-boundary.test.js');
      }
      if (!tierFilter || tierFilter === '3') {
        await import('./tier3-pairwise.test.js');
      }
      if (!tierFilter || tierFilter === '4') {
        await import('./tier4-application.test.js');
      }
      if (!tierFilter || tierFilter === '5') {
        await import('./tier5-adversarial.test.js');
      }

      const success = await runner.run(tierFilter);
      process.exit(success ? 0 : 1);
    } catch (err) {
      console.error(`${COLORS.red}Failed to execute test suite: ${err.message}${COLORS.reset}`);
      if (err.stack) console.error(err.stack);
      process.exit(1);
    }
  }

  loadAndRun();
}
