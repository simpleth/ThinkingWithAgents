import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import './Article.css'
import { CONFIG } from '../config'

function Article({ articles, categories }) {
  const { articleId } = useParams()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  const article = articles.find(a => a.id === articleId)
  const category = article ? categories.find(c => c.id === article.category) : null
  const relatedArticles = article ? articles.filter(a => a.category === article.category && a.id !== article.id).slice(0, CONFIG.ARTICLE.RELATED_ARTICLES_COUNT) : []

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)

    if (article) {
      fetch(article.path)
        .then(res => res.text())
        .then(text => {
          setContent(text)
          setLoading(false)
        })
        .catch(() => {
          setContent('# 无法加载文档内容\n\n请检查文档路径是否正确。')
          setLoading(false)
        })
    }
  }, [articleId, article])

  if (!article) {
    return (
      <div className="article-not-found">
        <h2>文章不存在</h2>
        <Link to="/">返回首页</Link>
      </div>
    )
  }

  const renderContent = (text) => {
    const lines = text.split('\n')
    let html = []
    let inCodeBlock = false
    let codeContent = []
    let codeLang = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith('```') && !inCodeBlock) {
        inCodeBlock = true
        codeLang = line.slice(3).trim()
        codeContent = []
        continue
      }

      if (line === '```' && inCodeBlock) {
        inCodeBlock = false
        html.push(
          <pre key={i} className="code-block">
            <code className={codeLang ? `language-${codeLang}` : ''}>
              {codeContent.join('\n')}
            </code>
          </pre>
        )
        continue
      }

      if (inCodeBlock) {
        codeContent.push(line)
        continue
      }

      if (line.startsWith('# ')) {
        html.push(<h1 key={i} className="md-h1">{line.slice(2)}</h1>)
      } else if (line.startsWith('## ')) {
        html.push(<h2 key={i} className="md-h2">{line.slice(3)}</h2>)
      } else if (line.startsWith('### ')) {
        html.push(<h3 key={i} className="md-h3">{line.slice(4)}</h3>)
      } else if (line.startsWith('> ')) {
        html.push(<blockquote key={i} className="md-blockquote">{line.slice(2)}</blockquote>)
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        html.push(<li key={i} className="md-li">{renderInline(line.slice(2))}</li>)
      } else if (line.match(/^\d+\. /)) {
        html.push(<li key={i} className="md-li numbered">{renderInline(line.replace(/^\d+\. /, ''))}</li>)
      } else if (line.match(/^!\[.*\]\(.*\)/)) {
        const match = line.match(/!\[(.*)\]\((.*)\)/)
        html.push(<img key={i} className="md-image" alt={match[1]} src={match[2]} />)
      } else if (line.match(/\[.*\]\(.*\)/)) {
        html.push(<p key={i} className="md-p">{renderInline(line)}</p>)
      } else if (line.trim() === '') {
        html.push(<br key={i} />)
      } else {
        html.push(<p key={i} className="md-p">{renderInline(line)}</p>)
      }
    }

    return html
  }

  const renderInline = (text) => {
    const parts = []
    let remaining = text
    let key = 0

    while (remaining) {
      const codeMatch = remaining.match(/`([^`]+)`/)
      if (codeMatch && codeMatch.index === 0) {
        parts.push(<code key={key++} className="md-inline-code">{codeMatch[1]}</code>)
        remaining = remaining.slice(codeMatch[0].length)
        continue
      }

      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
      if (boldMatch && boldMatch.index === 0) {
        parts.push(<strong key={key++}>{boldMatch[1]}</strong>)
        remaining = remaining.slice(boldMatch[0].length)
        continue
      }

      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch && linkMatch.index === 0) {
        parts.push(<a key={key++} href={linkMatch[2]}>{linkMatch[1]}</a>)
        remaining = remaining.slice(linkMatch[0].length)
        continue
      }

      const idx = remaining.search(/[`*]/)
      if (idx === -1) {
        parts.push(remaining)
        break
      } else if (idx === 0) {
        remaining = remaining.slice(1)
      } else {
        parts.push(remaining.slice(0, idx))
        remaining = remaining.slice(idx)
      }
    }

    return parts
  }

  return (
    <div className="article-page">
      <header className="article-header">
        <nav className="article-breadcrumb">
          <Link to="/" className="breadcrumb-link">首页</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/category/${article.category}`} className="breadcrumb-link">
            <span style={{ color: category?.color }}>{category?.icon}</span>
            <span>{category?.name}</span>
          </Link>
        </nav>

        <div className="article-meta-row">
          <span className="article-category-badge" style={{ '--cat-color': category?.color }}>
            {category?.icon} {category?.name}
          </span>
          <span className="article-version">{article.version}</span>
          <span className="article-date">{article.date}</span>
        </div>

        <h1 className="article-title">{article.title}</h1>
        <p className="article-description">{article.description}</p>
      </header>

      <div className="article-content">
        {loading ? (
          <div className="article-loading">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : (
          <div className="markdown-body">
            {renderContent(content)}
          </div>
        )}
      </div>
    </div>
  )
}

export default Article
