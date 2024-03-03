// setup-teardown-hook.js
import { afterAll, beforeAll, vi } from 'vitest';
beforeAll(() => {
  global.CodeMirror  = {
    fromTextArea:  vi.fn(),
    focus: vi.fn(),
  };
});
afterAll(() => {
  delete global.CodeMirror
});
