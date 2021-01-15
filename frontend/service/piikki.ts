import axios from 'axios'
import { Summary } from '../../shared/area-administration'

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
