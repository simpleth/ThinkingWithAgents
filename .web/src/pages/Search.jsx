import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import './Search.css'

function Search({ articles, categories }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (query) {
      const lowerQuery = query.toLowerCase()
      const filtered = articles.filter(
        a =>
          a.title.toLowerCase().includes(lowerQuery) ||
          a.description.toLowerCase().includes(lowerQuery)
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }, [query, articles])

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
            {results.map((article, index) => {
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
                  <h3 className="result-title">{article.title}</h3>
                  <p className="result-desc">{article.description}</p>
                  <div className="result-meta">
                    <span className="result-version">{article.version}</span>
                    <span className="result-date">{article.date}</span>
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
