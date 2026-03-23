import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import StudentTopNav from '../../components/StudentTopNav';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isTimetableEditorOpen, setIsTimetableEditorOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});

  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
  const DAY_FULL = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };

  const getTodayKey = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const emptyTimetable = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] };

  const [timetable, setTimetable] = useState(() => {
    try {
      const stored = localStorage.getItem('studentTimetable');
      return stored ? JSON.parse(stored) : emptyTimetable;
    } catch { return emptyTimetable; }
  });
  const [selectedDay, setSelectedDay] = useState(getTodayKey());
  const [editingDay, setEditingDay] = useState(getTodayKey());
  const [newClass, setNewClass] = useState({ startTime: '', endTime: '', subject: '', instructor: '', location: '' });
  const [classError, setClassError] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    universityId: '',
    profilePhoto: ''
  });

  useEffect(() => {
    localStorage.setItem('studentTimetable', JSON.stringify(timetable));
  }, [timetable]);

  const getNextClassIndex = (dayClasses) => {
    if (!dayClasses || dayClasses.length === 0) return -1;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const sorted = [...dayClasses].sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
    for (let i = 0; i < sorted.length; i++) {
      if (parseTimeToMinutes(sorted[i].startTime) > currentMinutes) return i;
    }
    return -1;
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(' ');
    if (parts.length < 2) return 0;
    const [hStr, mStr] = parts[0].split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10) || 0;
    const meridiem = parts[1].toUpperCase();
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const handleAddClass = () => {
    setClassError('');
    if (!newClass.startTime || !newClass.subject) {
      setClassError('Start time and subject are required.');
      return;
    }
    if (!newClass.endTime) {
      setClassError('End time is required.');
      return;
    }
    setTimetable((prev) => ({
      ...prev,
      [editingDay]: [...(prev[editingDay] || []), { ...newClass, id: Date.now() }]
        .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime))
    }));
    setNewClass({ startTime: '', endTime: '', subject: '', instructor: '', location: '' });
  };

  const handleDeleteClass = (day, classId) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: prev[day].filter((c) => c.id !== classId)
    }));
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            setVisibleSections((prev) => ({ ...prev, [sectionId]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const fetchMyProfile = async () => {
    try {
      setLoadingProfile(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/users/me');
      const user = response.data;

      setUserProfile(user);
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        universityId: user.universityId || '',
        profilePhoto: user.profilePhoto || ''
      });

      localStorage.setItem('user', JSON.stringify({
        id: user._id || user.id,
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        universityId: user.universityId || '',
        managedCanteen: user.managedCanteen || null,
        profilePhoto: user.profilePhoto || ''
      }));

      const currentUserId = user._id || user.id;
      setTimeout(() => {
        fetchActivity(currentUserId);
        fetchNotices();
      }, 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchNotices = async () => {
    try {
      setLoadingNotices(true);
      const response = await axios.get('/notices', { params: { audience: 'students', limit: 4 } });
      setNotices(response.data || []);
    } catch (err) {
      setNotices([]);
    } finally {
      setLoadingNotices(false);
    }
  };

  const fetchActivity = async (userId) => {
    try {
      setLoadingActivity(true);
      const response = await axios.get(`/orders/my-orders/${userId}`);
      const recentOrders = (response.data || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4)
        .map((order) => ({
          id: `order-${order._id}`,
          icon: '🧾',
          title: `Order ${order.status}`,
          description: `${order.canteen} • LKR ${order.totalAmount}`,
          time: new Date(order.createdAt).toLocaleString()
        }));

      const quickNotifications = [
        {
          id: 'notif-1',
          icon: '📢',
          title: 'New Notice Published',
          description: 'Exam week library schedule has been updated.',
          time: 'Today'
        },
        {
          id: 'booking-1',
          icon: '📚',
          title: 'Academic Space Reminder',
          description: 'Remember to confirm your room booking before 6 PM.',
          time: 'Today'
        }
      ];

      setActivityFeed([...recentOrders, ...quickNotifications]);
    } catch (err) {
      setActivityFeed([
        {
          id: 'fallback-1',
          icon: '📢',
          title: 'No recent activity yet',
          description: 'Your bookings, orders, and notifications will appear here.',
          time: 'Now'
        }
      ]);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((prev) => ({ ...prev, profilePhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfileForm((prev) => ({ ...prev, profilePhoto: '' }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setError('');
      setMessage('');

      const response = await axios.put('/users/me', profileForm);
      const updatedUser = response.data.user;

      setUserProfile((prev) => ({ ...prev, ...updatedUser, _id: prev?._id || updatedUser.id }));
      setMessage('Profile updated successfully.');

      localStorage.setItem('user', JSON.stringify({
        id: updatedUser.id,
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        universityId: updatedUser.universityId || '',
        managedCanteen: updatedUser.managedCanteen || null,
        profilePhoto: updatedUser.profilePhoto || ''
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirmed) return;

    try {
      await axios.delete('/users/me');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/register');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const serviceModules = [
    {
      id: 'shuttle',
      icon: '🚌',
      title: 'Shuttle Service',
      subtitle: 'Live Routes',
      description: 'Check campus transport schedules, route updates, and upcoming departures.',
      route: '/shuttle-dashboard',
      cta: 'Open Shuttle'
    },
    {
      id: 'canteen',
      icon: '🍽️',
      title: 'Canteen Preordering',
      subtitle: 'Fast Pickup',
      description: 'Preorder meals, skip queues, and track your latest food orders in real time.',
      route: '/canteen-selection',
      cta: 'Preorder Now'
    },
    {
      id: 'facilities',
      icon: '🏟️',
      title: 'Facilities Booking',
      subtitle: 'Reserve Spaces',
      description: 'Book university facilities and manage your reservations from one place.',
      route: '/facility-dashboard',
      cta: 'Book Facility'
    },
    {
      id: 'academic',
      icon: '🏛️',
      title: 'Academic Spaces',
      subtitle: 'Study Zones',
      description: 'Find and reserve study rooms or collaborative academic spaces on campus.',
      route: '/academic-space-dashboard',
      cta: 'Book Space'
    }
  ];

  const displayName = userProfile?.name || 'Student';
  const displayPhoto = profileForm.profilePhoto ?? userProfile?.profilePhoto ?? '';
  const todayKey = getTodayKey();
  const todayClasses = (timetable[todayKey] || []).sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
  const nextClassToday = (() => {
    const idx = getNextClassIndex(todayClasses);
    return idx >= 0 ? todayClasses[idx] : null;
  })();
  const totalClassesThisWeek = DAYS.reduce((sum, day) => sum + (timetable[day]?.length || 0), 0);
  const recentActivityCount = activityFeed?.length || 0;
  const currentDateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const systemSignals = [
    {
      id: 'signal-next-class',
      label: 'Schedule',
      detail: nextClassToday ? `${nextClassToday.subject} at ${nextClassToday.startTime}` : 'No upcoming class today'
    },
    {
      id: 'signal-canteen',
      label: 'Canteen',
      detail: 'Preordering enabled with live order status tracking.'
    },
    {
      id: 'signal-booking',
      label: 'Bookings',
      detail: 'Facility and academic space reservations are available now.'
    }
  ];
  return (
    <div className="min-h-screen bg-white pb-16">
      <StudentTopNav active="Home" />

      {/* ═══ HEADER ═══ */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative flex-shrink-0">
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Profile" className="w-14 h-14 rounded-full object-cover ring-2 ring-white/30 ring-offset-2 ring-offset-slate-900" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xl">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Student Portal</span>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight truncate">
                  {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'},{' '}
                  <span className="bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">{displayName}</span>
                </h1>
                <p className="text-white/70 text-sm mt-1">Your smart campus dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3.5 py-1.5 text-sm text-white font-medium">
                📅 {currentDateLabel}
              </span>
              <button onClick={() => setIsProfileDrawerOpen(true)} className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-sm shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:opacity-90 transition-opacity">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Today</p>
              <p className="text-3xl font-black text-cyan-300">{todayClasses.length}</p>
              <p className="text-xs text-white/50 mt-0.5">classes</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1">This Week</p>
              <p className="text-3xl font-black text-cyan-300">{totalClassesThisWeek}</p>
              <p className="text-xs text-white/50 mt-0.5">total classes</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Activity</p>
              <p className="text-3xl font-black text-emerald-400">{recentActivityCount}</p>
              <p className="text-xs text-white/50 mt-0.5">items</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Student ID</p>
              <p className="text-xl font-black text-accent truncate mt-1">{userProfile?.universityId || '—'}</p>
            </div>
          </div>

          {nextClassToday && (
            <div className="mt-4 bg-white/10 border border-white/20 rounded-xl px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/20 flex items-center justify-center text-xl flex-shrink-0">⏰</div>
                <div className="min-w-0">
                  <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Up Next</p>
                  <p className="text-sm text-white font-semibold truncate mt-0.5">
                    {nextClassToday.subject} • {nextClassToday.startTime}{nextClassToday.location ? ` • ${nextClassToday.location}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDay(todayKey)} className="text-sm text-cyan-400 font-semibold hover:text-cyan-300 transition-colors whitespace-nowrap">View →</button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ SERVICES ═══ */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <p className="text-xs text-primary uppercase tracking-widest font-bold mb-3">Campus Services</p>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceModules.map((service) => (
            <div
              key={service.id}
              onClick={() => navigate(service.route)}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-4">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{service.title}</h3>
              <p className="text-[11px] text-primary/70 font-semibold mt-0.5 uppercase tracking-wide">{service.subtitle}</p>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed line-clamp-2">{service.description}</p>
              <button className="mt-5 w-full py-2.5 rounded-xl bg-accent text-white font-bold text-sm shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:opacity-90 transition-opacity">
                {service.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ ACTIVITY + NOTICES ═══ */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <p className="text-xs text-primary uppercase tracking-widest font-bold mb-3">Live Feed</p>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Activity */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Activity</h2>
              <span className="text-xs text-slate-500 font-medium">{recentActivityCount} items</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {systemSignals.map((signal) => (
                <div key={signal.id} className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{signal.label}</p>
                  <p className="text-sm text-slate-700 mt-1 font-medium leading-snug">{signal.detail}</p>
                </div>
              ))}
            </div>

            {loadingActivity ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl"></div>)}
              </div>
            ) : (
              <div className="space-y-2">
                {activityFeed.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-lg flex-shrink-0">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900 text-sm truncate">{activity.title}</p>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0">{activity.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notices */}
          <div className="lg:col-span-5 bg-white border-2 border-primary/20 rounded-2xl p-6 shadow-sm ring-1 ring-primary/10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-full"></span>
                Notices
              </h2>
              <span className="text-[10px] text-white bg-primary rounded-lg px-2.5 py-1 font-bold uppercase tracking-wider">Admin</span>
            </div>

            {loadingNotices ? (
              <div className="space-y-3">
                {[1,2].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-xl"></div>)}
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl mx-auto mb-3">📋</div>
                <p className="text-sm text-slate-500">No notices yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <div key={notice._id} className="rounded-xl bg-primary/5 border border-primary/15 p-3.5 hover:border-primary/40 hover:bg-primary/10 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{notice.title}</p>
                      {notice.priority === 'high' && (
                        <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-500 flex-shrink-0">Urgent</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">{notice.content}</p>
                    <p className="text-[10px] text-primary/60 mt-2 font-medium">{new Date(notice.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Your Timetable Section */}
      <div
        ref={(el) => (sectionRefs.current['timetable'] = el)}
        data-section="timetable"
        className={`max-w-6xl mx-auto px-6 mt-8 pb-10 relative z-10 transform transition-all duration-700 ${
          visibleSections['timetable'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-gradient-to-br from-primary/5 via-white to-accent/5 border-2 border-primary/20 rounded-2xl p-6 shadow-sm ring-1 ring-accent/20">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-primary uppercase tracking-widest font-bold">Weekly Schedule</p>
              <h2 className="text-xl font-black text-slate-900 mt-1">Timetable Updates</h2>
              <p className="text-xs text-slate-600 mt-1">Track new classes and today's next session at a glance.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-accent/15 border border-accent/40 rounded-xl px-3 py-1.5 text-[10px] text-accent font-black tracking-widest uppercase">
                Live
              </span>
              <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-bold tracking-widest">
                {DAY_FULL[selectedDay]?.toUpperCase()}
              </span>
              <button
                onClick={() => { setEditingDay(selectedDay); setIsTimetableEditorOpen(true); }}
                className="px-3 py-1.5 rounded-xl bg-accent text-white hover:opacity-90 transition text-xs font-bold tracking-wide"
              >
                + Edit
              </button>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
            {DAYS.map((day) => {
              const isToday = day === getTodayKey();
              const isSelected = day === selectedDay;
              const hasClasses = timetable[day]?.length > 0;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 relative border ${
                    isSelected
                      ? 'bg-accent text-white border-transparent shadow-[0_0_12px_rgba(255,107,53,0.3)]'
                      : isToday
                      ? 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/20'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {DAY_LABELS[day]}
                  {hasClasses && !isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Classes for selected day */}
          {(() => {
            const dayClasses = (timetable[selectedDay] || []).sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
            const nextIdx = selectedDay === getTodayKey() ? getNextClassIndex(dayClasses) : -1;

            if (dayClasses.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl mb-3">📅</div>
                  <p className="text-slate-500 font-semibold">No classes on {DAY_FULL[selectedDay]}</p>
                  <p className="text-slate-400 text-sm mt-1">Click <span className="text-accent font-bold">+ Edit</span> to add your schedule</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dayClasses.map((cls, idx) => {
                  const isNext = idx === nextIdx;
                  return (
                    <div
                      key={cls.id || idx}
                      className={`p-5 rounded-2xl border transition-all duration-500 transform group ${
                        visibleSections['timetable'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      } ${
                        isNext
                          ? 'bg-accent/10 border-accent/40 shadow-lg shadow-accent/10'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                      style={{ transitionDelay: visibleSections['timetable'] ? `${idx * 100}ms` : '0ms' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-lg font-mono font-bold ${isNext ? 'text-accent' : 'text-slate-700'}`}>
                          {cls.startTime}{cls.endTime ? ` – ${cls.endTime}` : ''}
                        </span>
                        {isNext && <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-lg font-black tracking-wider animate-pulse">NEXT</span>}
                      </div>
                      <h3 className="font-bold text-slate-900">{cls.subject}</h3>
                      {cls.instructor && <p className="text-sm text-slate-500 mt-2">{cls.instructor}</p>}
                      {cls.location && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <span className="text-accent">◈</span> {cls.location}
                        </p>
                      )}
                      <div className={`mt-3 h-px w-8 ${isNext ? 'bg-accent' : 'bg-slate-600'} group-hover:w-full transition-all duration-500 rounded-full`}></div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Timetable Editor Drawer */}
      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isTimetableEditorOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTimetableEditorOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300 ease-out ${isTimetableEditorOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-accent/50 via-accent/20 to-transparent"></div>

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">Schedule Manager</p>
              <h2 className="text-2xl font-extrabold text-white mt-0.5">Edit Timetable</h2>
            </div>
            <button onClick={() => setIsTimetableEditorOpen(false)} className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition flex items-center justify-center">✕</button>
          </div>

          {/* Day Selector */}
          <div className="mb-5">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Select Day</p>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => setEditingDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    editingDay === day
                      ? 'bg-accent text-white'
                      : day === getTodayKey()
                      ? 'bg-accent/15 border border-accent/30 text-accent'
                      : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {DAY_LABELS[day]}
                  {day === getTodayKey() && editingDay !== day && <span className="ml-1 text-[9px]">TODAY</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Existing Classes */}
          <div className="mb-5">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">{DAY_FULL[editingDay]} Classes</p>
            {(timetable[editingDay] || []).length === 0 ? (
              <p className="text-slate-600 text-sm py-3">No classes added yet.</p>
            ) : (
              <div className="space-y-2">
                {(timetable[editingDay] || []).sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)).map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{cls.subject}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {cls.startTime}{cls.endTime ? ` – ${cls.endTime}` : ''}
                        {cls.location ? ` • ${cls.location}` : ''}
                        {cls.instructor ? ` • ${cls.instructor}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteClass(editingDay, cls.id)}
                      className="ml-3 flex-shrink-0 w-7 h-7 rounded-lg bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 transition text-xs flex items-center justify-center"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Class Form */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-accent uppercase tracking-widest font-bold">Add Class</p>
              <span className="text-[10px] text-slate-500">Saved automatically — stays until you change it</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Start Time *</label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM"
                  value={newClass.startTime}
                  onChange={(e) => setNewClass((p) => ({ ...p, startTime: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 text-sm focus:ring-1 focus:ring-accent/40 focus:border-accent/40 outline-none transition"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">End Time *</label>
                <input
                  type="text"
                  placeholder="e.g. 12:00 PM"
                  value={newClass.endTime}
                  onChange={(e) => setNewClass((p) => ({ ...p, endTime: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 text-sm focus:ring-1 focus:ring-accent/40 focus:border-accent/40 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Subject *</label>
              <input
                type="text"
                placeholder="e.g. Data Structures"
                value={newClass.subject}
                onChange={(e) => setNewClass((p) => ({ ...p, subject: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 text-sm focus:ring-1 focus:ring-accent/40 focus:border-accent/40 outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Instructor</label>
              <input
                type="text"
                placeholder="e.g. Dr. Silva"
                value={newClass.instructor}
                onChange={(e) => setNewClass((p) => ({ ...p, instructor: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 text-sm focus:ring-1 focus:ring-accent/40 focus:border-accent/40 outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Location</label>
              <input
                type="text"
                placeholder="e.g. Lab 2 / Room 405"
                value={newClass.location}
                onChange={(e) => setNewClass((p) => ({ ...p, location: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 text-sm focus:ring-1 focus:ring-accent/40 focus:border-accent/40 outline-none transition"
              />
            </div>

            {classError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2">{classError}</p>}

            <button
              onClick={handleAddClass}
              className="w-full py-2.5 rounded-xl bg-accent text-white font-bold hover:opacity-90 transition text-sm shadow-[0_0_20px_rgba(255,107,53,0.3)]"
            >
              + Add to {DAY_LABELS[editingDay]}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Drawer */}
      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isProfileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsProfileDrawerOpen(false)}></div>
          <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300 ease-out ${isProfileDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-primary/40 via-cyan-400/20 to-transparent"></div>

            <div className="relative flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">Account</p>
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent mt-0.5">Edit Profile</h2>
              </div>
              <button onClick={() => setIsProfileDrawerOpen(false)} className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition flex items-center justify-center">✕</button>
            </div>

            {loadingProfile ? (
              <p className="text-sm text-slate-400">Loading profile...</p>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  {displayPhoto ? (
                    <img src={displayPhoto} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="space-y-2">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm text-slate-300 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:font-semibold hover:file:bg-primary/30" />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={!displayPhoto}
                      className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-semibold hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</label>
                  <input name="name" value={profileForm.name} onChange={handleProfileChange} className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition text-white" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                  <input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition text-white" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">University ID</label>
                  <input name="universityId" value={profileForm.universityId} onChange={handleProfileChange} className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition text-white" />
                </div>

                {message && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{message}</p>}
                {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

                <div className="flex items-center gap-2 pt-1">
                  <button type="submit" disabled={savingProfile} className="flex-1 py-2.5 rounded-xl bg-accent text-white font-bold hover:opacity-90 transition disabled:opacity-50 text-sm shadow-[0_0_20px_rgba(255,107,53,0.3)]">
                    {savingProfile ? 'Saving...' : 'Update Profile'}
                  </button>
                  <button type="button" onClick={handleDeleteAccount} className="px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-semibold hover:bg-red-500/20 transition text-sm">
                    Delete
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition text-sm"
                >
                  Sign Out
                </button>
              </form>
            )}
          </div>
        </div>
    </div>
  );
};

export default StudentDashboard;