import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Goals', href: '/goals', icon: '🎯' },
    { name: 'Portfolio', href: '/portfolio', icon: '💼' },
    { name: 'Simulations', href: '/simulations', icon: '🔮' },
    { name: 'Recommendations', href: '/recommendations', icon: '💡' },
    { name: 'Reports', href: '/reports', icon: '📄' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-effect shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  💰 Wealth Tracker
                </h1>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                  >
                    <span className="mr-2 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-primary-50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-sm font-medium text-gray-600 hover:text-primary-600 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

