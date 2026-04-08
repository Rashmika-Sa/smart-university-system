import React, { Suspense } from 'react';

const StudentRooms = React.lazy(() => import('../../components/library/student/StudentRooms'));
const StudentChairBooking = React.lazy(() => import('../../components/library/student/StudentChairBooking'));
const StudentBooks = React.lazy(() => import('../../components/library/student/StudentBooks'));
const StudentMyBookings = React.lazy(() => import('../../components/library/student/StudentMyBookings'));

class LibraryTabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          This section failed to load. Please switch tab or refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

const TABS = [
  { id: 'rooms',      label: '🏠 Private Rooms' },
  { id: 'chairs',     label: '💺 Chair Booking' },
  { id: 'books',      label: '📚 Browse Books'  },
  { id: 'mybookings', label: '📋 My Bookings', authRequired: true },
];

class LibraryStudentDashboard extends React.Component {
  constructor(props) {
    super(props);
    const token = localStorage.getItem('token');
    this.state = { tab: token ? 'rooms' : 'books' };
  }

  setTab = (tab) => {
    this.setState({ tab });
  };

  goTo = (path) => {
    window.location.assign(path);
  };

  handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.goTo('/login');
  };

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      localStorage.removeItem('user');
      return {};
    }
  }

  render() {
    const token = localStorage.getItem('token');
    const isLoggedIn = Boolean(token);
    const user = this.getUser();
    const { tab } = this.state;

    return (
    <div className="min-h-screen bg-slate-50 text-slate-700" style={{ fontFamily: '"Segoe UI", "Aptos", sans-serif' }}>
      {/* Top Nav */}
      <nav className="bg-slate-900 sticky top-0 z-50 shadow-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="font-black text-lg tracking-tight flex items-center gap-2">
            <img src="/sliit-official-logo.png" alt="SLIIT Logo" className="h-10 w-auto object-contain" />
            <div>
              <span className="text-white">SLIIT Library</span>
              <p className="text-xs font-normal text-slate-400">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden md:block">
              Welcome, <span className="font-semibold text-white">{user.name || 'Guest'}</span>
            </span>
            <button onClick={() => this.goTo('/student-dashboard')}
              className="px-3 py-2 text-sm font-semibold text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-xl transition-all">
              ← Back to Portal
            </button>
            <button onClick={this.handleLogout}
              className="px-3 py-2 text-sm font-semibold text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-xl transition-all">
              Logout
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => this.setTab(t.id)}
              disabled={t.authRequired && !isLoggedIn}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                tab === t.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-slate-400 hover:text-cyan-400'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {!isLoggedIn && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
            You are viewing as guest. Please log in to make bookings and view "My Bookings".
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <LibraryTabErrorBoundary key={tab}>
          <Suspense
            fallback={
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent" />
              </div>
            }
          >
            {tab === 'rooms'      && <StudentRooms />}
            {tab === 'chairs'     && <StudentChairBooking />}
            {tab === 'books'      && <StudentBooks />}
            {tab === 'mybookings' && <StudentMyBookings />}
          </Suspense>
        </LibraryTabErrorBoundary>
      </main>
    </div>
    );
  }
}

export default LibraryStudentDashboard;