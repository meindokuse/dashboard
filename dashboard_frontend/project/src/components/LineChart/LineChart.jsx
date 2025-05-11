import React, { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import "./LineChart.css";
import { API_CONFIG } from '../../config/config';
import { useParams } from "react-router-dom";

const COLOR_SCHEMES = {
  default: ['#3366cc', '#dc3912', '#ff9900'],
  colorblind: ['#000000', '#E69F00', '#56B4E9']
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
    '1h': () => new Date(now.getTime() - 60 * 60 * 1000),
    '1d': () => new Date(now.getTime() - 24 * 60 * 60 * 1000),
    '1m': () => new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
    '1y': () => new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  };
  return { start: ranges[range](), end: now };
};

const processData = (apiData, stats) => {
  const header = ['Время', 'Цена', 'Среднее', 'Медиана'];
  const data = [header];
  
  apiData.forEach(item => {
    data.push([
      item.timestamp,
      item.rate,
      stats.mean,
      stats.median
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
          API_CONFIG.ENDPOINTS.CURRENCY_RATES(coinId), 
          API_CONFIG.BASE_URL
        );
        
        url.searchParams.set('start_date', start.toISOString());
        url.searchParams.set('end_date', end.toISOString());
    
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

        const responseData = await response.json();
        
        const processedData = processData(
          responseData.rates,
          responseData.statistics
        );
        
        setChartData(processedData);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных');
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

      {loading && <div className="loading">Загрузка...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && chartData.length > 0 && (
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