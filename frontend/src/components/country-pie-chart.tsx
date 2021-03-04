import { h } from 'harmaja'
import { Summary } from '../../../shared/area-administration'
import { ChartData, ChartOptions } from 'chart.js'
import chartColors from './chart-colors'
import { HorizontalBar } from '../util/chart-js-wrapper'
import * as L from 'lonna'
import * as FS from '../util/fetch-status'
import LoadingSpinner from './loading-spinner'

type Props = {
  totalVaccinatees: number
  summary: L.Property<FS.FetchStatus<Summary>>
}

const toChartData = (totalVaccinatees: number) =>
  FS.map<Summary, ChartData>(summary => ({
    labels: ['First dose', 'Second dose'],
    datasets: [
      {
        label: 'Dose given',

        data: [
          summary.totalFirstDoseShots,
          summary.totalSecondDoseShots,
          totalVaccinatees - summary.totalFirstDoseShots,
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderWidth: 0,
      },
      {
        label: 'Dose not given',
        data: [
          totalVaccinatees - summary.totalFirstDoseShots,
          totalVaccinatees - summary.totalSecondDoseShots,
        ],
        backgroundColor: 'rgba(165, 0, 38, 1)',
        borderWidth: 0,
      },
    ],
  }))

const percentLabel = (total: number) => (
  item: Chart.ChartTooltipItem,
  data: ChartData
) => {
  const dataset = data.datasets[item.datasetIndex]
  const perc = ((Number(dataset.data[item.index]) / total) * 100).toFixed(2)
  return `(${perc}%)`
}

const options = (totalVaccinatees: number): ChartOptions => ({
  tooltips: {
    callbacks: {
      afterLabel: percentLabel(totalVaccinatees),
    },
  },
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
            <HorizontalBar
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
