import React, { useState, useMemo } from 'react'
import { useStore, SavingsGoal } from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import {
  Plus, PiggyBank, Trash2, Calendar, DollarSign, FileText,
  Target, Check, Trophy, ChevronDown, ChevronUp, Pencil, X, Palette, Star, Download,
} from 'lucide-react'
import CustomSelect, { SelectOption } from './CustomSelect'
import { downloadCSV } from '../utils/csvExport'

const EMOJI_OPTIONS = ['🏠','🚗','✈️','💻','🎁','❤️','⚡','☕','🎵','🛍️','📚','💪','📷','🌴','💍','🎓','🏖️','🚀','🎮','🐾']

const GOAL_COLORS = [
  { color: '#3b82f6', gradient: 'from-blue-500 to-cyan-500' },
  { color: '#a855f7', gradient: 'from-purple-500 to-pink-500' },
  { color: '#22c55e', gradient: 'from-green-500 to-teal-500' },
  { color: '#f97316', gradient: 'from-orange-500 to-red-500' },
  { color: '#ec4899', gradient: 'from-pink-500 to-rose-500' },
  { color: '#eab308', gradient: 'from-yellow-400 to-orange-500' },
  { color: '#14b8a6', gradient: 'from-teal-500 to-cyan-500' },
  { color: '#f43f5e', gradient: 'from-rose-500 to-red-500' },
]

const CONFETTI_COLORS = ['#3b82f6','#a855f7','#22c55e','#f97316','#ec4899','#eab308','#f43f5e','#14b8a6']

const CompletedBurst: React.FC = () => (
  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="absolute w-1.5 h-3 rounded-full opacity-0"
        style={{
          background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          left: `${8 + i * 7.5}%`, top: '-8px',
          animation: `confettiFall 1.8s ease-in ${i * 0.1}s forwards`,
        }} />
    ))}
    <style>{`
      @keyframes confettiFall {
        0%   { opacity: 0; transform: translateY(0) rotate(0deg); }
        10%  { opacity: 1; }
        100% { opacity: 0; transform: translateY(120px) rotate(360deg); }
      }
    `}</style>
  </div>
)

const ProgressRing: React.FC<{ pct: number; color: string; size?: number; stroke?: number }> = ({
  pct, color, size = 76, stroke = 6,
}) => {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  )
}

const Savings: React.FC = () => {
  const { t } = useTranslation()
  const {
    transactions, addTransaction, currency,
    savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    completeGoal, uncompleteGoal,
  } = useStore()

  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddDeposit, setShowAddDeposit] = useState(false)
  const [editGoalId, setEditGoalId] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  const [goalForm, setGoalForm] = useState({
    name: '', emoji: '🏠', targetAmount: '',
    color: GOAL_COLORS[0].color, gradient: GOAL_COLORS[0].gradient,
  })
  const [depositForm, setDepositForm] = useState({
    goalId: '', amount: '', description: '', date: new Date().toISOString().split('T')[0],
  })

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  const savedByGoal = useMemo(() => {
    const map: Record<string, number> = {}
    transactions.filter(t => t.type === 'savings' && t.goalId)
      .forEach(t => { map[t.goalId!] = (map[t.goalId!] || 0) + t.amount })
    return map
  }, [transactions])

  const savingsTransactions = useMemo(() =>
    transactions
      .filter(t => t.type === 'savings')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions])

  const activeGoals    = useMemo(() => savingsGoals.filter(g => !g.completedAt), [savingsGoals])
  const completedGoals = useMemo(() => savingsGoals.filter(g =>  g.completedAt), [savingsGoals])

  const goalSelectOptions: SelectOption[] = useMemo(() =>
    activeGoals.map(g => ({ value: g.id, label: `${g.emoji} ${g.name}`, color: g.color })),
    [activeGoals])

  const getGoalName = (goalId?: string) => {
    if (!goalId) return '—'
    const g = savingsGoals.find(g => g.id === goalId)
    return g ? `${g.emoji} ${g.name}` : goalId
  }

  const handleExportCSV = () => {
    const headers = [t('date'), 'Goal', t('description'), t('amount'), 'Currency']
    const rows = savingsTransactions.map(t => [
      t.date,
      getGoalName(t.goalId),
      t.description,
      t.amount,
      currency,
    ])
    const dateStr = new Date().toISOString().split('T')[0]
    downloadCSV(headers, rows, `savings-${dateStr}.csv`)
  }

  const openAddDeposit = (goalId?: string) => {
    setDepositForm({
      goalId: goalId || activeGoals[0]?.id || '',
      amount: '', description: '', date: new Date().toISOString().split('T')[0],
    })
    setShowAddDeposit(true)
  }

  const openEditGoal = (g: SavingsGoal) => {
    setGoalForm({ name: g.name, emoji: g.emoji, targetAmount: String(g.targetAmount), color: g.color, gradient: g.gradient })
    setEditGoalId(g.id)
    setShowAddGoal(true)
  }

  const openNewGoal = () => {
    setEditGoalId(null)
    setGoalForm({ name: '', emoji: '🏠', targetAmount: '', color: GOAL_COLORS[0].color, gradient: GOAL_COLORS[0].gradient })
    setShowAddGoal(true)
  }

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalForm.name.trim() || !goalForm.targetAmount) return
    const payload = { name: goalForm.name.trim(), emoji: goalForm.emoji, targetAmount: parseFloat(goalForm.targetAmount), color: goalForm.color, gradient: goalForm.gradient }
    if (editGoalId) updateSavingsGoal(editGoalId, payload)
    else addSavingsGoal(payload)
    setShowAddGoal(false)
    setEditGoalId(null)
  }

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositForm.amount || !depositForm.description || !depositForm.goalId) return
    addTransaction({
      type: 'savings', category: 'savings',
      amount: parseFloat(depositForm.amount),
      description: depositForm.description,
      date: depositForm.date,
      goalId: depositForm.goalId,
    })
    setShowAddDeposit(false)
  }

  const handleDeleteGoal = (id: string) => {
    if (window.confirm(t('goalDeleteConfirm'))) deleteSavingsGoal(id)
  }

  // ── Goal Card ──────────────────────────────────────────────────────────
  const GoalCard: React.FC<{ goal: SavingsGoal }> = ({ goal }) => {
    const saved    = savedByGoal[goal.id] || 0
    const pct      = goal.targetAmount > 0 ? Math.min((saved / goal.targetAmount) * 100, 100) : 0
    const isComplete  = !!goal.completedAt
    const justReached = !isComplete && pct >= 100

    return (
      <div className={`relative rounded-2xl border overflow-hidden transition-all duration-300 group
        ${isComplete
          ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/25'
          : justReached
          ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/8 border-yellow-500/30'
          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/70'}`}
      >
        {isComplete && <CompletedBurst />}
        <div className={`h-1 w-full bg-gradient-to-r ${isComplete ? 'from-green-400 to-emerald-400' : goal.gradient}`} />

        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl leading-none">{goal.emoji}</span>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">{goal.name}</h3>
                {isComplete && (
                  <span className="inline-flex items-center space-x-1 mt-1 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400 font-semibold">
                    <Trophy className="w-3 h-3" /><span>{t('goalCompleted')}</span>
                  </span>
                )}
                {justReached && (
                  <span className="inline-flex items-center space-x-1 mt-1 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-xs text-yellow-400 font-semibold animate-pulse">
                    <Star className="w-3 h-3" /><span>{t('goalReady')}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isComplete && (
                <button onClick={() => openEditGoal(goal)} className="p-1.5 hover:bg-slate-600/50 rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                </button>
              )}
              {justReached && (
                <button onClick={() => completeGoal(goal.id)}
                  className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 text-xs font-semibold rounded-lg transition-all whitespace-nowrap">
                  ✓ {t('markDone')}
                </button>
              )}
              {isComplete && (
                <button onClick={() => uncompleteGoal(goal.id)}
                  className="px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 text-xs rounded-lg transition-all whitespace-nowrap">
                  {t('reopen')}
                </button>
              )}
              <button onClick={() => handleDeleteGoal(goal.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative shrink-0">
              <ProgressRing pct={pct} color={isComplete ? '#22c55e' : goal.color} />
              <div className="absolute inset-0 flex items-center justify-center">
                {isComplete
                  ? <Check className="w-6 h-6 text-green-400" strokeWidth={3} />
                  : <span className="text-white font-bold text-sm">{Math.round(pct)}%</span>}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">{t('saved')}</div>
                  <div className="text-white font-bold text-xl leading-none">{formatCurrency(saved)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 mb-0.5">{t('target')}</div>
                  <div className="text-slate-300 font-semibold">{formatCurrency(goal.targetAmount)}</div>
                </div>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full transition-all duration-700 bg-gradient-to-r ${isComplete ? 'from-green-400 to-emerald-400' : goal.gradient}`}
                  style={{ width: `${pct}%` }} />
              </div>
              {!isComplete && goal.targetAmount > saved && (
                <div className="text-xs text-slate-500 mt-1">{formatCurrency(goal.targetAmount - saved)} {t('remaining')}</div>
              )}
              {isComplete && goal.completedAt && (
                <div className="text-xs text-green-500/80 mt-1">{t('completedOn')} {goal.completedAt}</div>
              )}
            </div>
          </div>

          {!isComplete && (
            <button onClick={() => openAddDeposit(goal.id)}
              className={`mt-4 w-full py-2 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r ${goal.gradient} text-white opacity-75 hover:opacity-100 hover:scale-[1.02]`}
              style={{ boxShadow: `0 4px 15px ${goal.color}30` }}>
              + {t('addDeposit')}
            </button>
          )}
        </div>
      </div>
    )
  }

  const totalSaved  = Object.values(savedByGoal).reduce((a, b) => a + b, 0)
  const totalTarget = savingsGoals.reduce((a, g) => a + g.targetAmount, 0)

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('savings')}
            </h1>
            <p className="text-slate-400">{t('savingsSubtitle')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              disabled={savingsTransactions.length === 0}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-700/60 hover:bg-slate-600/60 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t('exportCSV')}</span>
            </button>
            {activeGoals.length > 0 && (
              <button onClick={() => openAddDeposit()}
                className="flex items-center space-x-2 px-5 py-2.5 bg-slate-700/60 hover:bg-slate-600/60 border border-slate-600/50 text-white rounded-xl font-medium text-sm transition-all">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <span>{t('addDeposit')}</span>
              </button>
            )}
            <button onClick={openNewGoal}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 hover:scale-105">
              <Plus className="w-5 h-5" />
              <span>{t('newGoal')}</span>
            </button>
          </div>
        </div>

        {/* Summary strip */}
        {savingsGoals.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t('activeGoals'),    val: String(activeGoals.length),    color: 'text-blue-400',   bg: 'from-blue-500/10',   border: 'border-blue-500/20' },
              { label: t('completedGoals'), val: String(completedGoals.length), color: 'text-green-400',  bg: 'from-green-500/10',  border: 'border-green-500/20' },
              { label: t('totalSaved'),     val: formatCurrency(totalSaved),    color: 'text-purple-400', bg: 'from-purple-500/10', border: 'border-purple-500/20' },
              { label: t('totalTarget'),    val: formatCurrency(totalTarget),   color: 'text-orange-400', bg: 'from-orange-500/10', border: 'border-orange-500/20' },
            ].map(item => (
              <div key={item.label} className={`bg-gradient-to-br ${item.bg} to-transparent border ${item.border} rounded-xl px-4 py-3`}>
                <div className="text-slate-400 text-xs mb-1">{item.label}</div>
                <div className={`${item.color} font-bold text-xl`}>{item.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Active goals grid */}
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {activeGoals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        ) : (
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-16 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-slate-300 text-xl font-semibold mb-2">{t('noGoalsYet')}</p>
            <p className="text-slate-500 text-sm mb-6">{t('noGoalsHint')}</p>
            <button onClick={openNewGoal}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:scale-105 transition-all">
              <Plus className="w-5 h-5" /><span>{t('newGoal')}</span>
            </button>
          </div>
        )}

        {/* Completed goals */}
        {completedGoals.length > 0 && (
          <div>
            <button onClick={() => setShowCompleted(p => !p)}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-4">
              {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">{t('completedGoals')} ({completedGoals.length})</span>
            </button>
            {showCompleted && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {completedGoals.map(g => <GoalCard key={g.id} goal={g} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ADD / EDIT GOAL MODAL ── */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-slate-700/50 shadow-2xl shadow-purple-500/20 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{editGoalId ? t('editGoal') : t('newGoal')}</h2>
              <button onClick={() => setShowAddGoal(false)} className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">{t('goalEmoji')}</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(em => (
                    <button key={em} type="button" onClick={() => setGoalForm(f => ({ ...f, emoji: em }))}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all
                        ${goalForm.emoji === em ? 'bg-slate-600 ring-2 ring-purple-500 scale-110' : 'bg-slate-700/50 hover:bg-slate-600/50'}`}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">{t('goalName')}</label>
                <input type="text" value={goalForm.name} onChange={e => setGoalForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-slate-700/50 text-white rounded-xl p-3 border border-slate-600/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder={t('goalNamePlaceholder')} required autoFocus />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">{t('goalTarget')}</label>
                <input type="number" step="0.01" value={goalForm.targetAmount}
                  onChange={e => setGoalForm(f => ({ ...f, targetAmount: e.target.value }))}
                  className="w-full bg-slate-700/50 text-white rounded-xl p-3 border border-slate-600/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="0.00" required />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium flex items-center space-x-1">
                  <Palette className="w-4 h-4 inline mr-1" />{t('goalColor')}
                </label>
                <div className="flex space-x-2">
                  {GOAL_COLORS.map(c => (
                    <button key={c.color} type="button" onClick={() => setGoalForm(f => ({ ...f, color: c.color, gradient: c.gradient }))}
                      className={`w-8 h-8 rounded-lg transition-all ${goalForm.color === c.color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-110'}`}
                      style={{ background: c.color }} />
                  ))}
                </div>
              </div>

              <div className={`rounded-xl p-3 bg-gradient-to-r ${goalForm.gradient} opacity-90`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{goalForm.emoji}</span>
                  <div>
                    <div className="text-white font-semibold">{goalForm.name || t('goalNamePlaceholder')}</div>
                    <div className="text-white/70 text-sm">{goalForm.targetAmount ? formatCurrency(parseFloat(goalForm.targetAmount)) : '—'}</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30">
                  {t('save')}
                </button>
                <button type="button" onClick={() => setShowAddGoal(false)} className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 rounded-xl font-medium transition-all border border-slate-600/50">
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD DEPOSIT MODAL ── */}
      {showAddDeposit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-slate-700/50 shadow-2xl shadow-purple-500/20 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{t('addDeposit')}</h2>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-purple-400" />
                </div>
                <button onClick={() => setShowAddDeposit(false)} className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  <div className="flex items-center space-x-2"><Target className="w-4 h-4" /><span>{t('selectGoal')}</span></div>
                </label>
                {goalSelectOptions.length > 0
                  ? <CustomSelect value={depositForm.goalId} onChange={v => setDepositForm(f => ({ ...f, goalId: v }))} options={goalSelectOptions} accentColor="purple" />
                  : <div className="text-slate-500 text-sm p-3 bg-slate-700/30 rounded-xl">{t('noActiveGoals')}</div>}
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  <div className="flex items-center space-x-2"><DollarSign className="w-4 h-4" /><span>{t('amount')}</span></div>
                </label>
                <input type="number" step="0.01" value={depositForm.amount} onChange={e => setDepositForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-slate-700/50 text-white rounded-xl p-3 border border-slate-600/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="0.00" required />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  <div className="flex items-center space-x-2"><FileText className="w-4 h-4" /><span>{t('description')}</span></div>
                </label>
                <input type="text" value={depositForm.description} onChange={e => setDepositForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-slate-700/50 text-white rounded-xl p-3 border border-slate-600/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder={t('depositDescPlaceholder')} required />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  <div className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>{t('date')}</span></div>
                </label>
                <input type="date" value={depositForm.date} onChange={e => setDepositForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-slate-700/50 text-white rounded-xl p-3 border border-slate-600/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  required />
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30">
                  {t('save')}
                </button>
                <button type="button" onClick={() => setShowAddDeposit(false)} className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 rounded-xl font-medium transition-all border border-slate-600/50">
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

export default Savings