import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Category from './pages/Category'
import Article from './pages/Article'
import Search from './pages/Search'
import './App.css'
import { CONFIG } from './config'

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  useEffect(() => {
    const checkSize = () => {
      setIsSidebarOpen(window.innerWidth > CONFIG.HEADER.MOBILE_BREAKPOINT)
    }
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

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
        <div className="app-layout">
          <Header 
            categories={categories} 
            articles={articles}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <main className={`main-content ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
            <Routes>
              <Route path="/" element={<Home categories={categories} articles={articles} />} />
              <Route path="/category/:categoryId" element={<Category categories={categories} articles={articles} />} />
              <Route path="/article/:articleId" element={<Article articles={articles} categories={categories} />} />
              <Route path="/search" element={<Search articles={articles} categories={categories} />} />
            </Routes>
          </main>
        </div>
        <footer className="footer">
          <p>技术研究档案库 · 知识共享</p>
        </footer>
      </div>
    </HashRouter>
  )
}

export default App
