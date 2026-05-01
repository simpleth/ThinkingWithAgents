import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Category from './pages/Category'
import Article from './pages/Article'
import Search from './pages/Search'
import './App.css'
import { CONFIG } from './config'
import { debugApp, DEBUG_LEVELS, setDebugLevel } from './utils/debug'

export const useKnowledgeBase = () => {
  const [data, setData] = useState({ categories: [], articles: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    debugApp.debug('useKnowledgeBase: Starting data fetch')
    const fetchData = async () => {
      try {
        debugApp.debug('Fetching knowledge base data...')
        const response = await fetch(`${import.meta.env.BASE_URL}data/index.json`)
        const jsonData = await response.json()
        setData(jsonData)
        debugApp.log('Knowledge base data loaded:', {
          categories: jsonData.categories?.length || 0,
          articles: jsonData.articles?.length || 0
        })
      } catch (error) {
        debugApp.error('Failed to load knowledge base data:', error)
      } finally {
        setLoading(false)
        debugApp.debug('useKnowledgeBase: Loading complete')
      }
    }
    fetchData()
  }, [])

  return { ...data, loading }
}

function App() {
  debugApp.log('App component initializing')
  const { categories, articles, loading } = useKnowledgeBase()
  
  // 初始就设置正确的侧边栏状态，避免初始渲染跳变
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const shouldOpen = window.innerWidth > CONFIG.HEADER.MOBILE_BREAKPOINT
      debugApp.debug('Initial sidebar state:', { shouldOpen, width: window.innerWidth })
      return shouldOpen
    }
    return false
  })
  
  useEffect(() => {
    debugApp.debug('Sidebar state changed:', { isSidebarOpen })
  }, [isSidebarOpen])
  
  useEffect(() => {
    const checkSize = () => {
      const shouldOpen = window.innerWidth > CONFIG.HEADER.MOBILE_BREAKPOINT
      if (shouldOpen !== isSidebarOpen) {
        debugApp.debug('Window resize triggered sidebar change:', {
          newWidth: window.innerWidth,
          shouldOpen
        })
        setIsSidebarOpen(shouldOpen)
      }
    }
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [isSidebarOpen])

  const toggleSidebar = () => {
    debugApp.log('Toggle sidebar clicked')
    setIsSidebarOpen(!isSidebarOpen)
  }

  if (loading) {
    debugApp.debug('App: Showing loading state')
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>加载知识库...</p>
      </div>
    )
  }

  debugApp.log('App: Rendering main content')
  return (
    <HashRouter>
      <div className="app" style={{
        '--sidebar-offset': isSidebarOpen ? 'var(--sidebar-width)' : '0px'
      }}>
        <Header 
          categories={categories} 
          articles={articles}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
        <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <Routes>
            <Route 
              path="/" 
              element={
                <main className="main-content home-centered">
                  <Home categories={categories} articles={articles} />
                </main>
              } 
            />
            <Route 
              path="/category/:categoryId" 
              element={
                <main className="main-content home-centered">
                  <Category categories={categories} articles={articles} />
                </main>
              } 
            />
            <Route 
              path="/article/:articleId" 
              element={
                <main className="main-content home-centered">
                  <Article articles={articles} categories={categories} isSidebarOpen={isSidebarOpen} />
                </main>
              } 
            />
            <Route 
              path="/search" 
              element={
                <main className="main-content home-centered">
                  <Search articles={articles} categories={categories} />
                </main>
              } 
            />
          </Routes>
        </div>
        <footer className="footer">
          <p>技术研究档案库 · 知识共享</p>
        </footer>
      </div>
    </HashRouter>
  )
}

export default App
