import React, { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ChevronDown
} from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Dashboard: React.FC = () => {
  const { t } = useTranslation()
  const { transactions, currentBudget, currency } = useStore()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  
  const selectedMonth = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }, [selectedDate])

  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth))
  }, [transactions, selectedMonth])

  const expenses = useMemo(() => {
    return monthTransactions.filter(t => t.type === 'expense')
  }, [monthTransactions])

  const income = useMemo(() => {
    return monthTransactions.filter(t => t.type === 'income')
  }, [monthTransactions])

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, t) => sum + t.amount, 0)
  }, [expenses])

  const totalIncome = useMemo(() => {
    return income.reduce((sum, t) => sum + t.amount, 0)
  }, [income])

  const budget = currentBudget?.totalBudget || 0
  const remaining = budget + totalIncome - totalExpenses
  const budgetPercentage = budget > 0 ? (totalExpenses / budget) * 100 : 0

  const expensesByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {}
    expenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.amount
    })
    return categories
  }, [expenses])

  const chartData = {
    labels: Object.keys(expensesByCategory).map(cat => t(`categories.${cat}`)),
    datasets: [{
      label: t('spent'),
      data: Object.values(expensesByCategory),
      backgroundColor: [
        'rgba(239, 68, 68, 0.9)',
        'rgba(249, 115, 22, 0.9)',
        'rgba(234, 179, 8, 0.9)',
        'rgba(34, 197, 94, 0.9)',
        'rgba(59, 130, 246, 0.9)',
        'rgba(168, 85, 247, 0.9)',
      ],
      borderRadius: 12,
      borderWidth: 0,
      hoverBackgroundColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(249, 115, 22, 1)',
        'rgba(234, 179, 8, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(168, 85, 247, 1)',
      ],
    }],
  }

  const budgetData = {
    labels: [t('spent'), t('remaining')],
    datasets: [{
      data: [totalExpenses, Math.max(0, remaining)],
      backgroundColor: ['rgba(239, 68, 68, 0.9)', 'rgba(34, 197, 94, 0.9)'],
      borderWidth: 0,
      hoverOffset: 20,
    }],
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const handlePreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  const handleMonthSelect = (year: number, month: number) => {
    setSelectedDate(new Date(year, month, 1))
    setShowMonthPicker(false)
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t('dashboard')}
            </h1>
            <p className="text-slate-400">{t('welcomeBack')}</p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl transition-all duration-200 flex items-center space-x-2 border border-slate-700/50 hover:border-slate-600/50"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('today')}</span>
            </button>
            
            <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
              <button
                onClick={handlePreviousMonth}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-700/50 rounded-l-xl transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="px-6 py-2 min-w-[200px] text-center flex items-center justify-between space-x-2 hover:bg-slate-700/30 rounded-lg transition-colors group"
                >
                  <span className="text-white font-semibold">{formatDate(selectedDate)}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showMonthPicker ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              <button
                onClick={handleNextMonth}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-700/50 rounded-r-xl transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {showMonthPicker && (
          <>
            <div className="fixed inset-0 z-[999]" onClick={() => setShowMonthPicker(false)} />
            <div 
              className="fixed bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/50 p-4 z-[1000] min-w-[400px] animate-scale-in"
              style={{ top: '160px', right: '32px' }}
            >
              <div className="mb-4">
                <label className="text-slate-400 text-xs font-medium mb-2 block">Year</label>
                <div className="grid grid-cols-5 gap-2">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => handleMonthSelect(year, selectedDate.getMonth())}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        year === selectedDate.getFullYear()
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">Month</label>
                <div className="grid grid-cols-3 gap-2">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => handleMonthSelect(selectedDate.getFullYear(), index)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        index === selectedDate.getMonth()
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 relative overflow-hidden group hover:shadow-glow transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-300 text-sm font-medium">{t('totalBudget')}</span>
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatCurrency(budget)}</div>
              <div className="px-2 py-1 bg-blue-500/20 rounded-md inline-block">
                <span className="text-blue-300 text-xs font-medium">{t('monthly')}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20 relative overflow-hidden group hover:shadow-glow transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-red-300 text-sm font-medium">{t('spent')}</span>
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatCurrency(totalExpenses)}</div>
              <div className="flex items-center space-x-2">
                <ArrowDownRight className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm">{budgetPercentage.toFixed(1)}% {t('ofBudget')}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 relative overflow-hidden group hover:shadow-glow transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-300 text-sm font-medium">{t('remaining')}</span>
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatCurrency(remaining)}</div>
              <div className="w-full bg-green-900/30 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, (remaining / (budget + totalIncome)) * 100))}%` }}/>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 relative overflow-hidden group hover:shadow-glow transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-300 text-sm font-medium">{t('totalIncome')}</span>
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatCurrency(totalIncome)}</div>
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 text-sm">{income.length} {t('transactions')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{t('expensesByCategory')}</h3>
              <div className="px-3 py-1 bg-red-500/10 rounded-lg">
                <span className="text-red-400 text-sm font-medium">{expenses.length} {t('items')}</span>
              </div>
            </div>
            {Object.keys(expensesByCategory).length > 0 ? (
              <div className="h-[300px]">
                <Bar 
                  data={chartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#cbd5e1',
                        borderColor: '#475569',
                        borderWidth: 1,
                        padding: 16,
                        displayColors: false,
                        callbacks: {
                          label: (context) => formatCurrency(context.parsed.y ?? 0),
                        },
                      },
                    }, 
                    scales: { 
                      y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }, 
                      x: { ticks: { color: '#94a3b8' }, grid: { display: false } } 
                    } 
                  }} 
                />
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center"><DollarSign className="w-16 h-16 text-slate-600 mx-auto mb-4" /><p className="text-slate-400">{t('noExpensesYet')}</p></div>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{t('budgetOverview')}</h3>
              <div className="px-3 py-1 bg-blue-500/10 rounded-lg">
                <span className="text-blue-400 text-sm font-medium">{budgetPercentage.toFixed(0)}% {t('used')}</span>
              </div>
            </div>
            {budget > 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-64 h-64">
                  <Doughnut 
                    data={budgetData} 
                    options={{ 
                      cutout: '70%', 
                      plugins: { 
                        legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20 } },
                        tooltip: {
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          padding: 16,
                          callbacks: {
                            label: (context) => `${context.label}: ${formatCurrency(context.parsed ?? 0)}`,
                          },
                        },
                      } 
                    }} 
                  />
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center"><Target className="w-16 h-16 text-slate-600 mx-auto mb-4" /><p className="text-slate-400">No budget set</p></div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-6">{t('recentTransactions')}</h3>
          <div className="space-y-3">
            {monthTransactions.slice(0, 6).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.type === 'expense' ? 'bg-red-500/10' : transaction.type === 'income' ? 'bg-green-500/10' : 'bg-purple-500/10'}`}>
                    {transaction.type === 'expense' ? <TrendingDown className="w-5 h-5 text-red-400" /> : transaction.type === 'income' ? <TrendingUp className="w-5 h-5 text-green-400" /> : <DollarSign className="w-5 h-5 text-purple-400" />}
                  </div>
                  <div>
                    <div className="text-white font-medium">{transaction.description}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-slate-400 text-sm">{t(`categories.${transaction.category}`)}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 text-sm">{transaction.date}</span>
                    </div>
                  </div>
                </div>
                <div className={`font-bold text-lg ${transaction.type === 'expense' ? 'text-red-400' : transaction.type === 'income' ? 'text-green-400' : 'text-purple-400'}`}>
                  {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
            {monthTransactions.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">{t('noTransactions')}</p>
                <p className="text-slate-500 text-sm mt-2">{t('yourTransactionsAppear')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard