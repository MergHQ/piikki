import axios from 'axios'
import { AreaAdministration, Summary } from '../../../shared/area-administration'

const client = axios.create({
  baseURL: 'https://piikki-api.lab.juiciness.io',
})

export const getSummary = (): Promise<Summary | null> =>
  client.get<Summary>('/administrations/summary').then(res => res.data)

export const getAdministrations = () =>
  client.get<AreaAdministration[]>('/administrations').then(res => res.data)
