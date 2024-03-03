import { expect, test } from 'vitest'

import { formatBytesPerSec, getChartOptions } from '../../../../../src/components/performance/common';

test('getChartOptions - yaxis.max is 100', () => {
  const obj = getChartOptions();
  expect(obj.yaxis.max).toBe(100);
});

test('getChartOptions(false) - yaxis.max is 100', () => {
  const obj = getChartOptions(false);
  expect(obj.yaxis.max).toBe(100);
});

test('getChartOptions(true) - yaxis.max undefined', () => {
  const obj = getChartOptions(true);
  expect(obj.yaxis.max).toBe(undefined);
});

test('getChartOptions - test cloneDeep if working', () => {
  const obj1 = getChartOptions();
  const obj2 = getChartOptions();
  obj2.chart.id = 'test';
  expect(obj1.chart.id).toBe('chart');
  expect(obj2.chart.id).toBe('test');
});

test('formatBytesPErSecond - 1000', () => {
  const result = formatBytesPerSec(1000);
  expect(result).toBe('7.81 Kbps');
});

