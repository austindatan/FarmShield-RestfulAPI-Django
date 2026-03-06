import { useState } from 'react'
import Management from './pages/Management'
import Simulated from './pages/Simulated'
import { Toaster } from '@/components/ui/sonner'

const NAV = [
  { key: 'management', label: 'Management' },
  { key: 'simulated', label: 'Simulated Data' },
]

export default function App() {
  const [tab, setTab] = useState('management')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <div className="flex items-center">
          <img src="/agritech.png" alt="AgriTech Logo" className="h-8 w-auto" />
        </div>
        <span className="text-xl font-bold text-green-700 tracking-tight">FarmShield</span>
        <span className="text-gray-300 text-sm">|</span>
        <span className="text-gray-400 text-sm">AgriTech Smart Farm Dashboard</span>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-48 bg-white border-r flex flex-col gap-1 p-3 shrink-0">
          {NAV.map(n => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors
                                ${tab === n.key
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {n.label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          {tab === 'management' && <Management />}
          {tab === 'simulated' && <Simulated />}
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  )
}
