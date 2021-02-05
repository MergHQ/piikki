import { h } from 'harmaja'
import { Summary } from '../../../shared/area-administration'
import { ChartData } from 'chart.js'
import chartColors from './chartColors'
import { Doughnut } from '../util/chart-js-wrapper'
import * as L from 'lonna'
import * as FS from '../util/fetch-status'
import LoadingSpinner from './LoadingSpinner'

type Props = {
  totalVaccinatees: number
  summary: L.Property<FS.FetchStatus<Summary>>
}

const toChartData = (totalVaccinatees: number) =>
  FS.map<Summary, ChartData>(summary => ({
    labels: ['Vaccinated', 'Not vaccinated'],
    datasets: [
      {
        data: [summary.totalShots, totalVaccinatees - summary.totalShots],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', ...chartColors],
        borderWidth: 0,
      },
    ],
  }))

export default ({ summary, totalVaccinatees }: Props) => (
  <div className="data-container">
    <h2 className="data-container__title">Current vaccine situation</h2>
    {summary.pipe(
      L.map(toChartData(totalVaccinatees)),
      L.map(
        FS.fold(
          () => <LoadingSpinner />,
          () => <p>Error loading data.</p>,
          data => <Doughnut data={data} useDesktopSize={true} />
        )
      )
    )}
  </div>
)
