import React, { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import './Search.css'
import { CONFIG } from '../config'

function scoreArticle(article, queryWords, category) {
  let score = 0
  const titleLower = (article.title || '').toLowerCase()
  const descLower = (article.description || '').toLowerCase()
  const catNameLower = (category?.name || '').toLowerCase()
  const tags = Array.isArray(article.tags) ? article.tags.map(t => t.toLowerCase()) : []

  for (const word of queryWords) {
    if (titleLower.includes(word)) {
      score += CONFIG.SEARCH.WEIGHT_TITLE
    }
    if (tags.some(t => t.includes(word) || word.includes(t))) {
      score += CONFIG.SEARCH.WEIGHT_TAG
    }
    if (catNameLower.includes(word)) {
      score += CONFIG.SEARCH.WEIGHT_CATEGORY
    }
    if (descLower.includes(word)) {
      score += CONFIG.SEARCH.WEIGHT_DESCRIPTION
    }
  }

  return score
}

function highlightText(text, queryWords) {
  if (!text || queryWords.length === 0) return text
  const escapedWords = queryWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = escapedWords.join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  const parts = text.split(regex)
  const testRegex = new RegExp(pattern, 'i')
  return parts.map((part, i) =>
    testRegex.test(part) ? <mark key={i}>{part}</mark> : part
  )
}

function Search({ articles, categories }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const navigate = useNavigate()

  const queryWords = useMemo(() => {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 0)
  }, [query])

  const results = useMemo(() => {
    if (!query || queryWords.length === 0) return []
    const scored = articles.map(article => {
      const cat = categories.find(c => c.id === article.category)
      return {
        article,
        score: scoreArticle(article, queryWords, cat)
      }
    })
    return scored
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
  }, [query, queryWords, articles, categories])

  useEffect(() => {
    setSearchQuery(query)
  }, [query])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1 className="search-title">搜索文档</h1>
        <form className="search-form-large" onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="输入关键词搜索..."
            className="search-input-large"
            autoFocus
          />
          <button type="submit" className="search-btn-large">搜索</button>
        </form>
      </div>

      <div className="search-results">
        {query && (
          <div className="results-header">
            <span className="results-count">
              {results.length} 个结果
            </span>
            <span className="results-query">
              关于 "{query}"
            </span>
          </div>
        )}

        {results.length > 0 ? (
          <div className="results-list">
            {results.map(({ article, score }, index) => {
              const category = categories.find(c => c.id === article.category)
              return (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  className="result-item"
                  style={{ '--delay': `${index * 50}ms` }}
                >
                  <div className="result-category" style={{ color: category?.color }}>
                    {category?.icon} {category?.name}
                  </div>
                  <h3 className="result-title">{highlightText(article.title, queryWords)}</h3>
                  <p className="result-desc">{highlightText(article.description, queryWords)}</p>
                  <div className="result-meta">
                    <span className="result-version">{article.version}</span>
                    <span className="result-date">{article.date}</span>
                    <span className="result-score" title="匹配分数">{score}分</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : query ? (
          <div className="no-results">
            <span className="no-results-icon">◈</span>
            <p>未找到相关文档</p>
            <span className="no-results-hint">尝试使用不同的关键词</span>
          </div>
        ) : (
          <div className="search-hint">
            <p>输入关键词开始搜索</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
