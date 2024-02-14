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
    colors: ['#3f51b5'],
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
        show: false,
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
