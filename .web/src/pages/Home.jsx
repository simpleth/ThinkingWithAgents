import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'
import { CONFIG, REGEX_PATTERNS } from '../config'

function Home({ categories, articles }) {
  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, CONFIG.HOME.RECENT_ARTICLES_COUNT)

  const featuredArticles = articles.slice(0, CONFIG.HOME.FEATURED_ARTICLES_COUNT)

  const cleanDescription = (text) => {
    if (!text) return ''

    let result = text

    result = result.replace(REGEX_PATTERNS.BOLD, '')
    result = result.replace(REGEX_PATTERNS.VERSION_LABEL, '')
    result = result.replace(REGEX_PATTERNS.UPDATE_LABEL, '')
    result = result.replace(REGEX_PATTERNS.SOURCE_LABEL, '')
    result = result.replace(REGEX_PATTERNS.ANGLE_BRACKET, '')
    result = result.replace(REGEX_PATTERNS.ASTERISK, '')
    result = result.replace(REGEX_PATTERNS.BACKTICK, '')
    result = result.replace(REGEX_PATTERNS.MARKDOWN_LINK, '$1')
    result = result.replace(REGEX_PATTERNS.MULTIPLE_SPACES, ' ')
    result = result.trim()

    if (!result) {
      result = text.slice(0, CONFIG.HOME.FALLBACK_DESCRIPTION_LENGTH)
        .replace(REGEX_PATTERNS.MARKDOWN_FORMAT, '')
        .replace(REGEX_PATTERNS.NEWLINE, ' ')
        .trim()
    }

    return result.slice(0, CONFIG.HOME.DESCRIPTION_MAX_LENGTH)
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">技术研究档案库</h1>
        <p className="home-subtitle">探索技术前沿，记录研究历程</p>
      </header>

      <section className="home-section">
        <h2 className="section-title">最近更新</h2>
        <div className="recent-list">
          {recentArticles.map(article => {
            const cat = categories.find(c => c.id === article.category)
            return (
              <Link
                key={article.id}
                to={`/article/${article.id}`}
                className="recent-item"
              >
                <span className="recent-icon" style={{ color: cat?.color }}>{cat?.icon}</span>
                <div className="recent-info">
                  <span className="recent-title">{article.title}</span>
                  <span className="recent-category">{cat?.name}</span>
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
            const desc = cleanDescription(article.description)
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
                    </div>
                    <h3 className="featured-title">{article.title}</h3>
                  </div>
                  {desc && <p className="featured-desc">{desc}</p>}
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
