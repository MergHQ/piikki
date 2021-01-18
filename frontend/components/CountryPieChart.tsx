import React, { useState, useEffect } from 'react'
import { Summary } from '../../shared/area-administration'
import { Doughnut } from '@reactchartjs/react-chart.js'
import { ChartData } from 'chart.js'
import chartColors from './chartColors'

type Props = {
  totalVaccinatees: number
  summary: Summary
}

export default ({ summary, totalVaccinatees }: Props) => {
  const data: ChartData = {
    labels: ['Vaccinated', 'Not vaccinated'],
    datasets: [
      {
        data: [summary.totalShots, totalVaccinatees - summary.totalShots],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', ...chartColors],
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="data-container">
      <h2 className="data-container__title">Current vaccine situation</h2>
      <Doughnut type="doughnut" data={data} />
    </div>
  )
}
