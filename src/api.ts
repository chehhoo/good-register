import axios from 'axios'
import type { CustomFieldDef, EventInfo, FormData } from './types'

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

/**
 * Custom answers keyed the way staff read them in the registration note —
 * "Who invited you?" for family questions, "Mei Chen · Shirt colour" for
 * per-member ones — instead of internal field ids. Blank answers are dropped.
 */
function readableAnswers(form: FormData, defs: CustomFieldDef[]): Record<string, string> | null {
  const out: Record<string, string> = {}
  for (const d of defs) {
    const label = d.label?.trim() || d.labelChn?.trim() || d.id
    if (d.id.startsWith('family_')) {
      const v = (form.customFieldValues[d.id] ?? '').trim()
      if (v) out[label] = v
    } else {
      for (const m of form.members) {
        const v = (form.customFieldValues[`${m.id}_${d.id}`] ?? '').trim()
        if (v) out[`${m.firstName.trim()} ${m.lastName.trim()} · ${label}`] = v
      }
    }
  }
  return Object.keys(out).length > 0 ? out : null
}

/** offeredMealIds: the event's meals when the meal step is shown, else null (no meals sent). */
export async function submitRegistration(form: FormData, offeredMealIds: number[] | null,
                                         customFieldDefs: CustomFieldDef[]) {
  const payload = {
    contactFirstName:   form.contactFirstName.trim(),
    contactLastName:    form.contactLastName.trim(),
    contactChineseName: form.contactChineseName.trim() || null,
    email:   form.email.trim()   || null,
    mobilePhone: form.mobilePhone.trim() || null,
    phone:   form.phone.trim()   || null,
    address: form.address.trim() || null,
    city:    form.city.trim()    || null,
    state:   form.state.trim()   || null,
    zip:     form.zip.trim()     || null,
    church:  form.church.trim()  || null,
    // Sent even when false: an explicit refusal is itself the consent record
    // carriers expect. Ignored by the API until the backend persists it.
    smsConsent: form.smsConsent,
    // Not yet persisted server-side — no column exists. Sent so acceptance
    // is recorded the moment one is added.
    termsAccepted: form.termsAccepted,
    members: form.members.map(m => ({
      firstName:    m.firstName.trim(),
      lastName:     m.lastName.trim(),
      chineseName:  m.chineseName.trim() || null,
      gender:       m.gender || null,
      ageCategory:  m.ageCategory,
      exactAge:     m.exactAge !== '' ? Number(m.exactAge) : null,
      shirtSize:    m.shirtSize || null,
      email:        m.email.trim() || null,
      mobilePhone:  m.mobilePhone.trim() || null,
      dietaryNotes: m.dietaryNotes.trim() || null,
      mealIds:      offeredMealIds ? (m.mealIds ?? offeredMealIds) : null,
    })),
    customFieldValues: readableAnswers(form, customFieldDefs),
  }
  const res = await client.post('/register', payload)
  return res.data
}
