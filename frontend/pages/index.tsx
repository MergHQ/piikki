import React from 'react'
import { AreaAdministration, Summary } from '../../shared/area-administration'
import AdministrationPieChart from '../components/CountryPieChart'
import AreasPieChart from '../components/AreasPieChart'
import Footer from '../components/Footer'
import { getAdministrations, getSummary } from '../service/piikki'
import DailyStatsChart from '../components/DailyStatsChart'

type AppProps = {
  totalVaccinatees: number
  summary: Summary
  administrations: AreaAdministration[]
}

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

export const getServerSideProps = async () =>
  Promise.all([getSummary(), getAdministrations()]).then(
    ([summary, administrations]) => ({
      props: {
        totalVaccinatees: 3500000,
        summary,
        administrations,
      } as AppProps,
    })
  )
