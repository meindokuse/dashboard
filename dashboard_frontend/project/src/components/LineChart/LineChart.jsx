import React, { useState } from "react";
import { Chart } from "react-google-charts";
import "./LineChart.css";

const COLOR_SCHEMES = {
  default: ['#3366cc', '#dc3912', '#ff9900'],
  colorblind: ['#000000', '#E69F00', '#56B4E9']
};


const STATIC_DATA = {
  '1h': [
    ['Время', 'Цена', 'Среднее', 'Медиана'],
    ['12:00', 49000, 49500, 49200],
    ['13:00', 49500, 49500, 49200],
    ['14:00', 50000, 49500, 49200],
    ['15:00', 50500, 49500, 49200],
  ],
  '1d': [
    ['Время', 'Цена', 'Среднее', 'Медиана'],
    ['00:00', 48000, 49000, 48500],
    ['06:00', 49000, 49000, 48500],
    ['12:00', 49500, 49000, 48500],
    ['18:00', 50000, 49000, 48500],
  ],
  '1m': [
    ['Дата', 'Цена', 'Среднее', 'Медиана'],
    ['1', 47000, 48000, 47500],
    ['7', 48000, 48000, 47500],
    ['15', 48500, 48000, 47500],
    ['30', 49000, 48000, 47500],
  ],
  '1y': [
    ['Месяц', 'Цена', 'Среднее', 'Медиана'],
    ['Янв', 45000, 47000, 46000],
    ['Апр', 48000, 47000, 46000],
    ['Июл', 51000, 47000, 46000],
    ['Окт', 49000, 47000, 46000],
  ]
};

const getRangeTitle = (range) => {
  const titles = {
    '1h': '1 час',
    '1d': '1 день',
    '1m': '1 месяц',
    '1y': '1 год'
  };
  return titles[range] || range;
};

export default function LineChart() {
  const [timeRange, setTimeRange] = useState('1h');
  const [colorScheme, setColorScheme] = useState('default');

  const options = {
    title: `Динамика цены за ${getRangeTitle(timeRange)}`,
    curveType: "function",
    legend: { position: "bottom" },
    series: {
      0: { color: COLOR_SCHEMES[colorScheme][0], lineWidth: 2 },
      1: { color: COLOR_SCHEMES[colorScheme][1], lineDashStyle: [4, 4] },
      2: { color: COLOR_SCHEMES[colorScheme][2], lineDashStyle: [2, 2] }
    },
    hAxis: { title: 'Время' },
    vAxis: { title: 'Цена', minValue: 0 },
    chartArea: { width: '85%', height: '70%' }
  };

  return (
    <div className="chart-container">
      <div className="controls">
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{ marginRight: 15, padding: 8 }}
        >
          <option value="1h">1 час</option>
          <option value="1d">1 день</option>
          <option value="1m">1 месяц</option>
          <option value="1y">1 год</option>
        </select>

        <select
          value={colorScheme}
          onChange={(e) => setColorScheme(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="default">Стандартная схема</option>
          <option value="colorblind">Для дальтоников</option>
        </select>
      </div>

      <Chart
        chartType="LineChart"
        width="100%"
        height="500px"
        data={STATIC_DATA[timeRange]}
        options={options}
      />


    </div>
  );
}