import React, { Suspense } from 'react';

const AdminRooms = React.lazy(() => import('../../components/library/admin/AdminRooms'));
const AdminChairBookings = React.lazy(() => import('../../components/library/admin/AdminChairBookings'));
const AdminBooks = React.lazy(() => import('../../components/library/admin/AdminBooks'));
const AdminConfirmations = React.lazy(() => import('../../components/library/admin/AdminConfirmations'));

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
  { id: 'rooms',         label: '🏠 Private Rooms'   },
  { id: 'chairs',        label: '💺 Chair Bookings'  },
  { id: 'books',         label: '📚 Book Management' },
  { id: 'confirmations', label: '✅ Confirmations'   },
];

class LibraryAdminDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tab: 'confirmations' };
  }

  setTab = (tab) => {
    this.setState({ tab });
  };

  goTo = (path) => {
    window.location.assign(path);
  };

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      localStorage.removeItem('user');
      return {};
    }
  }

  handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.goTo('/login');
  };

  render() {
    const { tab } = this.state;
    const user = this.getUser();

    return (
    <div className="min-h-screen bg-slate-50 text-slate-700" style={{ fontFamily: '"Segoe UI", "Aptos", sans-serif' }}>
      {/* Top Nav */}
      <nav className="bg-slate-900 sticky top-0 z-50 shadow-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="font-black text-lg tracking-tight flex items-center gap-2">
            <img src="/sliit-official-logo.png" alt="SLIIT Logo" className="h-10 w-auto object-contain" />
            <div>
              <span className="text-white">SLIIT Library</span>
              <p className="text-xs font-normal text-slate-400">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs bg-accent/15 text-accent font-semibold px-2 py-1 rounded-full border border-accent/30">
                Library Admin
              </span>
              <span className="text-sm text-slate-400">{user.name}</span>
            </div>
            <button onClick={this.handleLogout}
              className="px-3 py-2 text-sm font-semibold text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-xl transition-all">
              Logout
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => this.setTab(t.id)}
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
            {tab === 'rooms'         && <AdminRooms />}
            {tab === 'chairs'        && <AdminChairBookings />}
            {tab === 'books'         && <AdminBooks />}
            {tab === 'confirmations' && <AdminConfirmations />}
          </Suspense>
        </LibraryTabErrorBoundary>
      </main>
    </div>
    );
  }
}

export default LibraryAdminDashboard;