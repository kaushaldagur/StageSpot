'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal, Sheet, Button, ChipRow } from '@/components'

const SUGGESTIONS = ['acoustic', 'low-tempo', 'singer-songwriter', 'energy', 'acoustic guitar', 'emotional']

interface AISearchSheetProps {
  isOpen: boolean
  onClose: () => void
}

export const AISearchSheet = ({ isOpen, onClose }: AISearchSheetProps) => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<any[] | null>(null)

  const handleSuggestionClick = (suggestion: string) => {
    if (selectedSuggestions.includes(suggestion)) {
      setSelectedSuggestions(selectedSuggestions.filter(s => s !== suggestion))
    } else {
      setSelectedSuggestions([...selectedSuggestions, suggestion])
    }
  }

  // PRD 5.5: expand the free-text description into filters and show
  // matching verified performers
  const handleSearch = async () => {
    if (!query && selectedSuggestions.length === 0) return
    setSearching(true)
    setResults(null)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, chips: selectedSuggestions }),
      })
      const data = await res.json()
      setResults(data.performers || [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const openPerformer = (id: string) => {
    onClose()
    router.push(`/app/performer/${id}`)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Sheet title="Describe what you want" subtitle="Not sure how to search? Tell us the vibe." onClose={onClose}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Moody, acoustic, late-night energy"
            className="sheet-input"
          />

          {/* Suggestions */}
          <div>
            <ChipRow>
              {SUGGESTIONS.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '10px',
                    fontSize: '10.5px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedSuggestions.includes(suggestion)
                      ? 'var(--accent)'
                      : 'var(--accent-soft)',
                    color: selectedSuggestions.includes(suggestion)
                      ? '#FFF'
                      : 'var(--accent-text)',
                    transition: 'all 0.2s',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </ChipRow>
          </div>

          {/* Search Button */}
          <Button variant="primary" fullWidth onClick={handleSearch} disabled={searching}>
            {searching ? 'Searching…' : 'Show Matching Performers'}
          </Button>

          {/* Results */}
          {results !== null && (
            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {results.length === 0 ? (
                <div style={{ textAlign: 'center', fontSize: '11.5px', color: 'var(--text-2)', padding: '10px 0' }}>
                  No matching performers found. Try different words.
                </div>
              ) : (
                results.map(p => (
                  <button
                    key={p.id}
                    onClick={() => openPerformer(p.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-2)' }}>{p.act_type}</div>
                    </div>
                    <span className="m-chip">★ {p.rating || 0}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </Sheet>
    </Modal>
  )
}
