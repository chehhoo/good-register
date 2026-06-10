export type AgeCategory = 'ADULT' | 'YOUTH' | 'K5' | 'PREK' | 'BABY'
export type Gender = 'M' | 'F' | 'O'

export interface CustomFieldDef {
  id: string
  label: string
  labelChn?: string
  type: 'text' | 'select' | 'checkbox' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: string[]   // for type = 'select'
}

export interface RegistrationConfig {
  showAgeCategory: boolean
  showMeals: boolean
  mealDays: number
  showLodging: boolean
  showWorkshops: boolean
  showShirtSize: boolean
  showDietary: boolean
  requireEmergencyContact: boolean
  showChurch: boolean
  customFields: string | null  // raw JSON from backend
}

export interface EventInfo {
  id: number
  name: string
  type: string
  registrationConfig: RegistrationConfig
}

export interface Member {
  id: string
  firstName: string
  lastName: string
  chineseName: string
  gender: Gender | ''
  ageCategory: AgeCategory
  /** Exact age for non-adult categories ('' = not selected) */
  exactAge: string
  shirtSize: string
  email: string
  mobilePhone: string
  dietaryNotes: string
}

export interface FormData {
  contactFirstName: string
  contactLastName: string
  contactChineseName: string
  email: string
  mobilePhone: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  church: string
  members: Member[]
  customFieldValues: Record<string, string>
}
