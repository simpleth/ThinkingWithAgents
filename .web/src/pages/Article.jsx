import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './Article.css'
import { CONFIG } from '../config'

function Article({ articles, categories }) {
  const { articleId } = useParams()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [headings, setHeadings] = useState([])
  const [currentHeadingIndex, setCurrentHeadingIndex] = useState(-1)
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false)

  const article = articles.find(a => a.id === articleId)
  const category = article ? categories.find(c => c.id === article.category) : null
  const relatedArticles = article ? articles.filter(a => a.category === article.category && a.id !== articleId).slice(0, CONFIG.ARTICLE.RELATED_ARTICLES_COUNT) : []

  // 解析 Markdown 标题
  useEffect(() => {
    if (content) {
      const lines = content.split('\n')
      const headingList = []
      lines.forEach(line => {
        const match = line.match(/^(#{1,4})\s+(.+)$/)
        if (match) {
          headingList.push({
            level: match[1].length,
            text: match[2],
            id: `heading-${headingList.length}`
          })
        }
      })
      setHeadings(headingList)
    }
  }, [content])

  // 滚动监听，高亮当前标题
  useEffect(() => {
    const handleScroll = () => {
      if (headings.length === 0) return
      
      const scrollPosition = window.scrollY + 100
      let newIndex = -1

      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id)
        if (element && element.offsetTop <= scrollPosition) {
          newIndex = i
          break
        }
      }

      setCurrentHeadingIndex(newIndex)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings])

  // 滚动到指定标题
  const handleHeadingClick = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsMobileTocOpen(false)
  }

  // 自定义渲染组件，给标题添加 id
  const renderers = {
    h1: ({ children, ...props }) => {
      const index = headings.findIndex(h => h.text === children && h.level === 1)
      const id = index >= 0 ? headings[index].id : null
      return <h1 id={id} className="md-h1" {...props}>{children}</h1>
    },
    h2: ({ children, ...props }) => {
      const index = headings.findIndex(h => h.text === children && h.level === 2)
      const id = index >= 0 ? headings[index].id : null
      return <h2 id={id} className="md-h2" {...props}>{children}</h2>
    },
    h3: ({ children, ...props }) => {
      const index = headings.findIndex(h => h.text === children && h.level === 3)
      const id = index >= 0 ? headings[index].id : null
      return <h3 id={id} className="md-h3" {...props}>{children}</h3>
    },
    h4: ({ children, ...props }) => {
      const index = headings.findIndex(h => h.text === children && h.level === 4)
      const id = index >= 0 ? headings[index].id : null
      return <h4 id={id} className="md-h4" {...props}>{children}</h4>
    }
  }

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
      </header>

      {/* 移动端目录按钮 */}
      {headings.length > 0 && (
        <button
          className="mobile-toc-btn"
          onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
        >
          📑
        </button>
      )}

      {/* 移动端目录面板 */}
      {isMobileTocOpen && (
        <div className="mobile-toc-overlay" onClick={() => setIsMobileTocOpen(false)}>
          <div className="mobile-toc-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-toc-header">
              <h3>目录</h3>
              <button
                className="mobile-toc-close"
                onClick={() => setIsMobileTocOpen(false)}
              >
                ✕
              </button>
            </div>
            <nav className="toc-nav">
              {headings.map((heading, index) => (
                <button
                  key={heading.id}
                  className={`toc-item toc-level-${heading.level} ${currentHeadingIndex === index ? 'toc-active' : ''}`}
                  onClick={() => handleHeadingClick(heading.id)}
                >
                  {heading.text}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="article-layout">
        <div className="article-content">
          {loading ? (
            <div className="article-loading">
              <div className="loading-spinner"></div>
              <p>加载中...</p>
            </div>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers}>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        {headings.length > 0 && (
          <aside className="article-toc">
            <div className="toc-title">目录</div>
            <nav className="toc-nav">
              {headings.map((heading, index) => (
                <button
                  key={heading.id}
                  className={`toc-item toc-level-${heading.level} ${currentHeadingIndex === index ? 'toc-active' : ''}`}
                  onClick={() => handleHeadingClick(heading.id)}
                >
                  {heading.text}
                </button>
              ))}
            </nav>
          </aside>
        )}
      </div>
    </div>
  )
}

export default Article