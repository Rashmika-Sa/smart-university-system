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

      await fetchActivity(user._id || user.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your profile.');
    } finally {
      setLoadingProfile(false);
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

  const notices = [
    { id: 1, title: 'Course Registration Deadline', details: 'Complete semester course registration before Friday 5:00 PM.' },
    { id: 2, title: 'Library Extended Hours', details: 'Library remains open until 10:00 PM during exam week.' },
    { id: 3, title: 'Shuttle Route Update', details: 'Morning shuttle route B has a 10-minute delay this week.' }
  ];

  // Campus Services
  const campusServices = [
    { id: 1, icon: '📚', label: 'Library', action: () => window.alert('Library portal coming soon') },
    { id: 2, icon: '🚌', label: 'Shuttle Schedule', action: () => navigate('/shuttle') },
    { id: 3, icon: '🏛️', label: 'Academic Space', action: () => navigate('/academic') },
    { id: 4, icon: '📋', label: 'Exam Results', action: () => window.alert('Results portal coming soon') }
  ];

  const displayName = userProfile?.name || 'Student';
  const displayPhoto = profileForm.profilePhoto || userProfile?.profilePhoto || '';

  return (
    <div className="min-h-screen bg-secondary font-sans text-gray-800 relative overflow-hidden">
      {/* Ambient glow layer */}
      <div className="fixed -top-32 -left-32 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed top-1/2 -right-40 w-[400px] h-[400px] bg-cyan-400/8 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-1/3 w-[400px] h-[400px] bg-purple-400/8 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <StudentTopNav active="Home" showLogout={false} />

      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-7 border border-white/80 shadow-xl shadow-indigo-100/60 overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Inner accent glows */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>
          {/* Top-left corner accent line */}
          <div className="absolute top-0 left-0 w-40 h-px bg-gradient-to-r from-primary/40 to-transparent"></div>
          <div className="absolute top-0 left-0 h-40 w-px bg-gradient-to-b from-primary/40 to-transparent"></div>

          <div className="relative flex items-center gap-5">
            <div className="relative">
              {displayPhoto ? (
                <img src={displayPhoto} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/30 shadow-lg shadow-primary/10" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-primary/20">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-bold">Student Portal</p>
              <h1 className="text-3xl font-extrabold leading-tight mt-0.5">
                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{displayName}</span>
              </h1>
              <p className="text-gray-500 mt-1 text-sm">Your smart campus control center — live, connected, powerful.</p>
            </div>
          </div>

          <div className="relative flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/my-orders')}
              className="px-5 py-2.5 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition shadow-lg shadow-accent/20 text-sm tracking-wide"
            >
              ⚡ View My Orders
            </button>
            <button
              onClick={() => setIsProfileDrawerOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-primary font-semibold hover:bg-primary/10 hover:border-primary/40 transition text-sm"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <section className="lg:col-span-2 relative bg-white/95 backdrop-blur-sm rounded-3xl border border-white/70 shadow-lg p-6 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Campus Updates</p>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">Notices</h2>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/8 border border-primary/20 rounded-lg px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] text-primary font-bold tracking-widest">LIVE</span>
            </div>
          </div>
          <div className="space-y-3">
            {notices.map((notice) => (
              <div key={notice.id} className="group p-4 rounded-2xl bg-gradient-to-r from-white to-secondary border border-gray-100 hover:border-primary/25 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/15 text-accent flex items-center justify-center text-sm flex-shrink-0">🔔</div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{notice.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notice.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-1 relative bg-white/95 backdrop-blur-sm rounded-3xl border border-white/70 shadow-lg p-6 overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-accent/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">Your Actions</p>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">Activity Feed</h2>
            </div>
            <span className="text-[10px] text-accent border border-accent/25 bg-accent/8 rounded-lg px-2.5 py-1 font-bold tracking-widest">RECENT</span>
          </div>
          {loadingActivity ? (
            <div className="space-y-2">
              <div className="h-14 bg-gray-100 animate-pulse rounded-xl"></div>
              <div className="h-14 bg-gray-100 animate-pulse rounded-xl"></div>
              <div className="h-14 bg-gray-100 animate-pulse rounded-xl"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {activityFeed.map((activity) => (
                <div key={activity.id} className="p-3 rounded-2xl bg-gradient-to-r from-secondary to-white border border-gray-100 hover:border-accent/25 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-800 text-sm">{activity.icon} {activity.title}</p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{activity.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Your Timetable Section */}
      <div
        ref={(el) => (sectionRefs.current['timetable'] = el)}
        data-section="timetable"
        className={`max-w-7xl mx-auto px-4 pb-10 relative z-10 transform transition-all duration-700 ${
          visibleSections['timetable'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-900/40 p-6 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="relative flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-cyan-400 font-bold">Weekly Schedule</p>
              <h2 className="text-2xl font-bold text-white mt-1">Timetable <span className="text-cyan-400">◈</span></h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-xs text-cyan-400 font-bold tracking-widest">{DAY_FULL[selectedDay]?.toUpperCase()}</span>
              </div>
              <button
                onClick={() => { setEditingDay(selectedDay); setIsTimetableEditorOpen(true); }}
                className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-slate-300 hover:bg-white/15 hover:text-white transition text-xs font-bold tracking-wide"
              >
                + Edit
              </button>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="relative flex gap-1.5 mb-5 overflow-x-auto pb-1">
            {DAYS.map((day) => {
              const isToday = day === getTodayKey();
              const isSelected = day === selectedDay;
              const hasClasses = timetable[day]?.length > 0;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-cyan-400 text-slate-900'
                      : isToday
                      ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  {DAY_LABELS[day]}
                  {hasClasses && !isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
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
                <div className="relative flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-3">📅</div>
                  <p className="text-slate-400 font-semibold">No classes on {DAY_FULL[selectedDay]}</p>
                  <p className="text-slate-600 text-sm mt-1">Click <span className="text-cyan-400 font-bold">+ Edit</span> to add your schedule</p>
                </div>
              );
            }

            return (
              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
                {dayClasses.map((cls, idx) => {
                  const isNext = idx === nextIdx;
                  return (
                    <div
                      key={cls.id || idx}
                      className={`relative p-5 rounded-2xl border transition-all duration-500 transform overflow-hidden group ${
                        visibleSections['timetable'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      } ${
                        isNext
                          ? 'bg-gradient-to-br from-cyan-900/60 to-indigo-900/60 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                          : 'bg-white/5 border-white/10 hover:border-indigo-400/40 hover:bg-white/[0.07]'
                      }`}
                      style={{ transitionDelay: visibleSections['timetable'] ? `${idx * 100}ms` : '0ms' }}
                    >
                      {isNext && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none rounded-2xl"></div>}
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-lg font-mono font-bold ${isNext ? 'text-cyan-300' : 'text-indigo-300'}`}>
                          {cls.startTime}{cls.endTime ? ` – ${cls.endTime}` : ''}
                        </span>
                        {isNext && <span className="text-[10px] bg-cyan-400 text-slate-900 px-2 py-0.5 rounded-lg font-black tracking-wider animate-pulse">NEXT</span>}
                      </div>
                      <h3 className="font-bold text-white">{cls.subject}</h3>
                      {cls.instructor && <p className="text-sm text-slate-400 mt-2">{cls.instructor}</p>}
                      {cls.location && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <span className="text-cyan-500">◈</span> {cls.location}
                        </p>
                      )}
                      <div className={`mt-3 h-px w-8 ${isNext ? 'bg-cyan-400' : 'bg-indigo-600'} group-hover:w-full transition-all duration-500 rounded-full`}></div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Quick Campus Services Section */}
      <div
        ref={(el) => (sectionRefs.current['services'] = el)}
        data-section="services"
        className={`max-w-7xl mx-auto px-4 pb-16 relative z-10 transform transition-all duration-700 ${
          visibleSections['services'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="relative bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-900/40 p-6 overflow-hidden">
          <div className="absolute -top-12 right-10 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-10 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-purple-400 font-bold">Quick Access</p>
              <h2 className="text-2xl font-bold text-white mt-1">Campus Services <span className="text-purple-400">⚡</span></h2>
            </div>
            <span className="text-xs text-purple-400 border border-purple-500/30 bg-purple-500/10 rounded-xl px-3 py-1.5 font-bold tracking-widest">PORTAL</span>
          </div>

          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4">
            {campusServices.map((service, idx) => (
              <button
                key={service.id}
                onClick={service.action}
                className={`relative p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-500 transform group overflow-hidden ${
                  visibleSections['services'] ? 'opacity-100 translate-y-0 hover:scale-105 hover:-translate-y-1' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: visibleSections['services'] ? `${idx * 80}ms` : '0ms' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/5 transition-all duration-500 rounded-2xl pointer-events-none"></div>
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                <p className="font-bold text-slate-300 group-hover:text-white text-sm leading-tight transition-colors">{service.label}</p>
                <div className="mt-3 h-px w-6 bg-purple-500/40 group-hover:w-full group-hover:bg-purple-400 transition-all duration-500 rounded-full"></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timetable Editor Drawer */}
      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isTimetableEditorOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTimetableEditorOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-white/10 shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300 ease-out ${isTimetableEditorOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-cyan-400/50 via-indigo-400/20 to-transparent"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">Schedule Manager</p>
              <h2 className="text-2xl font-extrabold text-white mt-0.5">Edit Timetable</h2>
            </div>
            <button onClick={() => setIsTimetableEditorOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition flex items-center justify-center">✕</button>
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
                      ? 'bg-cyan-400 text-slate-900'
                      : day === getTodayKey()
                      ? 'bg-cyan-500/20 border border-cyan-400/30 text-cyan-400'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
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
                  <div key={cls.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group">
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
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Add Class</p>
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
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-1 focus:ring-cyan-400/40 focus:border-cyan-400/40 outline-none transition"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">End Time *</label>
                <input
                  type="text"
                  placeholder="e.g. 12:00 PM"
                  value={newClass.endTime}
                  onChange={(e) => setNewClass((p) => ({ ...p, endTime: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-1 focus:ring-cyan-400/40 focus:border-cyan-400/40 outline-none transition"
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
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-1 focus:ring-cyan-400/40 focus:border-cyan-400/40 outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Instructor</label>
              <input
                type="text"
                placeholder="e.g. Dr. Silva"
                value={newClass.instructor}
                onChange={(e) => setNewClass((p) => ({ ...p, instructor: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-1 focus:ring-cyan-400/40 focus:border-cyan-400/40 outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Location</label>
              <input
                type="text"
                placeholder="e.g. Lab 2 / Room 405"
                value={newClass.location}
                onChange={(e) => setNewClass((p) => ({ ...p, location: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-1 focus:ring-cyan-400/40 focus:border-cyan-400/40 outline-none transition"
              />
            </div>

            {classError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2">{classError}</p>}

            <button
              onClick={handleAddClass}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-bold hover:brightness-110 transition text-sm"
            >
              + Add to {DAY_LABELS[editingDay]}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Drawer */}
      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isProfileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsProfileDrawerOpen(false)}></div>
          <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white border-l border-gray-100 shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300 ease-out ${isProfileDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-primary/40 via-accent/20 to-transparent"></div>

            <div className="relative flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">Account</p>
                <h2 className="text-2xl font-extrabold text-primary mt-0.5">Edit Profile</h2>
              </div>
              <button onClick={() => setIsProfileDrawerOpen(false)} className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition flex items-center justify-center">✕</button>
            </div>

            {loadingProfile ? (
              <p className="text-sm text-gray-500">Loading profile...</p>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  {displayPhoto ? (
                    <img src={displayPhoto} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xl shadow-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold hover:file:bg-primary/20" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</label>
                  <input name="name" value={profileForm.name} onChange={handleProfileChange} className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition text-gray-800" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                  <input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition text-gray-800" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">University ID</label>
                  <input name="universityId" value={profileForm.universityId} onChange={handleProfileChange} className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition text-gray-800" />
                </div>

                {message && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</p>}
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

                <div className="flex items-center gap-2 pt-1">
                  <button type="submit" disabled={savingProfile} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition disabled:opacity-50 text-sm">
                    {savingProfile ? 'Saving...' : 'Update Profile'}
                  </button>
                  <button type="button" onClick={handleDeleteAccount} className="px-3 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-semibold hover:bg-red-100 transition text-sm">
                    Delete
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 font-semibold hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition text-sm"
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