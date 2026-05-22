import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Header.css'
import { CONFIG } from '../config'
import { debugHeader, DEBUG_LEVELS, getDebugLevel } from '../utils/debug'

const THEME_ICONS = { light: '☀', dark: '☾', auto: '◐' }
const THEME_LABELS = { light: '亮色', dark: '暗色', auto: '自动' }
const THEME_CYCLE = ['light', 'dark', 'auto']

function buildTree(categories, articles) {
  const tree = {}
  categories.forEach(cat => { tree[cat.id] = { ...cat, topics: {} } })
  articles.forEach(article => {
    const cat = tree[article.category]
    if (cat) {
      if (!cat.topics[article.topic]) {
        cat.topics[article.topic] = { name: article.topic, articles: [] }
      }
      cat.topics[article.topic].articles.push(article)
    }
  })
  if (getDebugLevel() >= DEBUG_LEVELS.RUN) debugHeader.log('Navigation tree built:', {
    categories: Object.keys(tree).length,
    topics: Object.values(tree).reduce((sum, c) => sum + Object.keys(c.topics).length, 0),
    totalArticles: articles.length
  })
  return tree
}

function Header({ categories, articles, isSidebarOpen, onToggleSidebar, theme, onThemeChange }) {
  const [query, setQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [expandedTopics, setExpandedTopics] = useState(new Set())
  const [currentArticleId, setCurrentArticleId] = useState(null)
  const clickTimer = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const tree = buildTree(categories, articles)
  const isDev = getDebugLevel() >= DEBUG_LEVELS.DEV

  const toggleCategory = (catId, e) => {
    if (e) e.stopPropagation()
    const newSet = new Set(expandedCategories)
    if (newSet.has(catId)) newSet.delete(catId)
    else newSet.add(catId)
    setExpandedCategories(newSet)
  }

  const toggleTopic = (catId, topicName, e) => {
    if (e) e.stopPropagation()
    const key = `${catId}-${topicName}`
    const newSet = new Set(expandedTopics)
    if (newSet.has(key)) newSet.delete(key)
    else newSet.add(key)
    setExpandedTopics(newSet)
  }

  const handleCategoryClick = (catId) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
      toggleAllTopicsForCategory(catId)
      return
    }
    clickTimer.current = setTimeout(() => { clickTimer.current = null }, 300)
    if (!expandedCategories.has(catId)) {
      setExpandedCategories(new Set([...expandedCategories, catId]))
    }
    navigate(`/category/${encodeURIComponent(catId)}`)
    if (isMobile) onToggleSidebar()
  }

  const handleTopicClick = (catId, topicName) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
      toggleTopic(catId, topicName)
      return
    }
    clickTimer.current = setTimeout(() => { clickTimer.current = null }, 300)
    if (!expandedCategories.has(catId)) {
      setExpandedCategories(new Set([...expandedCategories, catId]))
    }
    navigate(`/category/${encodeURIComponent(catId)}`)
    if (isMobile) onToggleSidebar()
  }

  const toggleAllTopicsForCategory = (catId, e) => {
    if (e) e.stopPropagation()
    const catData = tree[catId]
    const allTopicsForCat = Object.keys(catData?.topics || []).map(t => `${catId}-${t}`)

    const allExpanded = expandedCategories.has(catId) &&
      allTopicsForCat.every(k => expandedTopics.has(k))

    const newCats = new Set(expandedCategories)
    const newTopics = new Set(expandedTopics)

    if (allExpanded) {
      newCats.delete(catId)
      allTopicsForCat.forEach(k => newTopics.delete(k))
    } else {
      newCats.add(catId)
      allTopicsForCat.forEach(k => newTopics.add(k))
    }

    setExpandedCategories(newCats)
    setExpandedTopics(newTopics)
  }

  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(theme)
    onThemeChange(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length])
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  useEffect(() => {
    const checkMobile = () => {
      const newIsMobile = window.innerWidth <= CONFIG.HEADER.MOBILE_BREAKPOINT
      if (newIsMobile !== isMobile) setIsMobile(newIsMobile)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isMobile])

  useEffect(() => {
    const artMatch = location.pathname.match(/\/article\/(.+)/)
    const catMatch = location.pathname.match(/\/category\/([^/]+)/)
    setCurrentArticleId(artMatch ? decodeURIComponent(artMatch[1]) : null)

    if (catMatch) {
      const catId = decodeURIComponent(catMatch[1])
      if (!expandedCategories.has(catId)) {
        setExpandedCategories(new Set([...expandedCategories, catId]))
      }
    }
  }, [location.pathname])

  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={onToggleSidebar}
              title={isSidebarOpen ? '收起目录' : '展开目录'}
            >
              <span className="toggle-icon">{isSidebarOpen ? '✕' : '☰'}</span>
            </button>
          </div>

          <div className="header-center">
            <form className="header-search-form" onSubmit={handleSearch}>
              <span className="search-icon">⌕</span>
              <input
                type="text"
                className="header-search-input"
                placeholder={isMobile ? '搜索' : '搜索文档...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="header-right">
            <button
              className="theme-toggle"
              onClick={cycleTheme}
              title={`主题：${THEME_LABELS[theme]}`}
            >
              {THEME_ICONS[theme]}
            </button>
            <Link to="/" className="logo">
              <span className="logo-icon">◈</span>
              {!isMobile && <span className="logo-text">ThinkingWithAgents</span>}
            </Link>
          </div>
        </div>
      </header>

      <div className="header-spacer"></div>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <div className="sidebar-title">知识库目录</div>
          </div>

          <nav className="categories-nav">
            {categories.map(cat => {
              const catData = tree[cat.id]
              const isExpanded = expandedCategories.has(cat.id)
              const hasTopics = catData && Object.keys(catData.topics).length > 0

              return (
                <div key={cat.id} className="tree-item">
                  <div className="category-link tree-node">
                    <span className="tree-arrow" onClick={(e) => toggleCategory(cat.id, e)}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span
                      className="category-body"
                      onClick={() => handleCategoryClick(cat.id)}
                    >
                      <span className="category-icon">{cat.icon}</span>
                      <span className="category-name">{cat.name}</span>
                    </span>
                    {hasTopics && (
                      <button
                        className="cat-expand-btn"
                        onClick={(e) => toggleAllTopicsForCategory(cat.id, e)}
                        title={isExpanded ? '全部折叠' : '全部展开'}
                      >
                        {isExpanded ? '⊟' : '⊞'}
                      </button>
                    )}
                  </div>

                  {isExpanded && catData && Object.entries(catData.topics).map(([topicName, topicData]) => {
                    const topicKey = `${cat.id}-${topicName}`
                    const isTopicExpanded = expandedTopics.has(topicKey)

                    return (
                      <div key={topicKey} className="topic-tree">
                        <div className="topic-link tree-node">
                          <span className="tree-arrow" onClick={(e) => toggleTopic(cat.id, topicName, e)}>
                            {isTopicExpanded ? '▼' : '▶'}
                          </span>
                          <span className="topic-body" onClick={() => handleTopicClick(cat.id, topicName)}>
                            <span className="topic-name">{topicName}</span>
                            <span className="topic-count">({topicData.articles.length})</span>
                          </span>
                        </div>

                        {isTopicExpanded && (
                          <div className="articles-tree">
                            {topicData.articles.map(article => (
                              <Link
                                key={article.id}
                                to={`/article/${article.id}`}
                                className={`article-link ${currentArticleId === article.id ? 'active' : ''}`}
                                onClick={() => { if (isMobile) onToggleSidebar() }}
                              >
                                {article.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>

      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay show" onClick={onToggleSidebar} />
      )}
    </>
  )
}

export default Header
