import { h, Fragment } from 'harmaja'
import AdministrationPieChart from './components/country-pie-chart'
import AreasPieChart from './components/areas-pie-chart'
import Footer from './components/Footer'
import DailyStatsChart from './components/daily-stats-chart'
import { AppProps } from './stores/app-store'
import AgeGroupsPieChart from './components/age-groups-pie-chart'

export default ({
  summary,
  totalVaccinatees,
  areaAdministrations,
  ageGroupAdministrations,
}: AppProps) => (
  <>
    <div className="container">
      <h1>COVID-19 vaccinations in 🇫🇮</h1>
      <AdministrationPieChart summary={summary} totalVaccinatees={totalVaccinatees} />
      <AreasPieChart summary={summary} />
      <AgeGroupsPieChart ageGroupAdministrations={ageGroupAdministrations} />
      <DailyStatsChart administrations={areaAdministrations} />
    </div>
    <Footer></Footer>
  </>
)
