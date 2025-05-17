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
  const now = new Date(); // Локальное время пользователя
  const ranges = {
    '1h': () => new Date(now - 60 * 60 * 1000),
    '1d': () => new Date(now - 24 * 60 * 60 * 1000),
    '1m': () => new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
    '1y': () => new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  };
  return { 
    start: ranges[range](), 
    end: now 
  };
};

// Определение формата времени в зависимости от диапазона
const getTimeFormat = (range) => {
  switch (range) {
    case '1h':
    case '1d':
      return 'HH:mm';
    case '1m':
      return 'dd.MM.yyyy';
    case '1y':
      return 'MM.yyyy';
    default:
      return 'dd.MM.yyyy HH:mm';
  }
};

const processData = (rates, stats) => {
  const header = [
    { type: 'date', label: 'Время' },
    { type: 'number', label: 'Цена' },
    { type: 'number', label: 'Среднее' },
    { type: 'number', label: 'Медиана' },
    { type: 'number', label: 'Выбросы' }
  ];
  
  const data = [header];
  const outliers = new Set(stats?.outliers?.map(Number) || []);

  rates?.forEach(item => {
    data.push([
      new Date(item.timestamp),
      Number(item.rate),
      Number(stats?.mean || 0),
      Number(stats?.median || 0),
      outliers.has(Number(item.rate)) ? Number(item.rate) : null
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
        
        // Конвертируем локальное время в UTC
        const toUTC = (date) => new Date(
          Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
          )
        );
    
        const url = new URL(
          `${API_CONFIG.BASE_URL}/rate/currencies/${coinId}/rates/`
        );
        
        url.searchParams.set('start_date', toUTC(start).toISOString());
        url.searchParams.set('end_date', toUTC(end).toISOString());

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
    seriesType: 'line',
    legend: { position: "bottom" },
    series: {
      0: { 
        type: 'line',
        color: COLOR_SCHEMES[colorScheme][0], 
        lineWidth: 2,
        targetAxisIndex: 0
      },
      1: { 
        type: 'line',
        color: COLOR_SCHEMES[colorScheme][1], 
        lineDashStyle: [4, 4],
        targetAxisIndex: 0
      },
      2: { 
        type: 'line',
        color: COLOR_SCHEMES[colorScheme][2], 
        lineDashStyle: [2, 2],
        targetAxisIndex: 0
      },
      3: { 
        type: 'scatter',
        color: COLOR_SCHEMES[colorScheme][3],
        pointSize: 6,
        targetAxisIndex: 0
      }
    },
    hAxis: { 
      title: 'Время',
      format: getTimeFormat(timeRange), // Динамический формат
      gridlines: { count: -1 }
    },
    vAxes: {
      0: { 
        title: 'Цена (RUB)', 
        minValue: 0,
        format: '####.##'
      }
    },
    chartArea: {
      left: 90,
      top: 40,    
      bottom: 60, 
      width: '85%', 
      height: '70%' 
    },
    explorer: {
      actions: ['dragToZoom', 'rightClickToReset'],
      axis: 'horizontal',
      keepInBounds: false, // Разрешаем выход за пределы данных
      maxZoomIn: 0.1,     // Максимальное приближение
      maxZoomOut: 10,     // Максимальное отдаление
      zoomDelta: 1.5      // Чувствительность зума
    },
    crosshair: {
      color: '#000',      // Линия при наведении
      orientation: 'both' // Вертикальная+горизонтальная
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
          chartType="ComboChart"
          width="100%"
          height="500px"
          data={chartData}
          options={options}
        />
      )}
    </div>
  );
}