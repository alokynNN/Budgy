import { create } from 'zustand'

export interface Transaction {
  id: string
  type: 'income' | 'expense' | 'savings'
  category: string
  amount: number
  description: string
  date: string
  goalId?: string
}

export interface Budget {
  month: string
  totalBudget: number
  categories: { [category: string]: number }
}

export interface ExpenseCategory {
  id: string
  label: string
  color: string
  gradient: string
  isDefault: boolean
}

export interface SavingsGoal {
  id: string
  name: string
  emoji: string
  targetAmount: number
  color: string
  gradient: string
  createdAt: string
  completedAt: string | null
}

export interface CustomLanguage {
  code: string
  name: string
  translations: Record<string, unknown>
}

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'food',          label: 'Food',          color: '#f97316', gradient: 'from-orange-500 to-red-500',    isDefault: true },
  { id: 'transport',     label: 'Transport',     color: '#3b82f6', gradient: 'from-blue-500 to-cyan-500',     isDefault: true },
  { id: 'utilities',     label: 'Utilities',     color: '#eab308', gradient: 'from-yellow-500 to-orange-500', isDefault: true },
  { id: 'entertainment', label: 'Entertainment', color: '#a855f7', gradient: 'from-purple-500 to-pink-500',   isDefault: true },
  { id: 'healthcare',    label: 'Healthcare',    color: '#22c55e', gradient: 'from-green-500 to-teal-500',    isDefault: true },
  { id: 'shopping',      label: 'Shopping',      color: '#ec4899', gradient: 'from-pink-500 to-rose-500',     isDefault: true },
  { id: 'other',         label: 'Other',         color: '#64748b', gradient: 'from-slate-500 to-slate-600',   isDefault: true },
]

interface AppState {
  language: string
  currency: string
  savingsGoal: number

  currentBudget: Budget | null
  budgets: Budget[]
  transactions: Transaction[]
  expenseCategories: ExpenseCategory[]
  savingsGoals: SavingsGoal[]
  customLanguages: CustomLanguage[]

  isDirty: boolean

  setLanguage: (lang: string) => void
  setCurrency: (currency: string) => void
  setSavingsGoal: (goal: number) => void
  setBudget: (budget: Budget) => void
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  deleteTransaction: (id: string) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void

  addExpenseCategory: (category: Omit<ExpenseCategory, 'id' | 'isDefault'>) => void
  updateExpenseCategory: (id: string, updates: Partial<ExpenseCategory>) => void
  deleteExpenseCategory: (id: string) => void

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'completedAt'>) => void
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void
  deleteSavingsGoal: (id: string) => void
  completeGoal: (id: string) => void
  uncompleteGoal: (id: string) => void

  addCustomLanguage: (lang: CustomLanguage) => void
  removeCustomLanguage: (code: string) => void

  // Reset everything EXCEPT customLanguages
  resetToDefaults: () => void
  loadFromFile: () => Promise<void>
  saveToFile: () => Promise<void>
  markDirty: () => void
}

let autoSaveInterval: NodeJS.Timeout | null = null

export const useStore = create<AppState>((set, get) => {
  if (autoSaveInterval) clearInterval(autoSaveInterval)
  autoSaveInterval = setInterval(() => {
    const state = get()
    if (state.isDirty) { state.saveToFile(); set({ isDirty: false }) }
  }, 1000)

  return {
    language: 'en',
    currency: 'USD',
    savingsGoal: 0,
    currentBudget: null,
    budgets: [],
    transactions: [],
    expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
    savingsGoals: [],
    customLanguages: [],
    isDirty: false,

    setLanguage: (lang) => set({ language: lang, isDirty: true }),
    setCurrency: (currency) => set({ currency, isDirty: true }),
    setSavingsGoal: (goal) => set({ savingsGoal: goal, isDirty: true }),

    setBudget: (budget) => {
      set((state) => {
        const idx = state.budgets.findIndex(b => b.month === budget.month)
        const newBudgets = [...state.budgets]
        if (idx >= 0) newBudgets[idx] = budget; else newBudgets.push(budget)
        return { currentBudget: budget, budgets: newBudgets, isDirty: true }
      })
    },

    addTransaction: (transaction) => {
      set((state) => ({
        transactions: [...state.transactions, {
          ...transaction,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }],
        isDirty: true,
      }))
    },

    deleteTransaction: (id) => set((state) => ({
      transactions: state.transactions.filter(t => t.id !== id), isDirty: true,
    })),

    updateTransaction: (id, updates) => set((state) => ({
      transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t), isDirty: true,
    })),

    addExpenseCategory: (cat) => set((state) => ({
      expenseCategories: [...state.expenseCategories, {
        ...cat,
        id: cat.label.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36),
        isDefault: false,
      }],
      isDirty: true,
    })),

    updateExpenseCategory: (id, updates) => set((state) => ({
      expenseCategories: state.expenseCategories.map(c => c.id === id ? { ...c, ...updates } : c), isDirty: true,
    })),

    deleteExpenseCategory: (id) => set((state) => ({
      expenseCategories: state.expenseCategories.filter(c => c.id !== id), isDirty: true,
    })),

    addSavingsGoal: (goal) => set((state) => ({
      savingsGoals: [...state.savingsGoals, {
        ...goal,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString().split('T')[0],
        completedAt: null,
      }],
      isDirty: true,
    })),

    updateSavingsGoal: (id, updates) => set((state) => ({
      savingsGoals: state.savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g), isDirty: true,
    })),

    deleteSavingsGoal: (id) => set((state) => ({
      savingsGoals: state.savingsGoals.filter(g => g.id !== id),
      transactions: state.transactions.filter(t => !(t.type === 'savings' && t.goalId === id)),
      isDirty: true,
    })),

    completeGoal: (id) => set((state) => ({
      savingsGoals: state.savingsGoals.map(g =>
        g.id === id ? { ...g, completedAt: new Date().toISOString().split('T')[0] } : g
      ),
      isDirty: true,
    })),

    uncompleteGoal: (id) => set((state) => ({
      savingsGoals: state.savingsGoals.map(g =>
        g.id === id ? { ...g, completedAt: null } : g
      ),
      isDirty: true,
    })),

    addCustomLanguage: (lang) => set((state) => ({
      customLanguages: [
        ...state.customLanguages.filter(l => l.code !== lang.code),
        lang,
      ],
      isDirty: true,
    })),

    removeCustomLanguage: (code) => set((state) => ({
      customLanguages: state.customLanguages.filter(l => l.code !== code),
      // switch to English if current lang is removed
      language: state.language === code ? 'en' : state.language,
      isDirty: true,
    })),

    // Note: customLanguages are intentionally preserved on reset
    resetToDefaults: () => set((state) => ({
      language: 'en', currency: 'USD', savingsGoal: 0,
      currentBudget: null, budgets: [], transactions: [],
      expenseCategories: DEFAULT_EXPENSE_CATEGORIES, savingsGoals: [],
      customLanguages: state.customLanguages, // keep custom languages!
      isDirty: true,
    })),

    markDirty: () => set({ isDirty: true }),

    loadFromFile: async () => {
      if (window.electron) {
        try {
          const data = await window.electron.loadData()
          if (data) {
            set({
              language: data.language || 'en',
              currency: data.currency || 'USD',
              savingsGoal: data.savingsGoal || 0,
              currentBudget: data.currentBudget || null,
              budgets: data.budgets || [],
              transactions: data.transactions || [],
              expenseCategories: data.expenseCategories?.length ? data.expenseCategories : DEFAULT_EXPENSE_CATEGORIES,
              savingsGoals: data.savingsGoals || [],
              customLanguages: data.customLanguages || [],
              isDirty: false,
            })
          }
        } catch (error) { console.error('Error loading data:', error) }
      }
    },

    saveToFile: async () => {
      if (window.electron) {
        try {
          const s = get()
          await window.electron.saveData({
            language: s.language, currency: s.currency, savingsGoal: s.savingsGoal,
            currentBudget: s.currentBudget, budgets: s.budgets, transactions: s.transactions,
            expenseCategories: s.expenseCategories, savingsGoals: s.savingsGoals,
            customLanguages: s.customLanguages,
          })
        } catch (error) { console.error('Error saving data:', error) }
      }
    },
  }
})