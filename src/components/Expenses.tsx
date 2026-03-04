import React, { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { Plus, TrendingDown, Trash2, Calendar, DollarSign, FileText, Tag, Search, X, Filter, Download } from 'lucide-react'
import CustomSelect, { SelectOption } from './CustomSelect'
import { downloadCSV } from '../utils/csvExport'

const Expenses: React.FC = () => {
  const { t } = useTranslation()
  const { transactions, addTransaction, deleteTransaction, currency, expenseCategories } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterYear, setFilterYear] = useState<number | 'all'>('all')
  const [filterMonth, setFilterMonth] = useState<number | 'all'>('all')

  const categoryOptions: SelectOption[] = useMemo(() =>
    expenseCategories.map(c => ({
      value: c.id,
      label: c.isDefault ? t(`categories.${c.id}`) : c.label,
      color: c.color,
    })), [expenseCategories, t])

  const filterCategoryOptions: SelectOption[] = useMemo(() => [
    { value: 'all', label: t('allCategories') },
    ...categoryOptions,
  ], [categoryOptions, t])

  const expenses = useMemo(() =>
    transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions])

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory
      const expenseDate = new Date(expense.date)
      const matchesYear = filterYear === 'all' || expenseDate.getFullYear() === filterYear
      const matchesMonth = filterMonth === 'all' || expenseDate.getMonth() === filterMonth
      return matchesSearch && matchesCategory && matchesYear && matchesMonth
    })
  }, [expenses, searchTerm, filterCategory, filterYear, filterMonth])

  const totalExpenses = useMemo(() =>
    filteredExpenses.reduce((sum, t) => sum + t.amount, 0), [filteredExpenses])

  const availableYears = useMemo(() => {
    const years = new Set(expenses.map(e => new Date(e.date).getFullYear()))
    return Array.from(years).sort((a, b) => b - a)
  }, [expenses])

  const yearOptions: SelectOption[] = useMemo(() => [
    { value: 'all', label: t('allYears') },
    ...availableYears.map(y => ({ value: String(y), label: String(y) })),
  ], [availableYears, t])

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const monthOptions: SelectOption[] = useMemo(() => [
    { value: 'all', label: t('allMonths') },
    ...monthNames.map((m, i) => ({ value: String(i), label: m })),
  ], [t])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.amount && formData.description && formData.category) {
      addTransaction({
        type: 'expense',
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
      })
      setShowModal(false)
      setFormData({
        category: expenseCategories[0]?.id || '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      })
    }
  }

  const openModal = () => {
    setFormData(f => ({ ...f, category: expenseCategories[0]?.id || '' }))
    setShowModal(true)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterCategory('all')
    setFilterYear('all')
    setFilterMonth('all')
  }

  const hasActiveFilters = searchTerm || filterCategory !== 'all' || filterYear !== 'all' || filterMonth !== 'all'

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount)

  const getCategoryInfo = (categoryId: string) => {
    const cat = expenseCategories.find(c => c.id === categoryId)
    if (!cat) return { label: categoryId, gradient: 'from-slate-500 to-slate-600', color: '#64748b' }
    const label = cat.isDefault ? t(`categories.${cat.id}`) : cat.label
    return { ...cat, label }
  }

  const handleExportCSV = () => {
    const headers = [t('date'), t('expenseCategory'), t('description'), t('amount'), 'Currency']
    const rows = filteredExpenses.map(e => [
      e.date,
      getCategoryInfo(e.category).label,
      e.description,
      e.amount,
      currency,
    ])
    const dateStr = new Date().toISOString().split('T')[0]
    downloadCSV(headers, rows, `expenses-${dateStr}.csv`)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              {t('expenses')}
            </h1>
            <p className="text-slate-400">Track and manage your spending</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              disabled={filteredExpenses.length === 0}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-700/60 hover:bg-slate-600/60 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t('exportCSV')}</span>
            </button>
            <button
              onClick={openModal}
              className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105"
            >
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>{t('addExpense')}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-white">{t('filters')}</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                <span>{t('clear')}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-slate-700/50 text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-600/50 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-sm"
              />
            </div>

            <CustomSelect value={filterCategory} onChange={setFilterCategory} options={filterCategoryOptions} accentColor="red" />
            <CustomSelect
              value={filterYear === 'all' ? 'all' : String(filterYear)}
              onChange={(v) => setFilterYear(v === 'all' ? 'all' : parseInt(v))}
              options={yearOptions} accentColor="red"
            />
            <CustomSelect
              value={filterMonth === 'all' ? 'all' : String(filterMonth)}
              onChange={(v) => setFilterMonth(v === 'all' ? 'all' : parseInt(v))}
              options={monthOptions} accentColor="red"
            />
          </div>

          <div className="mt-4 text-sm text-slate-400">
            {t('showing')} {filteredExpenses.length} {t('of')} {expenses.length} {t('expenses').toLowerCase()}
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm mb-1">{hasActiveFilters ? t('filtered') : t('total')} {t('totalExpenses')}</p>
              <h2 className="text-4xl font-bold text-white">{formatCurrency(totalExpenses)}</h2>
              <p className="text-red-300 text-sm mt-2">{filteredExpenses.length} {t('transactions')}</p>
            </div>
            <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center">
              <TrendingDown className="w-10 h-10 text-red-400" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">
                    <div className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>{t('date')}</span></div>
                  </th>
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">
                    <div className="flex items-center space-x-2"><Tag className="w-4 h-4" /><span>{t('expenseCategory')}</span></div>
                  </th>
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">
                    <div className="flex items-center space-x-2"><FileText className="w-4 h-4" /><span>{t('description')}</span></div>
                  </th>
                  <th className="text-right p-4 text-slate-400 font-medium text-sm">
                    <div className="flex items-center justify-end space-x-2"><DollarSign className="w-4 h-4" /><span>{t('amount')}</span></div>
                  </th>
                  <th className="text-right p-4 text-slate-400 font-medium text-sm">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => {
                  const cat = getCategoryInfo(expense.category)
                  return (
                    <tr key={expense.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors group">
                      <td className="p-4 text-slate-300 text-sm">{expense.date}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r ${cat.gradient} text-white shadow-sm`}>
                          <span className="w-2 h-2 rounded-full bg-white/40" />
                          <span>{cat.label}</span>
                        </span>
                      </td>
                      <td className="p-4 text-white font-medium">{expense.description}</td>
                      <td className="p-4 text-right text-red-400 font-bold text-lg">-{formatCurrency(expense.amount)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteTransaction(expense.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-16 text-center">
                      <TrendingDown className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg font-medium">
                        {hasActiveFilters ? t('noMatchFilters') : t('noExpensesYet')}
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        {hasActiveFilters ? t('adjustCriteria') : t('clickAddExpense')}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-slate-700/50 shadow-2xl shadow-red-500/20 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{t('addNewExpense')}</h2>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  <div className="flex items-center space-x-2"><Tag className="w-4 h-4" /><span>{t('expenseCategory')}</span></div>
                </label>
                <CustomSelect
                  value={formData.category}
                  onChange={(v) => setFormData({ ...formData, category: v })}
                  options={categoryOptions}
                  accentColor="red"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  <div className="flex items-center space-x-2"><DollarSign className="w-4 h-4" /><span>{t('amount')}</span></div>
                </label>
                <input
                  type="number" step="0.01" value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-slate-700/50 text-white rounded-xl p-3 border border-slate-600/50 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  placeholder="0.00" required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  <div className="flex items-center space-x-2"><FileText className="w-4 h-4" /><span>{t('description')}</span></div>
                </label>
                <input
                  type="text" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-700/50 text-white rounded-xl p-3 border border-slate-600/50 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  placeholder="e.g., Grocery shopping" required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  <div className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>{t('date')}</span></div>
                </label>
                <input
                  type="date" value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-700/50 text-white rounded-xl p-3 border border-slate-600/50 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-red-500/30">
                  {t('save')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 rounded-xl font-medium transition-all border border-slate-600/50">
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses