import { useState, useEffect } from 'react'
import { PlusCircle, Trash2, ChevronRight, ChevronLeft, CheckCircle, ExternalLink } from 'lucide-react'
import { fetchEventInfo, submitRegistration } from '../api'
import CustomField from '../components/CustomField'
import StepIndicator from '../components/StepIndicator'
import type { AgeCategory, CustomFieldDef, EventInfo, FormData, Member } from '../types'

// ── Constants ─────────────────────────────────────────────────────────────────

const AGE_CATEGORIES: { value: AgeCategory; eng: string; chn: string; color: string }[] = [
  { value: 'ADULT', eng: 'Adult',  chn: '成人',   color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'YOUTH', eng: 'Youth',  chn: '青少年',  color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'K5',    eng: 'K – 5',  chn: '幼小',   color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'PREK',  eng: 'Pre-K',  chn: '幼兒',   color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'BABY',  eng: '0 – 2',  chn: '嬰兒',   color: 'bg-pink-100 text-pink-800 border-pink-300' },
]

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

const newMember = (lastName = ''): Member => ({
  id: crypto.randomUUID(),
  firstName: '', lastName, chineseName: '',
  ageCategory: 'ADULT', shirtSize: '', dietaryNotes: '',
})

const emptyForm = (): FormData => ({
  contactFirstName: '', contactLastName: '', contactChineseName: '',
  email: '', phone: '', address: '', city: '', state: '', zip: '',
  church: '', members: [newMember()], customFieldValues: {},
})

// ── Input helper ──────────────────────────────────────────────────────────────

function Field({ label, chn, children }: { label: string; chn?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{chn && <span className="ml-1 text-gray-400">{chn}</span>}
      </label>
      {children}
    </div>
  )
}

const inp = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"

// ── Component ─────────────────────────────────────────────────────────────────

export default function Register() {
  const [step, setStep] = useState(1)
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null)
  const [eventError, setEventError] = useState('')
  const [form, setForm] = useState<FormData>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<{ familyName: string; memberNames: string[]; eventName: string } | null>(null)

  useEffect(() => {
    fetchEventInfo()
      .then(info => {
        setEventInfo(info)
        // Pre-fill church if event has a default (could extend API later)
      })
      .catch(() => setEventError('No active event found. Please contact the administrator.'))
  }, [])

  const cfg = eventInfo?.registrationConfig

  // Parse custom fields JSON from backend
  const customFieldDefs: CustomFieldDef[] = (() => {
    if (!cfg?.customFields) return []
    try { return JSON.parse(cfg.customFields) } catch { return [] }
  })()

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setContact = (field: keyof FormData, value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  const setMember = (id: string, field: keyof Member, value: string) =>
    setForm(f => ({ ...f, members: f.members.map(m => m.id === id ? { ...m, [field]: value } : m) }))

  const addMember = () =>
    setForm(f => ({ ...f, members: [...f.members, newMember(f.contactLastName)] }))

  const removeMember = (id: string) =>
    setForm(f => ({ ...f, members: f.members.filter(m => m.id !== id) }))

  const setCustomField = (id: string, value: string) =>
    setForm(f => ({ ...f, customFieldValues: { ...f.customFieldValues, [id]: value } }))

  const step1Valid = form.contactFirstName.trim() && form.contactLastName.trim()
  const step2Valid = form.members.length > 0 &&
    form.members.every(m => m.firstName.trim() && m.lastName.trim() && m.ageCategory)

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await submitRegistration(form)
      setResult({ familyName: res.familyName, memberNames: res.memberNames, eventName: res.eventName })
    } catch (e: any) {
      setSubmitError(e.response?.data?.error ?? 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success ────────────────────────────────────────────────────────────────

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-8 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={56} />
          <h1 className="text-2xl font-bold text-gray-800 mb-1">報名成功！Registration Complete!</h1>
          <p className="text-gray-500 mb-6">{result.eventName}</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              {result.familyName} — {result.memberNames.length} member{result.memberNames.length !== 1 ? 's' : ''}
            </p>
            <ul className="space-y-1">
              {result.memberNames.map((name, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                  {name}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Your registration has been received. Staff will follow up with further details.
          </p>
          <a href="https://goodvessel.net/retreat/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
            <ExternalLink size={14} /> Admin portal: goodvessel.net/retreat/
          </a>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (eventError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-md">
          <p className="text-red-500 font-medium">{eventError}</p>
        </div>
      </div>
    )
  }

  // ── Main form ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-start justify-center p-4 pt-8">
      <div className="bg-white rounded-2xl shadow-lg max-w-xl w-full overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <p className="text-blue-200 text-sm font-medium mb-1">{eventInfo?.name ?? '…'}</p>
          <h1 className="text-xl font-bold">活動報名 Event Registration</h1>
        </div>

        <StepIndicator step={step} />

        <div className="p-6 space-y-4">

          {/* ── Step 1: Contact ── */}
          {step === 1 && (
            <>
              <p className="text-sm text-gray-500">
                請填寫家庭聯繫資料。* 為必填。<br />
                Please provide family contact info. * = required.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name *" chn="名字"><input className={inp} value={form.contactFirstName} onChange={e => setContact('contactFirstName', e.target.value)} placeholder="First" /></Field>
                <Field label="Last Name *" chn="姓氏"><input className={inp} value={form.contactLastName} onChange={e => setContact('contactLastName', e.target.value)} placeholder="Last" /></Field>
              </div>

              <Field label="Chinese Name" chn="中文名">
                <input className={inp} value={form.contactChineseName} onChange={e => setContact('contactChineseName', e.target.value)} placeholder="中文姓名（選填）" />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" chn="電郵"><input type="email" className={inp} value={form.email} onChange={e => setContact('email', e.target.value)} placeholder="email@example.com" /></Field>
                <Field label="Phone" chn="電話"><input type="tel" className={inp} value={form.phone} onChange={e => setContact('phone', e.target.value)} placeholder="(xxx) xxx-xxxx" /></Field>
              </div>

              <Field label="Address" chn="地址">
                <input className={inp} value={form.address} onChange={e => setContact('address', e.target.value)} placeholder="Street address" />
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <Field label="City" chn="城市"><input className={inp} value={form.city} onChange={e => setContact('city', e.target.value)} placeholder="City" /></Field>
                </div>
                <Field label="State" chn="州"><input className={inp} value={form.state} onChange={e => setContact('state', e.target.value.slice(0,2).toUpperCase())} placeholder="CA" maxLength={2} /></Field>
                <Field label="Zip" chn="郵編"><input className={inp} value={form.zip} onChange={e => setContact('zip', e.target.value)} placeholder="00000" maxLength={10} /></Field>
              </div>

              {cfg?.showChurch && (
                <Field label="Church" chn="教會">
                  <input className={inp} value={form.church} onChange={e => setContact('church', e.target.value)} placeholder="e.g. CNSCCC" />
                </Field>
              )}

              {/* Custom fields that belong at the family level */}
              {customFieldDefs.filter(f => f.id.startsWith('family_')).map(field => (
                <CustomField key={field.id} field={field}
                  value={form.customFieldValues[field.id] ?? ''}
                  onChange={setCustomField} />
              ))}
            </>
          )}

          {/* ── Step 2: Members ── */}
          {step === 2 && (
            <>
              <p className="text-sm text-gray-500">
                請為每位參加者填寫資料。<br />
                Add each person attending the event.
              </p>

              <div className="space-y-3">
                {form.members.map((member, idx) => (
                  <div key={member.id} className="border rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-500">成員 Member {idx + 1}</span>
                      {form.members.length > 1 && (
                        <button onClick={() => removeMember(member.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input className={`${inp} bg-white`} value={member.firstName} onChange={e => setMember(member.id, 'firstName', e.target.value)} placeholder="First Name *" />
                      <input className={`${inp} bg-white`} value={member.lastName} onChange={e => setMember(member.id, 'lastName', e.target.value)} placeholder="Last Name *" />
                    </div>

                    <input className={`${inp} bg-white mb-2`} value={member.chineseName} onChange={e => setMember(member.id, 'chineseName', e.target.value)} placeholder="中文名 Chinese Name（選填）" />

                    {/* Age category — shown based on config */}
                    {cfg?.showAgeCategory && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {AGE_CATEGORIES.map(cat => (
                          <button key={cat.value} type="button"
                            onClick={() => setMember(member.id, 'ageCategory', cat.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                              member.ageCategory === cat.value ? cat.color + ' shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                            }`}>
                            {cat.eng} {cat.chn}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Shirt size — shown based on config */}
                    {cfg?.showShirtSize && (
                      <div className="mb-2">
                        <label className="block text-xs text-gray-500 mb-1">T-Shirt Size 尺碼</label>
                        <div className="flex flex-wrap gap-1">
                          {SHIRT_SIZES.map(s => (
                            <button key={s} type="button"
                              onClick={() => setMember(member.id, 'shirtSize', s)}
                              className={`px-2 py-0.5 rounded text-xs border transition-all ${
                                member.shirtSize === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                              }`}>{s}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dietary notes — shown based on config */}
                    {cfg?.showDietary && (
                      <textarea className={`${inp} bg-white`} rows={2}
                        value={member.dietaryNotes}
                        onChange={e => setMember(member.id, 'dietaryNotes', e.target.value)}
                        placeholder="Dietary restrictions / allergies 飲食限制" />
                    )}

                    {/* Per-member custom fields */}
                    {customFieldDefs.filter(f => !f.id.startsWith('family_')).map(field => (
                      <div key={field.id} className="mt-2">
                        <CustomField field={field}
                          value={form.customFieldValues[`${member.id}_${field.id}`] ?? ''}
                          onChange={(id, val) => setCustomField(`${member.id}_${id}`, val)} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <button onClick={addMember}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium">
                <PlusCircle size={16} /> 新增成員 Add Member
              </button>
            </>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <>
              <p className="text-sm text-gray-500">
                請確認後提交。Review and submit.
              </p>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">聯繫人 Contact</p>
                <p className="font-medium text-gray-800">
                  {form.contactFirstName} {form.contactLastName}
                  {form.contactChineseName && <span className="ml-2 text-gray-500">{form.contactChineseName}</span>}
                </p>
                {form.email   && <p className="text-sm text-gray-600">{form.email}</p>}
                {form.phone   && <p className="text-sm text-gray-600">{form.phone}</p>}
                {form.address && <p className="text-sm text-gray-600">{form.address}{form.city && `, ${form.city}`}{form.state && `, ${form.state}`}{form.zip && ` ${form.zip}`}</p>}
                {form.church  && <p className="text-sm text-gray-600">⛪ {form.church}</p>}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">成員 Members ({form.members.length})</p>
                <div className="space-y-2">
                  {form.members.map(m => {
                    const cat = AGE_CATEGORIES.find(c => c.value === m.ageCategory)
                    return (
                      <div key={m.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-800">
                          {m.firstName} {m.lastName}
                          {m.chineseName && <span className="ml-2 text-gray-400 text-xs">{m.chineseName}</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          {m.shirtSize && <span className="text-xs text-gray-400">{m.shirtSize}</span>}
                          {cat && cfg?.showAgeCategory && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${cat.color}`}>{cat.eng}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{submitError}</div>
              )}
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            {step > 1
              ? <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">
                  <ChevronLeft size={16} /> 上一步 Back
                </button>
              : <div />}

            {step < 3
              ? <button onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 ? !step1Valid : !step2Valid}
                  className="flex items-center gap-1 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  下一步 Next <ChevronRight size={16} />
                </button>
              : <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {submitting ? '提交中…' : '✓ 提交報名 Submit'}
                </button>}
          </div>
        </div>
      </div>
    </div>
  )
}
