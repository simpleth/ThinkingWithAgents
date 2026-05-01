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

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setHeadings([])
    setCurrentHeadingIndex(-1)

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

  useEffect(() => {
    if (content) {
      const lines = content.split('\n')
      const headingList = []
      let inCodeBlock = false
      let inHtmlComment = false
      
      lines.forEach(line => {
        const stripped = line.trim()
        
        // 处理 HTML 注释
        if (stripped.includes('<!--')) {
          inHtmlComment = true
          if (stripped.includes('-->')) {
            inHtmlComment = false
          }
          return
        }
        if (inHtmlComment) {
          if (stripped.includes('-->')) {
            inHtmlComment = false
          }
          return
        }
        
        // 检查代码块边界
        if (stripped.startsWith('```')) {
          inCodeBlock = !inCodeBlock
          return
        }
        
        // 代码块中的内容跳过
        if (inCodeBlock) return
        
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

  useEffect(() => {
    if (headings.length === 0) return

    let scrollTimeout = null

    const updateHighlight = () => {
      const headerHeight = 70
      const scrollPosition = window.scrollY + headerHeight + 50
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

    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      scrollTimeout = setTimeout(updateHighlight, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateHighlight()

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [headings])

  const handleHeadingClick = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const headerHeight = 70
      const elementPosition = element.offsetTop - headerHeight - 20
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
    setIsMobileTocOpen(false)
  }

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
      {headings.length > 0 && (
        <button
          className="mobile-toc-btn"
          onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
        >
          📑
        </button>
      )}

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

        <aside className="article-toc">
          <div className="toc-fixed-header">
            <nav className="article-breadcrumb">
              <Link to="/" className="breadcrumb-link">首页</Link>
              <span className="breadcrumb-separator">/</span>
              <Link to={`/category/${article.category}`} className="breadcrumb-link">
                <span style={{ color: category?.color }}>{category?.icon}</span>
                <span>{category?.name}</span>
              </Link>
            </nav>

            {headings.length > 0 && (
              <div className="toc-title">目录</div>
            )}
          </div>

          {headings.length > 0 && (
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
          )}
        </aside>
      </div>
    </div>
  )
}

export default Article
