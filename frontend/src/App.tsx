import { h, Fragment } from 'harmaja'
import AdministrationPieChart from './components/CountryPieChart'
import AreasPieChart from './components/AreasPieChart'
import Footer from './components/Footer'
import DailyStatsChart from './components/DailyStatsChart'
import { AppProps } from './stores/appStore'

export default ({ summary, totalVaccinatees, administrations }: AppProps) => (
  <>
    <div className="container">
      <h1>COVID-19 vaccinations in 🇫🇮</h1>
      <AdministrationPieChart summary={summary} totalVaccinatees={totalVaccinatees} />
      <AreasPieChart summary={summary} />
      <DailyStatsChart administrations={administrations} />
    </div>
    <Footer></Footer>
  </>
)
