import Header from './Header'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

/**
 * Layout — Main app shell wrapper
 * Desktop: Sidebar + Content area
 * Mobile: Header + Content + BottomNav
 */
export default function Layout({ children }) {
  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="main-content">
        <Header />
        <main className="page-container page-enter">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
