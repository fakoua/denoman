import { describe, expect, it } from 'vitest';
import { cpuFormatter } from 'src/utils';

describe('cpuFormatter', () => {
  it('should format the CPU time correctly', () => {
    // Test case 1
    let result = cpuFormatter(0);
    expect(result).toEqual('0:00:00');

    // Test case 2
    result = cpuFormatter(60);
    expect(result).toEqual('0:01:00');

    // Test case 3
    result = cpuFormatter(3661);
    expect(result).toEqual('1:01:01');

    // Add more test cases as needed
  });
});
