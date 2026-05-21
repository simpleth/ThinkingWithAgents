import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import Home from '../pages/Home'

const mockArticles = [
  {
    id: '001_Agent_test_article1',
    category: 'Agent',
    title: 'AI 协作经验总结',
    version: 'v1.0',
    date: '2026-04',
    description: '与 AI Agent 协作开发的经验总结',
    tags: ['agent', 'collaboration', 'dry'],
    status: 'published',
    related: ['article2.md'],
    path: 'docs/test/article1.md'
  },
  {
    id: '002_JDK_test_article2',
    category: 'JDK',
    title: 'JDK 演进史',
    version: 'v2.0',
    date: '2025-02',
    description: 'JDK 发展历程',
    tags: ['java', 'evolution'],
    status: 'published',
    related: [],
    path: 'docs/test/article2.md'
  }
]

const mockCategories = [
  { id: 'Agent', name: 'Agent', icon: 'A', color: '#6ec977' },
  { id: 'JDK', name: 'JDK', icon: 'J', color: '#df7785' }
]

function renderHome() {
  return render(
    <HashRouter>
      <Home categories={mockCategories} articles={mockArticles} />
    </HashRouter>
  )
}

describe('Home component', () => {
  it('renders the home title', () => {
    renderHome()
    expect(screen.getByText('技术研究档案库')).toBeInTheDocument()
  })

  it('renders featured article titles', () => {
    renderHome()
    const titles = screen.getAllByText('AI 协作经验总结')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('renders tag cloud tags', () => {
    renderHome()
    const tags = screen.getAllByText('agent')
    expect(tags.length).toBeGreaterThanOrEqual(1)
  })

  it('shows stale badge on old articles', () => {
    renderHome()
    const badges = screen.getAllByText('已归档')
    expect(badges.length).toBeGreaterThanOrEqual(1)
  })

  it('renders category names in recent list', () => {
    renderHome()
    expect(screen.getByText('Agent')).toBeInTheDocument()
    expect(screen.getByText('JDK')).toBeInTheDocument()
  })

  it('renders version badges', () => {
    renderHome()
    expect(screen.getByText('v1.0')).toBeInTheDocument()
    expect(screen.getByText('v2.0')).toBeInTheDocument()
  })
})
