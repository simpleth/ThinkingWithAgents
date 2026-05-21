import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import './Category.css'
import { CONFIG } from '../config'

function Category({ categories, articles }) {
  const { categoryId } = useParams()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoaded(false)
    setTimeout(() => setLoaded(true), 100)
  }, [categoryId])

  const category = categories.find(c => c.id === categoryId)
  const categoryArticles = articles.filter(a => a.category === categoryId)

  if (!category) {
    return (
      <div className="category-not-found">
        <h2>分类不存在</h2>
        <Link to="/">返回首页</Link>
      </div>
    )
  }

  return (
    <div className="category-page">
      <div className="category-hero" style={{ '--cat-color': category.color }}>
        <div className="category-hero-content">
          <Link to="/" className="back-link">← 返回首页</Link>
          <div className="category-hero-icon">{category.icon}</div>
          <h1 className="category-hero-title">{category.name}</h1>
          <p className="category-hero-count">
            共 {categoryArticles.length} 篇研究报告
          </p>
        </div>
        <div className="category-hero-decoration">
          <div className="hero-glow"></div>
        </div>
      </div>

      <div className="category-content">
        {categoryArticles.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">◈</span>
            <p>该分类暂无研究报告</p>
          </div>
        ) : (
          <div className={`articles-list ${loaded ? 'loaded' : ''}`}>
            {categoryArticles.map((article, index) => (
              <Link
                key={article.id}
                to={`/article/${article.id}`}
                className="article-card"
                style={{ '--delay': `${index * 80}ms` }}
              >
                <div className="article-meta">
                  <span className="article-version">{article.version}</span>
                  <span className="article-date">{article.date}</span>
                </div>
                <h2 className="article-title">{article.title}</h2>
                <p className="article-desc">{article.description}</p>
                {Array.isArray(article.tags) && article.tags.length > 0 && (
                  <div className="article-card-tags">
                    {article.tags.slice(0, CONFIG.ARTICLES.TAGS_MAX_DISPLAY).map(tag => (
                      <span key={tag} className="tag-pill">{tag}</span>
                    ))}
                  </div>
                )}
                <span className="article-read">
                  阅读全文
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Category
