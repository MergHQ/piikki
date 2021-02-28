import { h } from 'harmaja'
import { Summary } from '../../../shared/area-administration'
import { ChartData } from 'chart.js'
import chartColors from './chart-colors'
import { Doughnut } from '../util/chart-js-wrapper'
import * as L from 'lonna'
import * as FS from '../util/fetch-status'
import LoadingSpinner from './loading-spinner'

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

const percentLabel = (total: number) => (
  item: Chart.ChartTooltipItem,
  data: ChartData
) => {
  const dataset = data.datasets[0]
  const perc = ((Number(dataset.data[item.index]) / total) * 100).toFixed(2)
  return `(${perc}%)`
}

const options = (totalVaccinatees: number) => ({
  tooltips: {
    callbacks: {
      afterLabel: percentLabel(totalVaccinatees),
    },
  },
})

export default ({ summary, totalVaccinatees }: Props) => (
  <div className="data-container">
    <h2 className="data-container__title">Current vaccine situation</h2>
    {summary.pipe(
      L.map(toChartData(totalVaccinatees)),
      L.map(
        FS.fold(
          () => <LoadingSpinner />,
          () => <p>Error loading data.</p>,
          data => (
            <Doughnut
              data={data}
              options={options(totalVaccinatees)}
              useDesktopSize={true}
            />
          )
        )
      )
    )}
  </div>
)
