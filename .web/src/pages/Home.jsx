import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Home.css'
import { CONFIG } from '../config'

function monthsSince(dateStr) {
  if (!dateStr) return 0
  const [y, m] = dateStr.split('-').map(Number)
  if (!y || !m) return 0
  const now = new Date()
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m)
}

function isStale(dateStr) {
  return monthsSince(dateStr) >= CONFIG.FRESHNESS.STALE_MONTHS
}

function isArchived(dateStr) {
  return monthsSince(dateStr) >= CONFIG.FRESHNESS.ARCHIVE_MONTHS
}

function Home({ categories, articles }) {
  const navigate = useNavigate()

  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, CONFIG.HOME.RECENT_ARTICLES_COUNT)

  const featuredArticles = articles.slice(0, CONFIG.HOME.FEATURED_ARTICLES_COUNT)

  const allTags = []
  const tagSet = new Set()
  articles.forEach(a => {
    if (Array.isArray(a.tags)) {
      a.tags.forEach(t => {
        if (!tagSet.has(t)) {
          tagSet.add(t)
          allTags.push(t)
        }
      })
    }
  })
  allTags.sort()

  const handleTagClick = (tag) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`)
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">技术研究档案库</h1>
        <p className="home-subtitle">探索技术前沿，记录研究历程</p>
      </header>

      {allTags.length > 0 && (
        <section className="home-section">
          <h2 className="section-title">标签云</h2>
          <div className="tags-cloud">
            {allTags.map(tag => (
              <button
                key={tag}
                className="tag-cloud-pill"
                onClick={() => handleTagClick(tag)}
                title={`搜索标签: ${tag}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="home-section">
        <h2 className="section-title">最近更新</h2>
        <div className="recent-list">
          {recentArticles.map(article => {
            const cat = categories.find(c => c.id === article.category)
            const stale = isStale(article.date)
            const archived = isArchived(article.date)
            return (
              <Link
                key={article.id}
                to={`/article/${article.id}`}
                className="recent-item"
              >
                <span className="recent-icon" style={{ color: cat?.color }}>{cat?.icon}</span>
                <div className="recent-info">
                  <div className="recent-title-row">
                    <span className="recent-title">{article.title}</span>
                    {stale && <span className="expiry-warn-badge">{archived ? '已归档' : '可能过时'}</span>}
                  </div>
                  <span className="recent-category">{cat?.name}</span>
                  {Array.isArray(article.tags) && article.tags.length > 0 && (
                    <div className="recent-tags">
                      {article.tags.slice(0, CONFIG.ARTICLES.TAGS_MAX_DISPLAY).map(tag => (
                        <span key={tag} className="tag-pill">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="recent-date">{article.date}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="home-section">
        <h2 className="section-title">精选研究</h2>
        <div className="featured-list">
          {featuredArticles.map(article => {
            const cat = categories.find(c => c.id === article.category)
            const stale = isStale(article.date)
            const archived = isArchived(article.date)
            return (
              <div
                key={article.id}
                className="featured-item"
              >
                <Link to={`/article/${article.id}`} className="featured-link" draggable="false">
                  <div className="featured-header">
                    <div className="featured-meta">
                      <span className="featured-category" style={{ color: cat?.color }}>
                        {cat?.icon} {cat?.name}
                      </span>
                      <span className="featured-version">{article.version}</span>
                      <span className="featured-date">{article.date}</span>
                      {stale && <span className="expiry-warn-badge">{archived ? '已归档' : '可能过时'}</span>}
                    </div>
                    <h3 className="featured-title">{article.title}</h3>
                  </div>
                  {article.description && <p className="featured-desc">{article.description}</p>}
                  {Array.isArray(article.tags) && article.tags.length > 0 && (
                    <div className="featured-tags">
                      {article.tags.slice(0, CONFIG.ARTICLES.TAGS_MAX_DISPLAY).map(tag => (
                        <span key={tag} className="tag-pill">{tag}</span>
                      ))}
                    </div>
                  )}
                </Link>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Home
