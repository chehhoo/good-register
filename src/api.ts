import axios from 'axios'
import type { EventInfo, FormData } from './types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

const client = axios.create({ baseURL: BASE })

export async function fetchEventInfo(): Promise<EventInfo> {
  const res = await client.get('/register/event-info')
  return res.data
}

export interface ChurchOption {
  id: number
  nameEng: string
  nameChn: string
  acronym: string
}

export async function fetchChurches(): Promise<ChurchOption[]> {
  const res = await client.get('/register/churches')
  return res.data
}

export async function submitRegistration(form: FormData) {
  const payload = {
    contactFirstName:   form.contactFirstName.trim(),
    contactLastName:    form.contactLastName.trim(),
    contactChineseName: form.contactChineseName.trim() || null,
    email:   form.email.trim()   || null,
    phone:   form.phone.trim()   || null,
    address: form.address.trim() || null,
    city:    form.city.trim()    || null,
    state:   form.state.trim()   || null,
    zip:     form.zip.trim()     || null,
    church:  form.church.trim()  || null,
    members: form.members.map(m => ({
      firstName:    m.firstName.trim(),
      lastName:     m.lastName.trim(),
      chineseName:  m.chineseName.trim() || null,
      gender:       m.gender || null,
      ageCategory:  m.ageCategory,
      shirtSize:    m.shirtSize || null,
      dietaryNotes: m.dietaryNotes.trim() || null,
    })),
    customFieldValues: Object.keys(form.customFieldValues).length > 0
      ? form.customFieldValues : null,
  }
  const res = await client.post('/register', payload)
  return res.data
}
