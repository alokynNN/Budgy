import React, { useEffect, useState } from 'react'
import { Wallet, TrendingUp, Shield } from 'lucide-react'

const SplashScreen: React.FC = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 25)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-screen flex items-center justify-center overflow-hidden bg-transparent">
      <div className="w-[680px] h-[480px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 animate-fade-in">
          {/* Logo */}
          <div className="mb-10 relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-gradient"></div>
              <Wallet className="w-16 h-16 text-white relative z-10" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-4 border-slate-950 animate-pulse"></div>
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              Budgy
            </span>
          </h1>
          
          <p className="text-blue-300/90 text-xl mb-12 font-medium">
            Your Personal Finance Manager
          </p>

          {/* Features */}
          <div className="flex items-center justify-center space-x-10 mb-12">
            <div className="flex items-center space-x-2 text-slate-400">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">Track Income</span>
            </div>
            <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium">Secure</span>
            </div>
            <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Wallet className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium">Easy Budget</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-80">
            <div className="w-full h-2 bg-slate-800/50 backdrop-blur-sm rounded-full overflow-hidden border border-slate-700/30">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/50"
                style={{ 
                  width: `${progress}%`,
                  backgroundSize: '200% 100%',
                  animation: 'gradient 2s ease infinite'
                }}
              ></div>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-slate-500 text-sm font-medium">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen