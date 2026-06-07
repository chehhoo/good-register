const STEPS = ['聯繫 Contact', '成員 Members', '確認 Review']

export default function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex border-b">
      {STEPS.map((label, i) => (
        <div key={i} className={`flex-1 py-3 text-center text-xs font-medium border-b-2 transition-colors ${
          step === i + 1
            ? 'border-blue-600 text-blue-600'
            : step > i + 1
            ? 'border-green-500 text-green-600'
            : 'border-transparent text-gray-400'
        }`}>
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs mr-1 ${
            step > i + 1 ? 'bg-green-100' : step === i + 1 ? 'bg-blue-100' : 'bg-gray-100'
          }`}>{i + 1}</span>
          {label}
        </div>
      ))}
    </div>
  )
}
