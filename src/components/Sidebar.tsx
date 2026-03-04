import React from 'react'
import { useTranslation } from '../i18n/useTranslation'
import { 
  LayoutDashboard, 
  TrendingDown, 
  TrendingUp, 
  PiggyBank, 
  Settings,
  Wallet
} from 'lucide-react'

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { t } = useTranslation()

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
    { id: 'expenses', label: t('expenses'), icon: TrendingDown, color: 'from-red-500 to-red-600' },
    { id: 'income', label: t('income'), icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { id: 'savings', label: t('savings'), icon: PiggyBank, color: 'from-purple-500 to-purple-600' },
    { id: 'settings', label: t('settings'), icon: Settings, color: 'from-slate-500 to-slate-600' },
  ]

  return (
    <div className="w-72 bg-slate-900/50 backdrop-blur-xl h-full flex flex-col border-r border-slate-700/50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 relative">
            <Wallet className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg tracking-tight">Budget</h2>
            <p className="text-slate-400 text-xs">Financial Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg shadow-blue-500/20 scale-105'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-white/10 animate-pulse-slow"></div>
              )}
              <Icon className={`w-5 h-5 relative z-10 transition-transform duration-200 ${
                isActive ? 'scale-110' : 'group-hover:scale-110'
              }`} />
              <span className="font-medium relative z-10">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full relative z-10 animate-pulse"></div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="text-slate-500 text-xs text-center font-medium">
          v1.0.0 • Budgy
        </div>
      </div>
    </div>
  )
}

export default Sidebar