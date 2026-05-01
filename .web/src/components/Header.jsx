import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Header.css'
import { CONFIG } from '../config'

function buildTree(categories, articles) {
  const tree = {}
  
  categories.forEach(cat => {
    tree[cat.id] = {
      ...cat,
      topics: {}
    }
  })
  
  articles.forEach(article => {
    const cat = tree[article.category]
    if (cat) {
      if (!cat.topics[article.topic]) {
        cat.topics[article.topic] = {
          name: article.topic,
          articles: []
        }
      }
      cat.topics[article.topic].articles.push(article)
    }
  })
  
  return tree
}

function Header({ categories, articles, isSidebarOpen, onToggleSidebar }) {
  const [query, setQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [expandedTopics, setExpandedTopics] = useState(new Set())
  const navigate = useNavigate()
  const location = useLocation()

  const tree = buildTree(categories, articles)

  const toggleCategory = (catId) => {
    const newSet = new Set(expandedCategories)
    if (newSet.has(catId)) {
      newSet.delete(catId)
    } else {
      newSet.add(catId)
    }
    setExpandedCategories(newSet)
  }

  const toggleTopic = (catId, topicName, e) => {
    e.stopPropagation()
    const key = `${catId}-${topicName}`
    const newSet = new Set(expandedTopics)
    if (newSet.has(key)) {
      newSet.delete(key)
    } else {
      newSet.add(key)
    }
    setExpandedTopics(newSet)
  }

  const expandAll = () => {
    const allCats = new Set(categories.map(c => c.id))
    const allTopics = new Set()
    Object.entries(tree).forEach(([catId, catData]) => {
      Object.keys(catData.topics).forEach(topicName => {
        allTopics.add(`${catId}-${topicName}`)
      })
    })
    setExpandedCategories(allCats)
    setExpandedTopics(allTopics)
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
    setExpandedTopics(new Set())
  }

  const handleCategoryDoubleClick = (catId, e) => {
    e.stopPropagation()
    const catData = tree[catId]
    
    const allTopicsForCat = Object.keys(catData?.topics || []).map(topicName => `${catId}-${topicName}`)
    const allTopicsForCatSet = new Set(allTopicsForCat)
    
    const hasAllExpanded = expandedCategories.has(catId) && 
      allTopicsForCat.every(key => expandedTopics.has(key))
    
    const newExpandedCats = new Set(expandedCategories)
    const newExpandedTopics = new Set(expandedTopics)
    
    if (hasAllExpanded) {
      newExpandedCats.delete(catId)
      allTopicsForCat.forEach(key => newExpandedTopics.delete(key))
    } else {
      newExpandedCats.add(catId)
      allTopicsForCat.forEach(key => newExpandedTopics.add(key))
    }
    
    setExpandedCategories(newExpandedCats)
    setExpandedTopics(newExpandedTopics)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  const handleArticleClick = () => {
    if (isMobile) {
      onToggleSidebar()
    }
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= CONFIG.HEADER.MOBILE_BREAKPOINT)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const match = location.pathname.match(/\/category\/([^/]+)/)
    if (match) {
      const catId = decodeURIComponent(match[1])
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
              <span className="toggle-icon">
                {isSidebarOpen ? '✕' : '☰'}
              </span>
            </button>
          </div>
            
          <Link to="/" className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">ThinkingWithAgents</span>
          </Link>

          <div className="header-right"></div>
        </div>
      </header>
      
      <div className="header-spacer"></div>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <div className="sidebar-title">知识库目录</div>
            <div className="sidebar-controls">
              <button className="control-btn" onClick={expandAll} title="全部展开">
                ➕
              </button>
              <button className="control-btn" onClick={collapseAll} title="全部折叠">
                ➖
              </button>
            </div>
          </div>
          
          <div className="sidebar-search">
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                placeholder="搜索文档..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">⌕</button>
            </form>
          </div>
          
          <nav className="categories-nav">
            {categories.map(cat => {
              const catData = tree[cat.id]
              const isExpanded = expandedCategories.has(cat.id)
              
              return (
                <div key={cat.id} className="tree-item">
                  <div 
                    className={`category-link tree-node ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleCategory(cat.id)}
                    onDoubleClick={(e) => handleCategoryDoubleClick(cat.id, e)}
                  >
                    <span className="tree-arrow">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className="category-icon">{cat.icon}</span>
                    <span className="category-name">{cat.name}</span>
                  </div>
                  
                  {isExpanded && catData && Object.entries(catData.topics).map(([topicName, topicData]) => {
                    const topicKey = `${cat.id}-${topicName}`
                    const isTopicExpanded = expandedTopics.has(topicKey)
                    
                    return (
                      <div key={topicKey} className="topic-tree">
                        <div 
                          className={`topic-link tree-node ${isTopicExpanded ? 'expanded' : ''}`}
                          onClick={(e) => toggleTopic(cat.id, topicName, e)}
                        >
                          <span className="tree-arrow">
                            {isTopicExpanded ? '▼' : '▶'}
                          </span>
                          <span className="topic-name">{topicName}</span>
                          <span className="topic-count">({topicData.articles.length})</span>
                        </div>
                        
                        {isTopicExpanded && (
                          <div className="articles-tree">
                            {topicData.articles.map(article => (
                              <Link
                                key={article.id}
                                to={`/article/${encodeURIComponent(article.id)}`}
                                className="article-link"
                                onClick={handleArticleClick}
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
        <div 
          className="sidebar-overlay show" 
          onClick={onToggleSidebar}
        />
      )}
    </>
  )
}

export default Header
