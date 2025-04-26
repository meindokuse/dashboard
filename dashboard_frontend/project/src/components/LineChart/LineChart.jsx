// график(пока не подключен и не работает)


import React from "react";
import { Chart } from "react-google-charts";

export const data = [
  ["Время", "Цена"],
  ["2004", 1000],
  ["2005", 1170],
  ["2006", 660],
  ["2007", 1030],
];

export const options = {
  title: "График цены",
  curveType: "function",
  legend: { position: "bottom" },
  hAxis: { title: "Время" },
  vAxis: { title: "Цена" },
};

export function LineChart() {
  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Chart
        chartType="LineChart"
        width="100%"
        height="100%"
        data={data}
        options={options}
      />
    </div>
  );
}