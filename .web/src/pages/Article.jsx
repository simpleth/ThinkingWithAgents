import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './Article.css'
import { debugArticle } from '../utils/debug'
import { CONFIG } from '../config'

const STATUS_LABELS = { published: '已发布', draft: '草稿', archived: '已归档' }
const STATUS_CLASSES = { published: 's-published', draft: 's-draft', archived: 's-archived' }

function Article({ articles, categories, isSidebarOpen = false }) {
  const { articleId } = useParams()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [headings, setHeadings] = useState([])
 const [currentHeadingIndex, setCurrentHeadingIndex] = useState(-1)
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const tocAnchorRef = useRef(null)
  const tocRef = useRef(null)
  const prevSidebarRef = useRef(isSidebarOpen)

  const article = articles.find(a => a.id === articleId)
  const category = article ? categories.find(c => c.id === article.category) : null

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setHeadings([])
    setCurrentHeadingIndex(-1)

    if (article) {
      fetch(article.path)
        .then(res => res.text())
        .then(text => {
          const lines = text.split(/\r?\n/)
          let cleaned = text
          if (lines[0].trim() === '---') {
            const endIdx = lines.findIndex((l, i) => i > 0 && l.trim() === '---')
            if (endIdx > 0) cleaned = lines.slice(endIdx + 1).join('\n').trimStart()
          }
          setContent(cleaned)
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

        if (stripped.includes('<!--')) {
          inHtmlComment = true
          if (stripped.includes('-->')) inHtmlComment = false
          return
        }
        if (inHtmlComment) {
          if (stripped.includes('-->')) inHtmlComment = false
          return
        }
        if (stripped.startsWith('```')) {
          inCodeBlock = !inCodeBlock
          return
        }
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

      if (newIndex !== currentHeadingIndex) setCurrentHeadingIndex(newIndex)
    }

    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(updateHighlight, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateHighlight()

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [headings])

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const syncTocPosition = () => {
    if (!tocAnchorRef.current || !tocRef.current) return
    const rect = tocAnchorRef.current.getBoundingClientRect()
    tocRef.current.style.left = `${rect.left}px`
    tocRef.current.style.width = `${rect.width}px`
  }

  useLayoutEffect(() => {
    syncTocPosition()

    let rafId
    if (prevSidebarRef.current !== isSidebarOpen) {
      let frameCount = 0
      const syncLoop = () => {
        syncTocPosition()
        if (++frameCount < 30) rafId = requestAnimationFrame(syncLoop)
      }
      rafId = requestAnimationFrame(syncLoop)
    }
    prevSidebarRef.current = isSidebarOpen

    window.addEventListener('resize', syncTocPosition)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', syncTocPosition)
    }
  }, [isSidebarOpen, headings])

  const scrollToHeading = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const headerHeight = 70
      window.scrollTo({ top: element.offsetTop - headerHeight - 20, behavior: 'smooth' })
    }
    setIsMobileTocOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <div className={`article-page ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="article-layout">
        <article className="article-content">
          <nav className="article-breadcrumb">
            <Link to="/" className="breadcrumb-link">首页</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to={`/category/${article.category}`} className="breadcrumb-link">
              <span style={{ color: category?.color }}>{category?.icon}</span>
              <span>{category?.name}</span>
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{article.title}</span>
          </nav>

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

          {article && (
            <div className="article-footer">
              {article.status && (
                <div className="article-status-row">
                  <span className={`status-badge ${STATUS_CLASSES[article.status] || ''}`}>
                    {STATUS_LABELS[article.status] || article.status}
                  </span>
                </div>
              )}

              {article.date && (() => {
                const [y, m] = article.date.split('-').map(Number)
                if (!y || !m) return null
                const months = (new Date().getFullYear() - y) * 12 + (new Date().getMonth() + 1 - m)
                if (months >= CONFIG.FRESHNESS.ARCHIVE_MONTHS) {
                  return <div className="article-expiry-row"><span className="expiry-label">已归档（{months}个月前更新）</span></div>
                }
                if (months >= CONFIG.FRESHNESS.STALE_MONTHS) {
                  return <div className="article-expiry-row"><span className="expiry-label">可能过时（{months}个月前更新）</span></div>
                }
                return null
              })()}

              {Array.isArray(article.tags) && article.tags.length > 0 && (
                <div className="article-tags-section">
                  <h3 className="article-section-title">标签</h3>
                  <div className="article-tags-list">
                    {article.tags.map(tag => (
                      <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`} className="tag-pill-link">
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(article.related) && article.related.length > 0 && (() => {
                const relatedArticles = article.related
                  .map(filename => articles.find(a =>
                    a.id.endsWith(filename) || (a.path && a.path.includes(filename))
                  ))
                  .filter(Boolean)
                if (relatedArticles.length === 0) return null
                return (
                  <div className="article-related-section">
                    <h3 className="article-section-title">相关研究</h3>
                    <div className="article-related-list">
                      {relatedArticles.map(ra => {
                        const rcat = categories.find(c => c.id === ra.category)
                        return (
                          <Link key={ra.id} to={`/article/${ra.id}`} className="related-item">
                            <span className="related-icon" style={{ color: rcat?.color }}>{rcat?.icon}</span>
                            <div className="related-info">
                              <span className="related-title">{ra.title}</span>
                              <span className="related-meta">{rcat?.name} · {ra.date}</span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </article>

        <div className="article-toc-anchor" ref={tocAnchorRef}>
          {headings.length > 0 && (
            <aside className="article-toc" ref={tocRef}>
              <div className="toc-header">
                <div className="toc-title">目录</div>
              </div>
              <nav className="toc-nav">
                {headings.map((heading, index) => (
                  <button
                    key={heading.id}
                    className={`toc-item toc-level-${heading.level} ${currentHeadingIndex === index ? 'toc-active' : ''}`}
                    onClick={() => scrollToHeading(heading.id)}
                  >
                    {heading.text}
                  </button>
                ))}
              </nav>
            </aside>
          )}
        </div>
      </div>

      <button
        className={`mobile-toc-btn ${headings.length > 0 ? 'show' : ''} ${isMobileTocOpen ? 'active' : ''}`}
        onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
        aria-label="目录"
      >
        ☰
      </button>

      {isMobileTocOpen && (
        <div className="mobile-toc-overlay" onClick={() => setIsMobileTocOpen(false)}>
          <div className="mobile-toc-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-toc-header">
              <h3>目录</h3>
              <button className="mobile-toc-close" onClick={() => setIsMobileTocOpen(false)}>✕</button>
            </div>
            <nav className="toc-nav">
              {headings.map((heading, index) => (
                <button
                  key={heading.id}
                  className={`toc-item toc-level-${heading.level} ${currentHeadingIndex === index ? 'toc-active' : ''}`}
                  onClick={() => scrollToHeading(heading.id)}
                >
                  {heading.text}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {showBackToTop && (
        <button className="back-to-top" onClick={scrollToTop} aria-label="回到顶部">
          ↑
        </button>
      )}
    </div>
  )
}

export default Article
