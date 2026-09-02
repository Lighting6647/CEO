import { useMemo, useState } from 'react'

const seedTransactions = [
  { id: 1, title: 'เงินเดือน', category: 'รายรับ', amount: 45000, type: 'income', date: '14 ส.ค. 2569', icon: 'wallet', color: 'bg-emerald-100 text-emerald-600' },
  { id: 2, title: 'ค่าอาหารกลางวัน', category: 'อาหาร', amount: 185, type: 'expense', date: '14 ส.ค. 2569', icon: 'food', color: 'bg-orange-100 text-orange-500' },
  { id: 3, title: 'Netflix', category: 'บันเทิง', amount: 419, type: 'expense', date: '13 ส.ค. 2569', icon: 'play', color: 'bg-violet-100 text-violet-600' },
  { id: 4, title: 'ค่าเดินทาง', category: 'เดินทาง', amount: 750, type: 'expense', date: '12 ส.ค. 2569', icon: 'car', color: 'bg-sky-100 text-sky-600' },
]

const formatMoney = (value) => new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value)

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    wallet: <><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H18a2 2 0 0 1 2 2v12H5.5A2.5 2.5 0 0 1 3 15.5z"/><path d="M16 10h5v5h-5a2.5 2.5 0 0 1 0-5Z"/></>,
    food: <><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 2-3 5-3 8h4v10M18 3v8"/></>,
    play: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3Z"/></>,
    car: <><path d="m5 17-1 2M19 17l1 2M3 13l2-6h14l2 6v5H3z"/><path d="M7 14h.01M17 14h.01"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    arrowUp: <path d="m7 11 5-5 5 5M12 6v12"/>,
    arrowDown: <path d="m7 13 5 5 5-5M12 18V6"/>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  }
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function StatCard({ label, amount, type }) {
  const income = type === 'income'
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${income ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
          <Icon name={income ? 'arrowDown' : 'arrowUp'} className="h-4 w-4" />
        </span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-slate-900">฿{formatMoney(amount)}</p>
      <p className={`mt-2 text-xs font-medium ${income ? 'text-emerald-600' : 'text-rose-500'}`}>{income ? '+12.5%' : '-4.2%'} จากเดือนที่แล้ว</p>
    </div>
  )
}

function App() {
  const [transactions, setTransactions] = useState(seedTransactions)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense', category: 'ทั่วไป' })

  const totals = useMemo(() => transactions.reduce((sum, item) => {
    sum[item.type] += item.amount
    return sum
  }, { income: 0, expense: 0 }), [transactions])

  const addTransaction = (event) => {
    event.preventDefault()
    const amount = Number(form.amount)
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) return
    setTransactions((current) => [{
      id: Date.now(), title: form.title.trim(), category: form.category, amount,
      type: form.type, date: 'วันนี้', icon: form.type === 'income' ? 'wallet' : 'food',
      color: form.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-500',
    }, ...current])
    setForm({ title: '', amount: '', type: 'expense', category: 'ทั่วไป' })
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><Icon name="wallet" /></div>
            <div><p className="font-bold tracking-tight">MoneyMate</p><p className="text-xs text-slate-400">จัดการเงินให้ง่ายขึ้น</p></div>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700">
            <Icon name="plus" className="h-4 w-4" /> เพิ่มรายการ
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-7"><p className="text-sm font-medium text-indigo-600">ภาพรวมการเงิน</p><h1 className="mt-1 text-3xl font-bold tracking-tight">สวัสดี, วันนี้เป็นอย่างไรบ้าง 👋</h1><p className="mt-2 text-sm text-slate-500">ติดตามทุกการใช้จ่ายของคุณได้ในที่เดียว</p></div>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-200">
            <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10" />
            <p className="text-sm text-indigo-100">ยอดเงินคงเหลือทั้งหมด</p>
            <p className="mt-3 text-4xl font-bold tracking-tight">฿{formatMoney(totals.income - totals.expense)}</p>
            <div className="mt-10 flex items-center gap-2 text-xs text-indigo-100"><span className="rounded-full bg-white/15 px-3 py-1.5">อัปเดตล่าสุด วันนี้</span></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2"><StatCard label="รายรับเดือนนี้" amount={totals.income} type="income" /><StatCard label="รายจ่ายเดือนนี้" amount={totals.expense} type="expense" /></div>
        </section>

        <section className="mt-7 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold">รายการล่าสุด</h2><p className="mt-1 text-xs text-slate-400">รายการรับและจ่ายล่าสุดของคุณ</p></div><button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">ดูทั้งหมด</button></div>
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).map((item) => <div key={item.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${item.color}`}><Icon name={item.icon} /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.category} · {item.date}</p></div>
              <p className={`text-sm font-bold ${item.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>{item.type === 'income' ? '+' : '-'}฿{formatMoney(item.amount)}</p>
            </div>)}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur sm:hidden">
        {[['home', 'หน้าหลัก'], ['list', 'รายการ'], ['chart', 'สรุป']].map(([icon, label], index) => <button key={label} className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ${index === 0 ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}><Icon name={icon} className="h-4 w-4" />{label}</button>)}
      </nav>

      {showModal && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setShowModal(false)}>
        <form onSubmit={addTransaction} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-bold">เพิ่มรายการใหม่</h2><p className="mt-1 text-sm text-slate-400">บันทึกรายรับหรือรายจ่าย</p></div><button type="button" onClick={() => setShowModal(false)} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500">✕</button></div>
          <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1">{['expense', 'income'].map((type) => <button type="button" key={type} onClick={() => setForm({ ...form, type })} className={`rounded-lg py-2 text-sm font-semibold transition ${form.type === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{type === 'expense' ? 'รายจ่าย' : 'รายรับ'}</button>)}</div>
          <label className="mb-1.5 block text-sm font-medium">ชื่อรายการ</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="เช่น ค่าอาหารกลางวัน" className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50" />
          <label className="mb-1.5 block text-sm font-medium">จำนวนเงิน (บาท)</label><input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="mb-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50" />
          <button className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700">บันทึกรายการ</button>
        </form>
      </div>}
    </div>
  )
}

export default App
