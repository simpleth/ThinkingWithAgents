import { describe, it, expect } from 'vitest'

function scoreArticle(article, query, categories) {
  if (!query.trim()) return { score: 0, matches: [] }
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 0)
  const category = categories?.find(c => c.id === article.category)
  let score = 0
  const matches = []

  for (const word of words) {
    if (article.title.toLowerCase().includes(word)) {
      score += 10
      matches.push({ field: 'title', word })
    }
    if (article.tags?.some(t => t.toLowerCase().includes(word))) {
      score += 8
      matches.push({ field: 'tags', word })
    }
    if (category?.name.toLowerCase().includes(word)) {
      score += 5
      matches.push({ field: 'category', word })
    }
    if (article.description?.toLowerCase().includes(word)) {
      score += 3
      matches.push({ field: 'description', word })
    }
  }
  return { score, matches }
}

function highlightText(text, query) {
  if (!query.trim() || !text) return text
  const words = query.split(/\s+/).filter(w => w.length > 0)
  let result = text
  for (const word of words) {
    const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    result = result.replace(regex, '<mark>$1</mark>')
  }
  return result
}

function monthsSince(dateStr) {
  if (!dateStr) return 0
  const [y, m] = dateStr.split('-').map(Number)
  if (!y || !m) return 0
  const now = new Date()
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m)
}

function isStale(dateStr) {
  return monthsSince(dateStr) >= 6
}

function isArchived(dateStr) {
  return monthsSince(dateStr) >= 12
}

describe('search scoring', () => {
  const article = {
    id: '001',
    title: 'AI 协作经验总结',
    category: 'Agent',
    tags: ['agent-collaboration', 'best-practices', 'dry'],
    description: '与 AI Agent 协作开发技术研究档案库的实战经验'
  }

  const categories = [{ id: 'Agent', name: 'Agent' }]

  it('scores title-only match', () => {
    const { score } = scoreArticle(article, '总结', categories)
    expect(score).toBe(10)
  })

  it('scores tag match', () => {
    const { score } = scoreArticle(article, 'dry', categories)
    expect(score).toBe(8)
  })

  it('scores cumulative match', () => {
    const { score } = scoreArticle(article, 'Agent', categories)
    expect(score).toBe(16)
  })

  it('scores description-only match', () => {
    const { score } = scoreArticle(article, '实战', categories)
    expect(score).toBe(3)
  })

  it('accumulates across fields', () => {
    const { score } = scoreArticle(article, '总结 dry', categories)
    expect(score).toBe(18)
  })

  it('returns zero for no match', () => {
    const { score } = scoreArticle(article, 'zzz_not_found', categories)
    expect(score).toBe(0)
  })

  it('handles empty query', () => {
    const { score } = scoreArticle(article, '', categories)
    expect(score).toBe(0)
  })

  it('handles articles without tags', () => {
    const noTags = { ...article, tags: undefined }
    const { score } = scoreArticle(noTags, 'dry', categories)
    expect(score).toBe(0)
  })

  it('scores without category', () => {
    const { score } = scoreArticle(article, '总结', [])
    expect(score).toBe(10)
  })
})

describe('highlightText', () => {
  it('wraps matches in mark tags', () => {
    const result = highlightText('AI 协作经验', 'AI')
    expect(result).toBe('<mark>AI</mark> 协作经验')
  })

  it('is case insensitive', () => {
    const result = highlightText('AI 协作', 'ai')
    expect(result).toBe('<mark>AI</mark> 协作')
  })

  it('handles empty query', () => {
    expect(highlightText('text', '')).toBe('text')
  })

  it('handles empty text', () => {
    expect(highlightText('', 'query')).toBe('')
  })

  it('highlights multiple words', () => {
    const result = highlightText('AI 协作经验总结', 'AI 经验')
    expect(result).toContain('<mark>AI</mark>')
    expect(result).toContain('<mark>经验</mark>')
  })

  it('escapes regex special chars', () => {
    const result = highlightText('test (parens)', '(parens)')
    expect(result).toBe('test <mark>(parens)</mark>')
  })
})

describe('monthsSince', () => {
  it('returns 0 for empty input', () => {
    expect(monthsSince(undefined)).toBe(0)
    expect(monthsSince(null)).toBe(0)
    expect(monthsSince('')).toBe(0)
  })

  it('returns months since given date', () => {
    const m = monthsSince('2020-01')
    expect(m).toBeGreaterThan(60)
  })

  it('returns 0 for current month', () => {
    const now = new Date()
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    expect(monthsSince(current)).toBe(0)
  })
})

describe('isStale', () => {
  it('returns true for old dates', () => {
    expect(isStale('2020-01')).toBe(true)
  })

  it('returns false for recent dates', () => {
    const now = new Date()
    const recent = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    expect(isStale(recent)).toBe(false)
  })
})

describe('isArchived', () => {
  it('returns true for very old dates', () => {
    expect(isArchived('2020-01')).toBe(true)
  })

  it('returns false for dates within a year', () => {
    const now = new Date()
    const recent = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    expect(isArchived(recent)).toBe(false)
  })
})
