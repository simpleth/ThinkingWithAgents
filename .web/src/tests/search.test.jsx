import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HashRouter, MemoryRouter } from 'react-router-dom'
import Search from '../pages/Search'

const mockArticles = [
  {
    id: '001_Agent_1',
    category: 'Agent',
    title: 'AI 协作经验总结',
    version: 'v1.0',
    date: '2026-04',
    description: 'AI Agent 协作开发经验',
    tags: ['agent', 'collaboration'],
    path: 'docs/test/1.md'
  },
  {
    id: '002_Agent_2',
    category: 'Agent',
    title: '设计实践',
    version: 'v1.0',
    date: '2026-03',
    description: '避免过度设计的实践',
    tags: ['design', 'dry'],
    path: 'docs/test/2.md'
  },
  {
    id: '003_JDK_3',
    category: 'JDK',
    title: 'JDK 演进史',
    version: 'v2.0',
    date: '2026-04',
    description: 'JDK 发展历程',
    tags: ['java'],
    path: 'docs/test/3.md'
  }
]

const mockCategories = [
  { id: 'Agent', name: 'Agent', icon: 'A', color: '#6ec977' },
  { id: 'JDK', name: 'JDK', icon: 'J', color: '#df7785' }
]

function renderSearch(initialPath = '/search') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Search articles={mockArticles} categories={mockCategories} />
    </MemoryRouter>
  )
}

describe('Search component', () => {
  it('renders search page', () => {
    renderSearch()
    expect(screen.getByText('搜索文档')).toBeInTheDocument()
  })

  it('shows search input', () => {
    renderSearch()
    expect(screen.getByPlaceholderText('输入关键词搜索...')).toBeInTheDocument()
  })

  it('shows hint when no query', () => {
    renderSearch()
    expect(screen.getByText('输入关键词开始搜索')).toBeInTheDocument()
  })

  it('renders results with query', () => {
    renderSearch('/search?q=AI')
    expect(screen.getByText('1 个结果')).toBeInTheDocument()
  })

  it('shows result count with query', () => {
    renderSearch('/search?q=AI')
    expect(screen.getByText(/个结果/)).toBeInTheDocument()
  })

  it('shows no results for non-matching query', () => {
    renderSearch('/search?q=zzz_no_match')
    expect(screen.getByText('未找到相关文档')).toBeInTheDocument()
  })
})
