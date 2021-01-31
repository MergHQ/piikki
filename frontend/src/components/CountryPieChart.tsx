import { h } from 'harmaja'
import { Summary } from '../../../shared/area-administration'
import { ChartData } from 'chart.js'
import chartColors from './chartColors'
import { Doughnut } from '../util/chart-js-wrapper'
import * as L from 'lonna'

type Props = {
  totalVaccinatees: number
  summary: L.Property<Summary>
}

const toChartData = (totalVaccinatees: number) => (summary: Summary): ChartData => ({
  labels: ['Vaccinated', 'Not vaccinated'],
  datasets: [
    {
      data: [summary.totalShots, totalVaccinatees - summary.totalShots],
      backgroundColor: ['rgba(54, 162, 235, 0.5)', ...chartColors],
      borderWidth: 0,
    },
  ],
})

export default ({ summary, totalVaccinatees }: Props) => (
  <div className="data-container">
    <h2 className="data-container__title">Current vaccine situation</h2>
    {summary.pipe(
      L.map(toChartData(totalVaccinatees)),
      L.map(data => <Doughnut data={data} />)
    )}
  </div>
)
