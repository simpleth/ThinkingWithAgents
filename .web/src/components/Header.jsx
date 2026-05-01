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
          <button 
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            title={isSidebarOpen ? '收起目录' : '展开目录'}
          >
            <span className={`toggle-icon ${isSidebarOpen ? 'open' : ''}`}>
              ☰
            </span>
          </button>
          
          <Link to="/" className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">知识库</span>
          </Link>

          <div className="search-container">
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
        </div>
      </header>
      
      <div className="header-spacer"></div>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-title">知识库目录</div>
          
          <nav className="categories-nav">
            {categories.map(cat => {
              const catData = tree[cat.id]
              const isExpanded = expandedCategories.has(cat.id)
              
              return (
                <div key={cat.id} className="tree-item">
                  <div 
                    className={`category-link tree-node ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleCategory(cat.id)}
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
