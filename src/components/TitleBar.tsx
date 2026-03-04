import React from 'react'
import { Minus, Maximize2, X } from 'lucide-react'

const TitleBar: React.FC = () => {
  const handleMinimize = () => {
    if (window.electron) {
      window.electron.minimize()
    }
  }

  const handleMaximize = () => {
    if (window.electron) {
      window.electron.maximize()
    }
  }

  const handleClose = () => {
    if (window.electron) {
      window.electron.close()
    }
  }

  return (
    <div className="h-12 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 flex items-center justify-between px-4 select-none draggable">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">B</span>
        </div>
        <div>
          <h1 className="text-white font-semibold text-sm">Budgy</h1>
        </div>
      </div>

      <div className="flex items-center space-x-1 non-draggable">
        <button
          onClick={handleMinimize}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-700/50 rounded-lg transition-colors group"
          aria-label="Minimize"
        >
          <Minus className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-700/50 rounded-lg transition-colors group"
          aria-label="Maximize"
        >
          <Maximize2 className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </button>
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center hover:bg-red-500/20 rounded-lg transition-colors group"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
        </button>
      </div>
    </div>
  )
}

export default TitleBar