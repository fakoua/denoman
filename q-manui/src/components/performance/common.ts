import _cloneDeep from 'lodash/cloneDeep';

const ChartOptions =  (noMax: boolean) => {
  return {
    chart: {
      id: 'chart',
      type: 'area',
      animations: {
        enabled: false,
      },
      fill: {
        opacity: 1,
      },
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ['#0b219b'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
    },
    markers: {
      size: 0,
    },
    xaxis: {
      categories: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      labels: {
        show: false,
      },
    },
    yaxis: {
      min: 1,
      max: noMax ?  undefined: 100,
      labels: {
        show: true,
        formatter: (value: number) => {
          return `${value.toFixed(0)}%`
        },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
    grid: {
      show: true,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  }
}

export function getChartOptions(noMax= false) {
  return _cloneDeep(ChartOptions(noMax));
}

export function formatBytesPerSec(bytesPerSec: number): string {
  const units = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];

  let index = 0;
  let speed = bytesPerSec * 8; // Convert bytes per second to bits per second

  while (speed >= 1024 && index < units.length - 1) {
      speed /= 1024;
      index++;
  }

  return `${speed.toFixed(2)} ${units[index]}`;
}
