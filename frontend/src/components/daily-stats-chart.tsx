import { h } from 'harmaja'
import { AreaAdministration } from '../../../shared/area-administration'
import { ChartData } from 'chart.js'
import { getWithIdx } from './chart-colors'
import { startOfDay, format, startOfWeek, sub, add, isSameWeek, isAfter } from 'date-fns'
import * as R from 'ramda'
import { Bar } from '../util/chart-js-wrapper'
import * as L from 'lonna'
import './week-selector.css'
import * as FS from '../util/fetch-status'
import LoadingSpinner from './loading-spinner'

type Props = {
  administrations: L.Property<FS.FetchStatus<AreaAdministration[]>>
}

type Combined = {
  administrationsStatus: FS.FetchStatus<AreaAdministration[]>
  selectedWeek: Date
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

const toChartData = FS.map<AreaAdministration[], ChartData>(administrations => {
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
})

const applyWeekFilter = ({
  administrationsStatus,
  selectedWeek,
}: Combined): FS.FetchStatus<AreaAdministration[]> =>
  FS.map((administrations: AreaAdministration[]) =>
    administrations.map(({ shotHistory, ...rest }) => ({
      ...rest,
      shotHistory: shotHistory.filter(({ date }) =>
        isSameWeek(selectedWeek, new Date(date), { weekStartsOn: 1 })
      ),
    }))
  )(administrationsStatus)

const isWeekDisabled = (d: Date) => isAfter(d, startOfWeek(new Date()))

const selectedWeek = L.atom(startOfWeek(new Date()))
const disableNextWeek = selectedWeek.pipe(
  L.map<Date, boolean>(d => isWeekDisabled(add(d, { weeks: 1 })))
)

const handleWeekChange = (op: 'add' | 'sub') => (_: unknown) => {
  switch (op) {
    case 'add':
      const selected = selectedWeek.get()
      const nextWeek = add(selected, { weeks: 1 })
      if (!isWeekDisabled(nextWeek)) {
        selectedWeek.set(nextWeek)
      }
      break
    case 'sub':
      selectedWeek.modify(d => sub(d, { weeks: 1 }))
      break
    default:
      console.warn('Unkown op', op)
  }
}

const WeekSelector = () => (
  <div className="week-selector-controls">
    <button className="week-selector__button" onClick={handleWeekChange('sub')}>
      ᐊ
    </button>
    <p>{L.view(selectedWeek, ts => `Week ${format(ts, 'w yyyy')}`)}</p>
    {L.view(disableNextWeek, disabled => (
      <button
        className="week-selector__button"
        disabled={disabled}
        onClick={handleWeekChange('add')}
      >
        ᐅ
      </button>
    ))}
  </div>
)

export default ({ administrations }: Props) => (
  <div className="data-container">
    <h2 className="data-container__title">Daily vaccinations administered per area</h2>
    <WeekSelector />
    {L.combineTemplate({
      administrationsStatus: administrations,
      selectedWeek,
    }).pipe(
      L.map<Combined, FS.FetchStatus<AreaAdministration[]>>(applyWeekFilter),
      L.map(toChartData),
      L.map(
        FS.fold(
          () => <LoadingSpinner />,
          () => <p>Error loading data.</p>,
          data => <Bar data={data} options={options} />
        )
      )
    )}
  </div>
)
