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

/** A meal the form can offer — present only when showMeals is on. */
export interface MealOption {
  id: number
  day: number
  type: string          // BREAKFAST | LUNCH | DINNER | SNACK | BANQUET
  date: string | null   // YYYY-MM-DD
}

/** One registered member as returned by POST /register — scanCode is what their badge QR carries. */
export interface RegisteredMember {
  name: string
  personId: number
  scanCode: string
}

export interface EventInfo {
  id: number
  name: string
  type: string
  registrationConfig: RegistrationConfig
  meals?: MealOption[]
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
  /** Chosen meal ids; null = not yet touched, which means every offered meal */
  mealIds: number[] | null
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
  /** Explicit, separate SMS opt-in. Carriers require consent to be its own
   *  unchecked action, never bundled into another agreement. */
  smsConsent: boolean
  /** Acceptance of Terms of Service and Privacy Policy. Kept separate from
   *  smsConsent: bundling the two is independently disqualifying for carriers. */
  termsAccepted: boolean
}
