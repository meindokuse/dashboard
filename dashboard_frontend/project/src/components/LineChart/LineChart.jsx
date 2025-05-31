import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
import { DndContext, useDraggable } from "@dnd-kit/core";
import "chartjs-adapter-date-fns";
import "./LineChart.css";
import { API_CONFIG } from "../../config/config";
import { useParams } from "react-router-dom";

Chart.register(zoomPlugin);

const COLOR_SCHEMES = {
  default: ["#3366cc", "#dc3912", "#ff9900", "#FF0000"],
  colorblind: ["#000000", "#E69F00", "#56B4E9", "#FF0000"],
};

const getRangeTitle = (range, startDate, endDate) => {
  if (range === "custom") {
    return `с ${startDate.toLocaleString()} по ${endDate.toLocaleString()}`;
  }
  const titles = {
    "5m": "5 минут",
    "15m": "15 минут",
    "30m": "30 минут",
    "1h": "1 час",
    "1d": "1 день",
    "1m": "1 месяц",
    "1y": "1 год",
  };
  return titles[range] || range;
};

const calculateDateRange = (range) => {
  const now = new Date();
  const ranges = {
    "5m": () => new Date(now - 5 * 60 * 1000),
    "15m": () => new Date(now - 15 * 60 * 1000),
    "30m": () => new Date(now - 30 * 60 * 1000),
    "1h": () => new Date(now - 60 * 60 * 1000),
    "1d": () => new Date(now - 24 * 60 * 60 * 1000),
    "1m": () => new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
    "1y": () => new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
  };
  return { start: ranges[range](), end: now };
};

const getTimeFormat = (start, end) => {
  const duration = (end - start) / 1000;
  if (duration <= 60 * 60) return "HH:mm:ss";
  if (duration <= 24 * 60 * 60) return "HH:mm";
  if (duration <= 30 * 24 * 60 * 60) return "dd.MM.yyyy";
  return "MM.yyyy";
};

const processData = (rates, stats) => {
  const prices = rates.map((item) => Number(item.rate));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const outliers = new Set(stats?.outliers?.map(Number) || []);

  return {
    labels: rates.map((item) => new Date(item.timestamp)),
    datasets: [
      {
        label: "Цена",
        data: rates.map((item) => Number(item.rate)),
        borderColor: COLOR_SCHEMES.default[0],
        backgroundColor: COLOR_SCHEMES.default[0] + "33",
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
      {
        label: "Среднее",
        data: rates.map(() => Number(stats?.mean || 0)),
        borderColor: COLOR_SCHEMES.default[1],
        borderDash: [4, 4],
        fill: false,
        pointRadius: 0,
      },
      {
        label: "Медиана",
        data: rates.map(() => Number(stats?.median || 0)),
        borderColor: COLOR_SCHEMES.default[2],
        borderDash: [2, 2],
        fill: false,
        pointRadius: 0,
      },
      {
        label: "Выбросы",
        data: rates.map((item) =>
          outliers.has(Number(item.rate)) ? Number(item.rate) : null
        ),
        borderColor: COLOR_SCHEMES.default[3],
        backgroundColor: COLOR_SCHEMES.default[3],
        pointRadius: 6,
        pointStyle: "circle",
        showLine: false,
      },
    ],
    minPrice,
    maxPrice,
  };
};

function DraggableChart({ children }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "draggable-chart",
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : {};

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

export default function LineChart() {
  const { coinId } = useParams();
  const [rangeType, setRangeType] = useState("preset");
  const [timeRange, setTimeRange] = useState("1h");
  const [customStart, setCustomStart] = useState(
    new Date(new Date().setHours(new Date().getHours() - 1))
  );
  const [customEnd, setCustomEnd] = useState(new Date());
  const [colorScheme, setColorScheme] = useState("default");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let start, end;
        if (rangeType === "preset") {
          ({ start, end } = calculateDateRange(timeRange));
        } else {
          start = customStart;
          end = customEnd;
        }

        const toUTC = (date) =>
          new Date(
            Date.UTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours(),
              date.getMinutes(),
              date.getSeconds()
            )
          );
        const url = new URL(`${API_CONFIG.BASE_URL}/rate/currencies/${coinId}/rates/`);
        url.searchParams.set("start_date", toUTC(start).toISOString());
        url.searchParams.set("end_date", toUTC(end).toISOString());

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        const { rates, statistics } = await response.json();
        setChartData(processData(rates, statistics));
      } catch (err) {
        setError(err.message);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [rangeType, timeRange, customStart, customEnd, coinId]);

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets.map((dataset) => ({
          ...dataset,
          borderColor: COLOR_SCHEMES[colorScheme][dataset.label === "Цена" ? 0 : dataset.label === "Среднее" ? 1 : dataset.label === "Медиана" ? 2 : 3],
          backgroundColor: COLOR_SCHEMES[colorScheme][dataset.label === "Цена" ? 0 : dataset.label === "Среднее" ? 1 : dataset.label === "Медиана" ? 2 : 3] + (dataset.label === "Цена" ? "33" : ""),
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Динамика цены за ${getRangeTitle(
              rangeType === "preset" ? timeRange : "custom",
              customStart,
              customEnd
            )}`,
            font: { size: 16, family: "'Segoe UI', sans-serif" },
          },
          legend: { position: "bottom" },
          zoom: {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              drag: { enabled: true, modifierKey: "ctrl" },
              mode: "x",
            },
            pan: { enabled: true, mode: "x" },
            limits: { x: { min: "original", max: "original" } },
          },
        },
        scales: {
          x: {
            type: "time",
            time: {
              parser: "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
              displayFormats: {
                millisecond: getTimeFormat(customStart, customEnd),
                second: getTimeFormat(customStart, customEnd),
                minute: getTimeFormat(customStart, customEnd),
                hour: getTimeFormat(customStart, customEnd),
                day: getTimeFormat(customStart, customEnd),
                month: getTimeFormat(customStart, customEnd),
              },
            },
            title: { display: true, text: "Время", font: { family: "'Segoe UI', sans-serif" } },
          },
          y: {
            title: { display: true, text: "Цена (RUB)", font: { family: "'Segoe UI', sans-serif" } },
            min: chartData.minPrice * 0.95,
            max: chartData.maxPrice * 1.05,
            ticks: {
              callback: (value) => Number(value).toFixed(2), // Форматируем значения с двумя десятичными знаками
            },
          },
        },
        interaction: { mode: "nearest", intersect: false },
        elements: { line: { tension: 0.1 } },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [chartData, colorScheme, customStart, customEnd, rangeType, timeRange]);

  return (
    <DndContext>
      <DraggableChart>
        <div className="chart-container">
          <div className="controls">
            <select value={rangeType} onChange={(e) => setRangeType(e.target.value)}>
              <option value="preset">Предустановленный диапазон</option>
              <option value="custom">Пользовательский период</option>
            </select>

            {rangeType === "preset" && (
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="5m">5 минут</option>
                <option value="15m">15 минут</option>
                <option value="30m">30 минут</option>
                <option value="1h">1 час</option>
                <option value="1d">1 день</option>
                <option value="1m">1 месяц</option>
                <option value="1y">1 год</option>
              </select>
            )}

            {rangeType === "custom" && (
              <div>
                <input
                  type="datetime-local"
                  value={customStart.toISOString().slice(0, 16)}
                  onChange={(e) => setCustomStart(new Date(e.target.value))}
                  style={{ marginRight: 10 }}
                />
                <input
                  type="datetime-local"
                  value={customEnd.toISOString().slice(0, 16)}
                  onChange={(e) => setCustomEnd(new Date(e.target.value))}
                />
              </div>
            )}

            <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
              <option value="default">Стандартная схема</option>
              <option value="colorblind">Для дальтоников</option>
            </select>
          </div>

          {loading && <div className="loading">Загрузка...</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && chartData && (
            <div style={{ height: "500px", width: "100%" }}>
              <canvas ref={canvasRef} />
            </div>
          )}
        </div>
      </DraggableChart>
    </DndContext>
  );
}