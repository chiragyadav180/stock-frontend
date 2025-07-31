import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setIsAuthenticated(!!token)
      setLoading(false)
    }

    checkAuth()
    
    // Listen for storage changes (when token is added/removed)
    window.addEventListener('storage', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
    return children
  }

  // Check if current route is login or register
  const shouldShowNavbar = !['/login', '/register'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Notification Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {shouldShowNavbar && <Navbar />}

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
          />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/about" 
            element={
              <ProtectedRoute>
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                  <h1 className="text-3xl font-bold text-gray-800 mb-6">About Our Platform</h1>
                  <p className="text-gray-600 mb-4">
                    Welcome to our investment dashboard, designed to help you track and manage your 
                    stock portfolio with ease. Our platform provides real-time data visualization, 
                    performance analytics, and seamless trading capabilities.
                  </p>
                  <p className="text-gray-600">
                    Built with modern web technologies, we prioritize security, performance, and 
                    user experience to give you the best investment management tools.
                  </p>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/home"} replace />} 
          />
          <Route 
            path="*" 
            element={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-6">Page Not Found</p>
                  <a 
                    href="/" 
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Return Home
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
      </main>

      {shouldShowNavbar && (
        <footer className="bg-white border-t border-gray-200 py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-gray-500">
            <p>© {new Date().getFullYear()} Investment Dashboard. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  )
}

export default App