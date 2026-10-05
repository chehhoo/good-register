import type { MealOption } from '../types'

const TYPE_LABEL: Record<string, string> = {
  BREAKFAST: '早餐 Breakfast',
  LUNCH:     '午餐 Lunch',
  DINNER:    '晚餐 Dinner',
  SNACK:     '點心 Snack',
  BANQUET:   '宴會 Banquet',
}
const TYPE_ORDER = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER', 'BANQUET']

function dateLabel(iso: string | null): string {
  if (!iso) return ''
  // YYYY-MM-DD alone parses as UTC midnight (the previous day in US timezones)
  return new Date(`${iso}T00:00:00`).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' })
}

/**
 * Day × meal grid for one member. `selected` is the member's chosen meal ids;
 * every meal starts selected because most attendees eat them all.
 */
export default function MealPicker({ meals, selected, onChange }: {
  meals: MealOption[]
  selected: number[]
  onChange: (mealIds: number[]) => void
}) {
  const types = TYPE_ORDER.filter(t => meals.some(m => m.type === t))
  const days  = [...new Map(meals.map(m => [`${m.day}|${m.date}`, { day: m.day, date: m.date }])).values()]
  const chosen = new Set(selected)

  const toggle = (id: number) =>
    onChange(chosen.has(id) ? selected.filter(x => x !== id) : [...selected, id])

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs text-gray-500">用餐 Meals · {selected.length}/{meals.length}</p>
        <div className="flex gap-2 text-xs">
          <button type="button" onClick={() => onChange(meals.map(m => m.id))}
            className="text-blue-600 hover:underline">全選 All</button>
          <button type="button" onClick={() => onChange([])}
            className="text-gray-500 hover:underline">清除 None</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th />
              {types.map(t => (
                <th key={t} className="px-2 pb-1 font-normal text-gray-500 whitespace-nowrap">{TYPE_LABEL[t] ?? t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(({ day, date }) => (
              <tr key={`${day}|${date}`}>
                <td className="pr-3 py-0.5 text-gray-600 whitespace-nowrap">{dateLabel(date) || `Day ${day}`}</td>
                {types.map(t => {
                  const meal = meals.find(m => m.day === day && m.date === date && m.type === t)
                  return (
                    <td key={t} className="px-2 py-0.5 text-center">
                      {meal
                        ? <input type="checkbox" className="w-4 h-4 accent-blue-600 cursor-pointer"
                            aria-label={`${dateLabel(date)} ${TYPE_LABEL[t] ?? t}`}
                            checked={chosen.has(meal.id)} onChange={() => toggle(meal.id)} />
                        : <span className="text-gray-200">—</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
