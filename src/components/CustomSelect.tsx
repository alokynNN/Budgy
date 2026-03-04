import React, { useState, useRef, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  color?: string
  icon?: React.ReactNode
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  accentColor?: string
  className?: string
}

// ── Global registry so opening one dropdown closes all others ──────────
const registry = new Map<string, () => void>()

let idCounter = 0
function nextId() { return String(++idCounter) }

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  accentColor = 'blue',
  className = '',
}) => {
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  const instanceId = useRef(nextId())
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selected = options.find(o => o.value === value)

  // Register close callback in global registry
  useEffect(() => {
    const id = instanceId.current
    registry.set(id, () => setOpen(false))
    return () => { registry.delete(id) }
  }, [])

  const accentCheckBg =
    accentColor === 'red'    ? '#ef4444' :
    accentColor === 'green'  ? '#22c55e' :
    accentColor === 'purple' ? '#a855f7' :
                               '#3b82f6'
  const accentBorder =
    accentColor === 'red'    ? 'rgba(239,68,68,0.6)' :
    accentColor === 'green'  ? 'rgba(34,197,94,0.6)' :
    accentColor === 'purple' ? 'rgba(168,85,247,0.6)' :
                               'rgba(59,130,246,0.6)'
  const accentRing =
    accentColor === 'red'    ? 'rgba(239,68,68,0.2)' :
    accentColor === 'green'  ? 'rgba(34,197,94,0.2)' :
    accentColor === 'purple' ? 'rgba(168,85,247,0.2)' :
                               'rgba(59,130,246,0.2)'

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = Math.min(248, options.length * 44 + 16)
    const spaceBelow = viewportHeight - rect.bottom
    const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow

    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      ...(openUpward
        ? { bottom: viewportHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    })
  }, [options.length])

  const handleOpen = () => {
    // Close all other open selects
    registry.forEach((closeFn, id) => {
      if (id !== instanceId.current) closeFn()
    })
    updatePosition()
    setOpen(true)
    const idx = options.findIndex(o => o.value === value)
    setHighlightedIndex(idx >= 0 ? idx : 0)
  }

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (listRef.current?.parentElement?.parentElement?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) setHighlightedIndex(-1)
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault(); handleOpen()
      }
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex(i => Math.min(i + 1, options.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && highlightedIndex >= 0) { e.preventDefault(); onChange(options[highlightedIndex].value); setOpen(false) }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  useEffect(() => {
    if (open && highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex, open])

  const dropdown = open ? ReactDOM.createPortal(
    <>
      <style>{`@keyframes selectDropIn{from{opacity:0;transform:scaleY(0.92) translateY(-5px)}to{opacity:1;transform:scaleY(1) translateY(0)}}`}</style>
      <div style={dropdownStyle}>
        <ul
          ref={listRef}
          role="listbox"
          style={{
            background: 'rgba(17,24,39,0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(100,116,139,0.3)',
            borderRadius: '14px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
            padding: '6px',
            maxHeight: '248px',
            overflowY: 'auto',
            animation: 'selectDropIn 0.15s cubic-bezier(0.16,1,0.3,1)',
            transformOrigin: 'top',
          }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isHighlighted = index === highlightedIndex
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => { e.preventDefault(); onChange(option.value); setOpen(false) }}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: '9px', cursor: 'pointer', userSelect: 'none',
                  transition: 'background 0.1s',
                  background: isHighlighted ? 'rgba(255,255,255,0.07)' : isSelected ? 'rgba(255,255,255,0.03)' : 'transparent',
                  marginBottom: index < options.length - 1 ? 1 : 0,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  {option.icon}
                  {option.color && (
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: option.color,
                      boxShadow: `0 0 8px ${option.color}99`,
                    }} />
                  )}
                  <span style={{
                    fontSize: '0.875rem', fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? '#f8fafc' : '#94a3b8',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {option.label}
                  </span>
                </span>
                {isSelected && (
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginLeft: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: accentCheckBg,
                    boxShadow: `0 0 10px ${accentCheckBg}60`,
                  }}>
                    <Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} />
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </>,
    document.body
  ) : null

  return (
    <div className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => open ? setOpen(false) : handleOpen()}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={open ? {
          borderColor: accentBorder,
          boxShadow: `0 0 0 3px ${accentRing}`,
          background: 'rgba(51,65,85,0.7)',
        } : undefined}
        className="w-full flex items-center justify-between bg-slate-700/50 text-white rounded-xl px-4 py-2.5 border border-slate-600/50 hover:border-slate-500/70 hover:bg-slate-700/70 transition-all duration-150 outline-none"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {selected?.icon}
          {selected?.color && (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: selected.color, boxShadow: `0 0 7px ${selected.color}99` }}
            />
          )}
          <span className={`truncate text-sm font-medium ${selected ? 'text-white' : 'text-slate-400'}`}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {dropdown}
    </div>
  )
}

export default CustomSelect