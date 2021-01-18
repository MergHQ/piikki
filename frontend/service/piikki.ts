import axios from 'axios'
import { AreaAdministration, Summary } from '../../shared/area-administration'

const client = axios.create({
  baseURL: 'https://piikki-api.lab.juiciness.io',
})

export const getSummary = () =>
  client
    .get<Summary>('/administrations/summary')
    .then(res => res.data)
    .catch(e => {
      console.error(e)
      return null
    })

export const getAdministrations = () =>
  client
    .get<AreaAdministration[]>('/administrations')
    .then(res => res.data)
    .catch(e => {
      console.error(e)
      return []
    })
