import React from 'react'
import { Summary } from '../../shared/area-administration'
import { ChartData } from 'chart.js'
import { Doughnut } from '@reactchartjs/react-chart.js'
import chartColors from './chartColors'

type Props = {
  summary: Summary
}

export default ({ summary }: Props) => {
  const data: ChartData = {
    labels: summary.areas.map(({ areaName }) => areaName),
    datasets: [
      {
        data: summary.areas.map(({ areaTotalShots }) => areaTotalShots),
        backgroundColor: chartColors,
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="data-container">
      <h2 className="data-container__title">Vaccinated per area</h2>
      <Doughnut data={data} />
    </div>
  )
}
