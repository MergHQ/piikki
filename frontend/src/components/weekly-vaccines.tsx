import { h } from 'harmaja'
import { AreaAdministration, ShotEntry } from '../../../shared/area-administration'
import { ChartData } from 'chart.js'
import { getWithIdx } from './chart-colors'
import { Bar } from '../util/chart-js-wrapper'
import * as L from 'lonna'
import * as FS from '../util/fetch-status'
import LoadingSpinner from './loading-spinner'
import * as R from 'remeda'
import { format } from 'date-fns'

type Props = {
  administrations: L.Property<FS.FetchStatus<AreaAdministration[]>>
}

const sum = R.reduce<number, number>((p, c) => p + c, 0)

const currentWeek = format(new Date(), 'w.Y')

const groupedByWeek = (x0: ShotEntry[]) =>
  R.pipe(
    x0,
    R.groupBy(({ date }) => format(new Date(date), 'w.Y')),
    R.mapValues((shots, k) => ({
      firstShots: sum(shots.map(({ firstDoseShots }) => firstDoseShots)),
      secondShots: sum(shots.map(({ secondDoseShots }) => secondDoseShots)),
      week: k,
    })),
    v => Object.values(v)
  )

const toChartData = (admnstr: FS.FetchStatus<AreaAdministration[]>) =>
  R.pipe(
    admnstr,
    FS.map(R.flatMap(a => a.shotHistory)),
    FS.map(groupedByWeek),
    FS.map(data => ({
      labels: data.map(
        ({ week }) => `Week ${week === currentWeek ? '(current)' : ''} ${week}`
      ),
      datasets: [
        {
          label: 'First shots',
          data: data.map(({ firstShots }) => firstShots),
          backgroundColor: getWithIdx(10),
          tension: 0.1,
          fill: false,
        },
        {
          label: 'Second shots',
          data: data.map(({ secondShots }) => secondShots),
          backgroundColor: getWithIdx(12),
          tension: 0.1,
          fill: false,
        },
      ],
    }))
  )

export default ({ administrations }: Props) => {
  return (
    <div className="data-container">
      <h2 className="data-container__title">Shots given per week</h2>
      {administrations.pipe(
        L.map(toChartData),
        L.map(
          FS.fold(
            () => <LoadingSpinner />,
            () => <p>Error loading data.</p>,
            data => <Bar data={data} />
          )
        )
      )}
    </div>
  )
}
