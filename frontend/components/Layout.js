import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Edit3, 
  Home, 
  FileText, 
  Clock, 
  Settings,
  Database
} from 'lucide-react'

const Layout = ({ children, title = 'Kennedy Ogetto Legal Career' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut, isAuthenticated } = useAuth()
  const router = useRouter()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Blog', href: '/blog', icon: FileText },
    { name: 'Timeline', href: '/timeline', icon: Clock },
  ]

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: Settings },
    { name: 'Manage Blog', href: '/admin/blog', icon: FileText },
    { name: 'Manage Timeline', href: '/admin/timeline', icon: Clock },
    { name: 'Profile Settings', href: '/admin/profile', icon: User },
    { name: 'Scraping Log', href: '/admin/scraping', icon: Database },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Comprehensive documentation of Kennedy Ogetto's distinguished legal career" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo and main navigation */}
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-xl font-bold text-gray-900">
                    Kennedy Ogetto
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                          router.pathname === item.href
                            ? 'border-primary-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Right side navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                {isAuthenticated ? (
                  <>
                    {/* Admin navigation */}
                    <div className="relative group">
                      <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <Settings className="w-4 h-4 mr-1" />
                        Admin
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        {adminNavigation.map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              {item.name}
                            </Link>
                          )
                        })}
                      </div>
                    </div>

                    {/* User menu */}
                    <div className="relative group">
                      <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <User className="w-4 h-4 mr-1" />
                        {user?.username}
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Login to Edit
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="sm:hidden flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                >
                  {mobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        router.pathname === item.href
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
              
              {isAuthenticated && (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="space-y-1">
                    {adminNavigation.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {item.name}
                        </Link>
                      )
                    })}
                    <button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center w-full pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
              
              {!isAuthenticated && (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <Link
                    href="/login"
                    className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-primary-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Edit3 className="w-5 h-5 mr-3" />
                    Login to Edit
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-gray-500">
              <p>© 2025 Kennedy Ogetto Legal Career Documentation. All rights reserved.</p>
              <p className="mt-1">
                Comprehensive documentation of a distinguished legal career spanning international and municipal law.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default Layout