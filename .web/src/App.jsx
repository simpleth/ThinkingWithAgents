import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Category from './pages/Category'
import Article from './pages/Article'
import Search from './pages/Search'
import './App.css'
import { CONFIG } from './config'

function getInitialTheme() {
  try {
    return localStorage.getItem('theme') || 'auto'
  } catch {
    return 'auto'
  }
}

export const useKnowledgeBase = () => {
  const [data, setData] = useState({ categories: [], articles: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/index.json`)
        const jsonData = await response.json()
        setData(jsonData)
      } catch (error) {
        console.error('Failed to load knowledge base data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { ...data, loading }
}

function App() {
  const { categories, articles, loading } = useKnowledgeBase()
  const [theme, setTheme] = useState(getInitialTheme)

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > CONFIG.HEADER.MOBILE_BREAKPOINT
    }
    return false
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('theme', theme) } catch {}
  }, [theme])

  useEffect(() => {
    const checkSize = () => {
      const shouldOpen = window.innerWidth > CONFIG.HEADER.MOBILE_BREAKPOINT
      if (shouldOpen !== isSidebarOpen) setIsSidebarOpen(shouldOpen)
    }
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [isSidebarOpen])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>加载知识库...</p>
      </div>
    )
  }

  return (
    <HashRouter>
      <div className="app">
        <Header
          categories={categories}
          articles={articles}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          theme={theme}
          onThemeChange={setTheme}
        />
        <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <Routes>
            <Route
              path="/"
              element={
                <main className="main-content">
                  <Home categories={categories} articles={articles} />
                </main>
              }
            />
            <Route
              path="/category/:categoryId"
              element={
                <main className="main-content">
                  <Category categories={categories} articles={articles} />
                </main>
              }
            />
            <Route
              path="/article/:articleId"
              element={
                <main className="main-content">
                  <Article articles={articles} categories={categories} isSidebarOpen={isSidebarOpen} />
                </main>
              }
            />
            <Route
              path="/search"
              element={
                <main className="main-content">
                  <Search articles={articles} categories={categories} />
                </main>
              }
            />
          </Routes>
        </div>
        <footer className="footer">
          <span>技术研究档案库</span>
          <span className="footer-separator">·</span>
          <a href="https://github.com/simpleth/ThinkingWithAgents" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </footer>
      </div>
    </HashRouter>
  )
}

export default App
