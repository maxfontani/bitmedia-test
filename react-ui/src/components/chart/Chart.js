import React from 'react'
import CanvasJSReact from '../../assets/canvasjs.react'
// import { format } from 'date-fns'

export default function Chart({ chartDataRaw, chartType }) {

  const DEFAULT_DATA = [
    { x: new Date("2019-10-31"), y: 0 },
    { x: new Date("2019-11-01"), y: 0 },
    { x: new Date("2019-11-02"), y: 0 },
    { x: new Date("2019-11-03"), y: 0 },
    { x: new Date("2019-11-04"), y: 0 },
    { x: new Date("2019-11-05"), y: 0 },
    { x: new Date("2019-11-06"), y: 0 }
  ]

  function sortChartData(dataRaw, type) {
    if (!dataRaw) return Array(0)
    const dataSorted = dataRaw.map(obj => ({x: new Date(obj.day), y: obj[type]}))
    return dataSorted
  }

  const chartDataSorted = sortChartData(chartDataRaw, chartType)
  const CanvasJSChart = CanvasJSReact.CanvasJSChart
  const CanvasJS = CanvasJSReact.CanvasJS
  const options = {
    animationEnabled: true,
    exportEnabled: true,
    theme: "light2", // "light1", "dark1", "dark2"
    title:{
      text: chartType === "page_views" ? "Total Page Views" : "Total Clicks"
    },

    axisX: {
			labelFormatter: function (e) {
				return CanvasJS.formatDate(e.value, "DD MMM")}
			},
    data: [{
      type: "spline",
      toolTipContent: "Day {x}: {y}",
      dataPoints: 
      chartDataSorted.length 
        ? chartDataSorted
        : DEFAULT_DATA
    }]
  }

    return (
      <div className="charts">
        <CanvasJSChart options = {options} />
      </div>
    )
  }