import React from 'react'
import { AreaAdministration } from '../../shared/area-administration'
import { ChartData } from 'chart.js'
import { Bar } from '@reactchartjs/react-chart.js'
import chartColors, { getWithIdx } from './chartColors'
import { startOfDay, format } from 'date-fns'
import * as R from 'ramda'

type Props = {
  administrations: AreaAdministration[]
}

const options = {
  scales: {
    yAxes: [
      {
        stacked: true,
        ticks: {
          beginAtZero: true,
        },
      },
    ],
    xAxes: [
      {
        stacked: true,
      },
    ],
  },
}

export default ({ administrations }: Props) => {
  const labels = R.pipe(
    (x0: AreaAdministration[]) => x0.flatMap(({ shotHistory }) => shotHistory),
    R.map(({ date }) => format(startOfDay(new Date(date)), 'd.M.yyyy')),
    R.uniq
  )
  const data: ChartData = {
    labels: labels(administrations),
    datasets: administrations.map(({ shotHistory, areaName }, i) => ({
      label: areaName,
      data: shotHistory.map(({ shots }) => shots),
      backgroundColor: getWithIdx(i),
      borderWidth: 0,
    })),
  }

  return (
    <div className="data-container">
      <h2 className="data-container__title">Daily vaccinations administered per area</h2>
      <Bar type="bar" data={data} options={options} />
    </div>
  )
}
