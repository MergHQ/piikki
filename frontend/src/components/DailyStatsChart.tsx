import { h } from 'harmaja'
import { AreaAdministration } from '../../../shared/area-administration'
import { ChartData } from 'chart.js'
import { getWithIdx } from './chartColors'
import { startOfDay, format } from 'date-fns'
import * as R from 'ramda'
import { Bar } from '../util/chart-js-wrapper'
import * as L from 'lonna'

type Props = {
  administrations: L.Property<AreaAdministration[]>
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

const toChartData = (administrations: AreaAdministration[]): ChartData => {
  const labels = R.pipe(
    (x0: AreaAdministration[]) => x0.flatMap(({ shotHistory }) => shotHistory),
    R.map(({ date }) => format(startOfDay(new Date(date)), 'd.M.yyyy')),
    R.uniq
  )

  return {
    labels: labels(administrations),
    datasets: administrations.map(({ shotHistory, areaName }, i) => ({
      label: areaName,
      data: shotHistory.map(({ shots }) => shots),
      backgroundColor: getWithIdx(i),
      borderWidth: 0,
    })),
  }
}

export default ({ administrations }: Props) => (
  <div className="data-container">
    <h2 className="data-container__title">Daily vaccinations administered per area</h2>
    {administrations.pipe(
      L.map(toChartData),
      L.map(data => <Bar data={data} options={options} />)
    )}
  </div>
)
