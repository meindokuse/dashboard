import React, { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import "./LineChart.css";
import { API_CONFIG } from '../../config/config';
import { useParams } from "react-router-dom";

const COLOR_SCHEMES = {
  default: ['#3366cc', '#dc3912', '#ff9900', '#FF0000'],
  colorblind: ['#000000', '#E69F00', '#56B4E9', '#FF0000']
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

const calculateDateRange = (range) => {
  const now = new Date();
  const ranges = {
    '1h': () => new Date(now.getTime() - 57 * 60 * 1000),
    '1d': () => new Date(now.getTime() - 24 * 57 * 60 * 1000),
    '1m': () => new Date(now.setMonth(now.getMonth() - 1)),
    '1y': () => new Date(now.setFullYear(now.getFullYear() - 1))
  };
  return { start: ranges[range](), end: new Date() };
};

const processData = (rates, stats) => {
  const header = ['Время', 'Цена', 'Среднее', 'Медиана', 'Выбросы'];
  const data = [header];
  const outliers = new Set(stats?.outliers || []);

  rates?.forEach(item => {
    data.push([
      new Date(item.timestamp),
      item.rate,
      stats?.mean || 0,
      stats?.median || 0,
      outliers.has(item.rate) ? item.rate : null
    ]);
  });

  return data;
};

export default function LineChart() {
  const { coinId } = useParams();
  const [timeRange, setTimeRange] = useState('1h');
  const [colorScheme, setColorScheme] = useState('default');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { start, end } = calculateDateRange(timeRange);
        
        const url = new URL(
          `${API_CONFIG.BASE_URL}/rate/currencies/${coinId}/rates/`
        );
        
        url.searchParams.set('start_date', start.toISOString());
        url.searchParams.set('end_date', end.toISOString());

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        
        const { rates, statistics } = await response.json();
        setChartData(processData(rates, statistics));
      } catch (err) {
        setError(err.message);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, coinId]);

  const options = {
    title: `Динамика цены за ${getRangeTitle(timeRange)}`,
    curveType: "function",
    legend: { position: "bottom" },
    series: {
      0: { color: COLOR_SCHEMES[colorScheme][0], lineWidth: 2 },
      1: { color: COLOR_SCHEMES[colorScheme][1], lineDashStyle: [4, 4] },
      2: { color: COLOR_SCHEMES[colorScheme][2], lineDashStyle: [2, 2] },
      3: { 
        type: 'scatter',
        color: COLOR_SCHEMES[colorScheme][3],
        pointSize: 6,
        lineWidth: 0
      }
    },
    hAxis: { 
      title: 'Время',
      format: 'dd.MM.yyyy HH:mm'
    },
    vAxis: { 
      title: 'Цена', 
      minValue: 0 
    },
    chartArea: { 
      width: '85%', 
      height: '70%' 
    }
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

      {loading && <div className="loading">Загрузка...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && chartData.length > 1 && (
        <Chart
          chartType="LineChart"
          width="100%"
          height="500px"
          data={chartData}
          options={options}
        />
      )}
    </div>
  );
}