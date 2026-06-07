import type { CustomFieldDef } from '../types'

interface Props {
  field: CustomFieldDef
  value: string
  onChange: (id: string, value: string) => void
}

export default function CustomField({ field, value, onChange }: Props) {
  const label = (
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {field.label}{field.labelChn && <span className="ml-1 text-gray-400">{field.labelChn}</span>}
      {field.required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )

  const base = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"

  switch (field.type) {
    case 'select':
      return (
        <div>
          {label}
          <select className={base} value={value} onChange={e => onChange(field.id, e.target.value)} required={field.required}>
            <option value="">Select…</option>
            {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      )
    case 'textarea':
      return (
        <div>
          {label}
          <textarea className={base} value={value} rows={3}
            placeholder={field.placeholder}
            onChange={e => onChange(field.id, e.target.value)}
            required={field.required} />
        </div>
      )
    case 'checkbox':
      return (
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={value === 'true'}
            onChange={e => onChange(field.id, e.target.checked ? 'true' : '')}
            className="rounded" />
          {field.label}{field.labelChn && <span className="text-gray-400">{field.labelChn}</span>}
        </label>
      )
    default: // text
      return (
        <div>
          {label}
          <input className={base} value={value}
            placeholder={field.placeholder}
            onChange={e => onChange(field.id, e.target.value)}
            required={field.required} />
        </div>
      )
  }
}
