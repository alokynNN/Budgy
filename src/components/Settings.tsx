import React, { useState, useRef } from 'react'
import { useStore, DEFAULT_EXPENSE_CATEGORIES } from '../store/useStore'
import { useTranslation, useAvailableLanguages, buildLanguageTemplate } from '../i18n/useTranslation'
import {
  Globe, DollarSign, Wallet, Check, Settings as SettingsIcon,
  Tag, Plus, Trash2, Pencil, X, RotateCcw, Palette,
  Upload, Download, ExternalLink,
} from 'lucide-react'

const COLOR_PRESETS = [
  { color: '#ef4444', gradient: 'from-red-500 to-rose-500',       label: 'Red' },
  { color: '#f97316', gradient: 'from-orange-500 to-red-500',     label: 'Orange' },
  { color: '#eab308', gradient: 'from-yellow-400 to-orange-500',  label: 'Yellow' },
  { color: '#22c55e', gradient: 'from-green-500 to-teal-500',     label: 'Green' },
  { color: '#3b82f6', gradient: 'from-blue-500 to-cyan-500',      label: 'Blue' },
  { color: '#a855f7', gradient: 'from-purple-500 to-pink-500',    label: 'Purple' },
  { color: '#ec4899', gradient: 'from-pink-500 to-rose-500',      label: 'Pink' },
  { color: '#14b8a6', gradient: 'from-teal-500 to-cyan-500',      label: 'Teal' },
  { color: '#f43f5e', gradient: 'from-rose-500 to-red-500',       label: 'Rose' },
  { color: '#64748b', gradient: 'from-slate-500 to-slate-600',    label: 'Gray' },
]

const CURRENCIES = [
  { code: 'USD', symbol: '$',    name: 'US Dollar' },
  { code: 'EUR', symbol: '€',    name: 'Euro' },
  { code: 'GBP', symbol: '£',    name: 'British Pound' },
  { code: 'RSD', symbol: 'RSD',  name: 'Serbian Dinar' },
  { code: 'JPY', symbol: '¥',    name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF',  name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'CA$',  name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar' },
  { code: 'CNY', symbol: '¥',    name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$',   name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$',  name: 'Mexican Peso' },
  { code: 'KRW', symbol: '₩',    name: 'South Korean Won' },
  { code: 'HKD', symbol: 'HK$',  name: 'Hong Kong Dollar' },
  { code: 'SGD', symbol: 'S$',   name: 'Singapore Dollar' },
  { code: 'NOK', symbol: 'kr',   name: 'Norwegian Krone' },
  { code: 'SEK', symbol: 'kr',   name: 'Swedish Krona' },
  { code: 'DKK', symbol: 'kr',   name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł',   name: 'Polish Złoty' },
  { code: 'CZK', symbol: 'Kč',   name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft',   name: 'Hungarian Forint' },
  { code: 'RON', symbol: 'lei',  name: 'Romanian Leu' },
  { code: 'TRY', symbol: '₺',    name: 'Turkish Lira' },
  { code: 'ILS', symbol: '₪',    name: 'Israeli Shekel' },
  { code: 'AED', symbol: 'AED',  name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SAR',  name: 'Saudi Riyal' },
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand' },
  { code: 'THB', symbol: '฿',    name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp',   name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM',   name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱',    name: 'Philippine Peso' },
  { code: 'NGN', symbol: '₦',    name: 'Nigerian Naira' },
  { code: 'EGP', symbol: 'E£',   name: 'Egyptian Pound' },
]

const Settings: React.FC = () => {
  const { t } = useTranslation()
  const availableLangs = useAvailableLanguages()
  const {
    language, currency,
    setLanguage, setCurrency, setBudget, currentBudget,
    expenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory,
    resetToDefaults,
    addCustomLanguage, removeCustomLanguage,
    customLanguages,
  } = useStore()

  const getCatLabel = (cat: typeof expenseCategories[0]) =>
    cat.isDefault ? t(`categories.${cat.id}`) : cat.label

  const [budgetAmount, setBudgetAmount] = useState(currentBudget?.totalBudget.toString() || '')
  const [showBudgetSuccess, setShowBudgetSuccess] = useState(false)

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetConfirmInput, setResetConfirmInput] = useState('')
  const [resetShake, setResetShake] = useState(false)

  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatColor, setNewCatColor] = useState(COLOR_PRESETS[0])
  const [editCatLabel, setEditCatLabel] = useState('')
  const [editCatColor, setEditCatColor] = useState(COLOR_PRESETS[0])

  const [langError, setLangError] = useState('')
  const [langSuccess, setLangSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBudgetSave = () => {
    const amount = parseFloat(budgetAmount)
    if (amount > 0) {
      const currentMonth = new Date().toISOString().slice(0, 7)
      setBudget({ month: currentMonth, totalBudget: amount, categories: {} })
      setShowBudgetSuccess(true)
      setTimeout(() => setShowBudgetSuccess(false), 3000)
    }
  }

  const handleAddCategory = () => {
    if (!newCatLabel.trim()) return
    addExpenseCategory({ label: newCatLabel.trim(), color: newCatColor.color, gradient: newCatColor.gradient })
    setNewCatLabel('')
    setNewCatColor(COLOR_PRESETS[0])
    setShowAddCategory(false)
  }

  const startEdit = (cat: typeof expenseCategories[0]) => {
    setEditingCatId(cat.id)
    setEditCatLabel(getCatLabel(cat))
    const preset = COLOR_PRESETS.find(p => p.color === cat.color) || COLOR_PRESETS[0]
    setEditCatColor(preset)
  }

  const handleSaveEdit = () => {
    if (!editingCatId || !editCatLabel.trim()) return
    updateExpenseCategory(editingCatId, { label: editCatLabel.trim(), color: editCatColor.color, gradient: editCatColor.gradient })
    setEditingCatId(null)
  }

  const handleResetCategories = () => {
    DEFAULT_EXPENSE_CATEGORIES.forEach(c => {
      const existing = expenseCategories.find(e => e.id === c.id)
      if (existing) updateExpenseCategory(c.id, { label: c.label, color: c.color, gradient: c.gradient })
    })
    expenseCategories
      .filter(c => !DEFAULT_EXPENSE_CATEGORIES.find(d => d.id === c.id))
      .forEach(c => deleteExpenseCategory(c.id))
  }

  const handleOpenResetModal = () => {
    setResetConfirmInput('')
    setResetShake(false)
    setShowResetModal(true)
  }

  const handleConfirmReset = () => {
    if (resetConfirmInput.trim().toLowerCase() !== t('resetConfirmWord').toLowerCase()) {
      setResetShake(true)
      setTimeout(() => setResetShake(false), 600)
      return
    }
    resetToDefaults()
    setBudgetAmount('')
    setShowResetModal(false)
  }

  const handleDownloadTemplate = () => {
    const content = buildLanguageTemplate()
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'language-template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoadLanguageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string)
        const { name, code, ...translations } = raw
        if (!name || !code) throw new Error('Missing name or code')
        addCustomLanguage({ code, name, translations })
        setLangSuccess(t('languageLoaded'))
        setLangError('')
        setTimeout(() => setLangSuccess(''), 3000)
      } catch {
        setLangError(t('languageLoadError'))
        setLangSuccess('')
      }
      // reset input so the same file can be loaded again
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <>
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{t('settings')}</h1>
            <p className="text-slate-400">Customize your Budgy</p>
          </div>
          <button
            onClick={handleOpenResetModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-xl font-medium text-sm transition-all duration-200 group"
          >
            <RotateCcw className="w-4 h-4 group-hover:rotate-[-180deg] transition-transform duration-500" />
            <span>{t('resetToDefault')}</span>
          </button>
        </div>

        <div className="space-y-6">

          {/* ── LANGUAGE ── */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"><Globe className="w-6 h-6 text-blue-400" /></div>
                <div><h2 className="text-xl font-bold text-white">{t('languageSettings')}</h2><p className="text-slate-400 text-sm">{t('chooseLanguage')}</p></div>
              </div>
              {/* Template + Load buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all border border-slate-600/30"
                  title={t('downloadTemplate')}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('downloadTemplate')}</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-xl text-sm font-medium transition-all"
                  title={t('loadLanguage')}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('loadLanguage')}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleLoadLanguageFile}
                />
              </div>
            </div>

            {langSuccess && (
              <div className="mb-3 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-xl flex items-center space-x-2 text-sm">
                <Check className="w-4 h-4" /><span>{langSuccess}</span>
              </div>
            )}
            {langError && (
              <div className="mb-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm">
                {langError}
              </div>
            )}

            {/* Scrollable language grid */}
            <div className="max-h-64 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
              <div className="grid grid-cols-2 gap-3">
                {availableLangs.map((lang) => (
                  <button key={lang.code} onClick={() => setLanguage(lang.code)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${language === lang.code ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className={`font-medium ${language === lang.code ? 'text-white' : 'text-slate-300'}`}>{lang.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{lang.code.toUpperCase()}</div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {language === lang.code && <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                        {!lang.isBuiltin && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeCustomLanguage(lang.code) }}
                            className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                            title={t('removeLanguage')}
                          >
                            <X className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {customLanguages.length === 0 && (
              <p className="text-xs text-slate-500 mt-3 text-center">
                Download the template, translate it, then load your .json file to add a new language.
              </p>
            )}
          </div>

          {/* ── CURRENCY ── */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-green-400" /></div>
              <div><h2 className="text-xl font-bold text-white">{t('currencySettings')}</h2><p className="text-slate-400 text-sm">{t('selectCurrency')}</p></div>
            </div>
            {/* Scrollable currency grid */}
            <div className="max-h-64 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CURRENCIES.map((curr) => (
                  <button key={curr.code} onClick={() => setCurrency(curr.code)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${currency === curr.code ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20' : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500/50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`font-bold text-lg ${currency === curr.code ? 'text-white' : 'text-slate-300'}`}>{curr.symbol}</div>
                      {currency === curr.code && <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                    </div>
                    <div className={`font-medium text-sm ${currency === curr.code ? 'text-white' : 'text-slate-400'}`}>{curr.code}</div>
                    <div className="text-xs text-slate-500 mt-1 truncate">{curr.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── BUDGET SETUP ── */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"><Wallet className="w-6 h-6 text-blue-400" /></div>
              <div><h2 className="text-xl font-bold text-white">{t('budgetSetup')}</h2><p className="text-slate-400 text-sm">{t('setMonthlyLimit')}</p></div>
            </div>
            {showBudgetSuccess && (
              <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl flex items-center space-x-2">
                <Check className="w-5 h-5" /><span>{t('budgetSaved')}</span>
              </div>
            )}
            <div className="space-y-4">
              <input type="number" step="0.01" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder={t('enterMonthlyBudget')}
                className="w-full bg-slate-700/50 text-white rounded-xl p-4 border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg" />
              <button onClick={handleBudgetSave}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30">
                {t('save')}
              </button>
            </div>
          </div>

          {/* ── CATEGORY MANAGEMENT ── */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center"><Tag className="w-6 h-6 text-orange-400" /></div>
                <div>
                  <h2 className="text-xl font-bold text-white">Expense Categories</h2>
                  <p className="text-slate-400 text-sm">Manage your expense categories</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={handleResetCategories} title="Reset to defaults"
                  className="p-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-slate-200 rounded-xl transition-all border border-slate-600/30">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setShowAddCategory(true); setNewCatLabel(''); setNewCatColor(COLOR_PRESETS[0]) }}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add Category</span>
                </button>
              </div>
            </div>

            {showAddCategory && (
              <div className="mb-4 p-4 bg-slate-700/40 rounded-xl border border-slate-600/40 animate-scale-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium text-sm">New Category</span>
                  <button onClick={() => setShowAddCategory(false)} className="p-1 hover:bg-slate-600/50 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input type="text" value={newCatLabel} onChange={(e) => setNewCatLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    placeholder="Category name..."
                    className="w-full bg-slate-800/60 text-white rounded-xl p-3 border border-slate-600/50 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-sm"
                    autoFocus />
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Palette className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-400 text-xs font-medium">Color</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button key={preset.color} onClick={() => setNewCatColor(preset)} title={preset.label}
                          className={`w-7 h-7 rounded-lg transition-all ${newCatColor.color === preset.color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-110'}`}
                          style={{ background: preset.color }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r ${newCatColor.gradient} text-white shadow-sm`}>
                      <span className="w-2 h-2 rounded-full bg-white/40" />
                      <span>{newCatLabel || 'Preview'}</span>
                    </span>
                    <div className="flex-1" />
                    <button onClick={() => setShowAddCategory(false)} className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl text-sm font-medium transition-all border border-slate-600/50">Cancel</button>
                    <button onClick={handleAddCategory} disabled={!newCatLabel.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {expenseCategories.map((cat) => (
                <div key={cat.id} className="group">
                  {editingCatId === cat.id ? (
                    <div className="p-3 bg-slate-700/40 rounded-xl border border-slate-600/40 animate-scale-in">
                      <div className="space-y-3">
                        <input type="text" value={editCatLabel} onChange={(e) => setEditCatLabel(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingCatId(null) }}
                          className="w-full bg-slate-800/60 text-white rounded-xl p-2.5 border border-slate-600/50 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-sm"
                          autoFocus />
                        <div className="flex flex-wrap gap-2">
                          {COLOR_PRESETS.map((preset) => (
                            <button key={preset.color} onClick={() => setEditCatColor(preset)}
                              className={`w-7 h-7 rounded-lg transition-all ${editCatColor.color === preset.color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-110'}`}
                              style={{ background: preset.color }} />
                          ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r ${editCatColor.gradient} text-white`}>
                            <span className="w-2 h-2 rounded-full bg-white/40" /><span>{editCatLabel || 'Preview'}</span>
                          </span>
                          <div className="flex-1" />
                          <button onClick={() => setEditingCatId(null)} className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-sm transition-all">Cancel</button>
                          <button onClick={handleSaveEdit} className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-sm transition-all">Save</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-slate-700/20 hover:bg-slate-700/40 rounded-xl transition-all border border-transparent hover:border-slate-600/30">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r ${cat.gradient} text-white shadow-sm`}>
                          <span className="w-2 h-2 rounded-full bg-white/40" /><span>{getCatLabel(cat)}</span>
                        </span>
                        {cat.isDefault && <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-700/50 rounded-md">default</span>}
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(cat)} className="p-1.5 hover:bg-slate-600/50 rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                        </button>
                        {!cat.isDefault && (
                          <button onClick={() => deleteExpenseCategory(cat.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-300" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── ABOUT ── */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-slate-600/20 rounded-xl flex items-center justify-center"><SettingsIcon className="w-6 h-6 text-slate-400" /></div>
              <div><h2 className="text-xl font-bold text-white">{t('about')}</h2><p className="text-slate-400 text-sm">{t('appInfo')}</p></div>
            </div>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <span className="text-slate-400">{t('appName')}</span>
                <span className="font-medium">Budgy</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <span className="text-slate-400">{t('version')}</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400">{t('support')}</span>
                <a
                  href="https://budgy.alokyn.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  <span>budgy.alokyn.com</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── RESET MODAL ── */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowResetModal(false) }}
        >
          <div
            className="relative w-full max-w-md bg-slate-900/98 border border-red-500/20 rounded-2xl p-8 shadow-2xl"
            style={{ animation: 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 0 0 1px rgba(239,68,68,0.15), 0 30px 80px rgba(0,0,0,0.8)' }}
          >
            <button onClick={() => setShowResetModal(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <RotateCcw className="w-9 h-9 text-red-400" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-red-500/10 blur-xl -z-10" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">{t('resetModalTitle')}</h2>
            <p className="text-slate-400 text-sm text-center mb-6 leading-relaxed">{t('resetModalDesc')}</p>

            <div className="flex items-start space-x-3 bg-red-500/8 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="w-5 h-5 text-red-400 mt-0.5 shrink-0">⚠</div>
              <div className="text-sm text-red-300/90 leading-relaxed space-y-1">
                <div>• {t('resetWarning1')}</div>
                <div>• {t('resetWarning2')}</div>
                <div>• {t('resetWarning3')}</div>
                <div>• {t('resetWarning4')}</div>
                <div className="text-green-400/80">• Custom languages are preserved</div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                {t('resetConfirmLabel')}{' '}
                <span className="font-mono font-bold text-white bg-slate-700/60 px-2 py-0.5 rounded-md text-xs tracking-wider">
                  {t('resetConfirmWord')}
                </span>
                {' '}{t('resetConfirmLabelAfter')}
              </label>
              <input
                type="text"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmReset(); if (e.key === 'Escape') setShowResetModal(false) }}
                placeholder={t('resetConfirmPlaceholder')}
                autoFocus
                className="w-full bg-slate-800/80 text-white rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none transition-all text-sm font-medium placeholder:text-slate-600"
                style={{
                  animation: resetShake ? 'shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97)' : undefined,
                  borderColor: resetShake ? '#ef4444' : undefined,
                  boxShadow: resetShake ? '0 0 0 3px rgba(239,68,68,0.2)' : undefined,
                }}
              />
              {resetShake && (
                <p className="text-red-400 text-xs mt-2 flex items-center space-x-1">
                  <span>✕</span>
                  <span>{t('resetConfirmError')} <span className="font-mono font-bold">{t('resetConfirmWord')}</span></span>
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 rounded-xl font-medium text-sm transition-all border border-slate-600/40">
                {t('resetCancelBtn')}
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={resetConfirmInput.trim().toLowerCase() !== t('resetConfirmWord').toLowerCase()}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-900/50 disabled:to-red-900/50 disabled:text-red-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-red-900/30"
              >
                {t('resetConfirmBtn')}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.92) translateY(8px); }
              to   { opacity: 1; transform: scale(1)   translateY(0); }
            }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              15%  { transform: translateX(-6px); }
              30%  { transform: translateX(5px); }
              45%  { transform: translateX(-4px); }
              60%  { transform: translateX(4px); }
              75%  { transform: translateX(-3px); }
              90%  { transform: translateX(2px); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}

export default Settings