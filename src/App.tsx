import { useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Expenses from './components/Expenses'
import Income from './components/Income'
import Savings from './components/Savings'
import Settings from './components/Settings'
import { useStore } from './store/useStore'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const loadFromFile = useStore((state) => state.loadFromFile)

  useEffect(() => {
    loadFromFile()
    
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [loadFromFile])

  useEffect(() => {
    if (window.location.hash === '#/splash') {
      setShowSplash(true)
    }
  }, [])

  if (showSplash || window.location.hash === '#/splash') {
    return <SplashScreen />
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />
      case 'expenses': return <Expenses />
      case 'income': return <Income />
      case 'savings': return <Savings />
      case 'settings': return <Settings />
      default: return <Dashboard />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {renderView()}
        </main>
      </div>
    </div>
  )
}

export default App