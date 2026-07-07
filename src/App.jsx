import { useState } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import About from './pages/About'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Page registry — add new pages here
const PAGES = {
  dashboard: Dashboard,
  history: History,
  about: About,
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const PageComponent = PAGES[activePage] || Dashboard

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Ambient background glow — decorative, non-interactive */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-orange-500/4 rounded-full blur-3xl" />
      </div>

      {/* App Header with tab navigation */}
      <Header activePage={activePage} onNavigate={setActivePage} />

      {/* Main content — ErrorBoundary resets on page change via key prop */}
      <main className="flex-1 relative z-10">
        <ErrorBoundary key={activePage}>
          <PageComponent />
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  )
}
