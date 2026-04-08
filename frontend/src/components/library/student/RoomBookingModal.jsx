import React, { useState, useEffect } from 'react';
import { getRoomAvailability, createRoomBooking, updateRoomBooking, getRooms } from '../../../api/libraryApi';
import useStudentEmailValidation from '../../../hooks/useStudentEmailValidation';
import toast from 'react-hot-toast';

const RoomBookingModal = ({ room, booking, onClose, onSaved }) => {
  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const myEmail = user.email || ''; // lead student's email
  const isEditing = Boolean(booking);

  const [date,        setDate]    = useState('');
  const [selSessions, setSel]     = useState([]);
  const [booked,      setBooked]  = useState([]);
  const [members,     setMembers] = useState(['', '', '']); // 3 other members
  const [rooms,       setRooms]   = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(room?._id || booking?.room?._id || '');
  const [loading,     setLoading] = useState(false);
  const [error,       setError]   = useState('');
  const { loading: emailsLoading, error: emailsError, isStudentEmailValid } = useStudentEmailValidation();

  useEffect(() => {
    if (booking) {
      setDate(booking.date || '');
      setSel(Array.isArray(booking.sessions) ? booking.sessions : []);
      setMembers(Array.isArray(booking.groupMembers) ? booking.groupMembers.slice(1) : ['', '', '']);
      setSelectedRoomId(booking.room?._id || room?._id || '');
      return;
    }

    setDate('');
    setSel([]);
    setMembers(['', '', '']);
    setSelectedRoomId(room?._id || '');
  }, [booking, room]);

  useEffect(() => {
    if (!isEditing) return;

    getRooms()
      .then(res => {
        const activeRooms = res.data || [];
        const currentRoom = booking?.room && !activeRooms.some(item => item._id === booking.room._id)
          ? [booking.room]
          : [];
        setRooms([...currentRoom, ...activeRooms]);
      })
      .catch(() => {});
  }, [isEditing, booking]);

  useEffect(() => {
    if (!date || !selectedRoomId) return;
    getRoomAvailability(selectedRoomId, date, booking?._id)
      .then(res => { setBooked(res.data.bookedSessions); })
      .catch(() => {});
  }, [date, selectedRoomId, booking?._id]);

  const toggleSession = (n) =>
    setSel(prev =>
      prev.includes(n) ? prev.filter(x => x !== n)
        : prev.length < 2 ? [...prev, n]
        : prev
    );

  const updateMember = (i, val) => {
    const u = [...members];
    u[i] = val;
    setMembers(u);
  };

  const handleSubmit = async () => {
    setError('');

    if (!date) return setError('Please select a date');
    if (!selSessions.length) return setError('Select at least one session');
    if (!myEmail) return setError('Session expired. Please log out and log in again.');
    if (!selectedRoomId) return setError('Please select a room');

    const filled = members.map(m => m.trim()).filter(Boolean);
    if (filled.length < 3) return setError('Enter at least 3 other student emails');

    if (emailsLoading) return setError('Loading student email directory. Please try again.');
    if (emailsError) return setError(emailsError);

    const invalid = filled.filter(email => !isStudentEmailValid(email));
    if (invalid.length > 0)
      return setError(`Student account not found for: ${invalid.join(', ')}`);

    const groupMembers = [myEmail, ...filled].map(email => email.trim().toLowerCase());
    const payload = {
      roomId: selectedRoomId,
      groupMembers,
      date,
      sessions: selSessions,
    };

    setLoading(true);
    try {
      const response = isEditing
        ? await updateRoomBooking(booking._id, payload)
        : await createRoomBooking(payload);

      toast.success(isEditing ? 'Room booking updated successfully.' : 'Room booking submitted! Awaiting admin approval.');
      if (onSaved) onSaved(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const activeRoom = selectedRoomId
    ? rooms.find(item => item._id === selectedRoomId) || booking?.room || room
    : booking?.room || room;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">

          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {activeRoom?.name || 'Room Booking'}
              </h2>
              <p className="text-sm text-slate-400">
                {activeRoom?.floor || ''}
              </p>
            </div>
            <button onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
          </div>

          {isEditing && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Room</label>
              <select
                value={selectedRoomId}
                onChange={e => setSelectedRoomId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select room</option>
                {(rooms.length ? rooms : [booking?.room]).filter(Boolean).map(item => (
                  <option key={item._id} value={item._id}>
                    {item.name}{item.floor ? ` - ${item.floor}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Select Date</label>
            <input type="date" min={today} value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sessions */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Sessions <span className="text-slate-400 font-normal">(max 2)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {activeRoom?.sessions?.map(s => {
                const isBooked   = booked.includes(s.sessionNumber);
                const isSelected = selSessions.includes(s.sessionNumber);
                return (
                  <button key={s.sessionNumber}
                    disabled={isBooked || !date}
                    onClick={() => toggleSession(s.sessionNumber)}
                    className={`p-3 rounded-xl border text-left text-sm transition
                      ${isBooked   ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed'
                      : isSelected ? 'bg-indigo-600 border-indigo-600 text-white'
                      : !date      ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                                   : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'}`}
                  >
                    <div className="font-semibold text-xs uppercase tracking-wide mb-0.5">
                      {s.label || `Session ${s.sessionNumber}`}
                    </div>
                    <div className="text-xs opacity-80">{s.startTime} – {s.endTime}</div>
                    {isBooked && <div className="text-xs text-red-400 mt-1">Unavailable</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group Members */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Group Members
              <span className="text-slate-400 font-normal ml-1">(3–4 student emails besides yourself)</span>
            </label>

            {/* Show logged-in student's email */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-500 font-semibold">You (Lead Student)</p>
                <p className="text-sm font-bold text-indigo-700">
                  {myEmail || user.name || 'You'}
                </p>
              </div>
              <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Lead</span>
            </div>

            <div className="space-y-2">
              {members.map((val, i) => (
                <div key={i} className="relative">
                  <input
                    type="email"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={`Student email ${i + 2} — e.g. it23821972@my.sliit.lk${i >= 3 ? ' (optional)' : ''}`}
                    value={val}
                    onChange={e => updateMember(i, e.target.value.toLowerCase())}
                    className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                      ${val && !emailsLoading && !isStudentEmailValid(val)
                        ? 'border-red-300 bg-red-50 focus:ring-red-400'
                        : 'border-slate-300'}`}
                  />
                  {/* Live validation indicator */}
                  {val && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold
                      ${emailsLoading ? 'text-slate-400' : isStudentEmailValid(val) ? 'text-green-500' : 'text-red-400'}`}>
                      {emailsLoading ? 'Checking...' : isStudentEmailValid(val) ? '✓' : '✗ Email not found'}
                    </span>
                  )}
                </div>
              ))}
              {members.length < 4 && (
                <button
                  type="button"
                  onClick={() => setMembers([...members, ''])}
                  className="text-xs text-indigo-600 hover:underline mt-1">
                  + Add 4th member
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-2">
              All emails must belong to a registered student account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-xl transition text-sm">
            {loading ? 'Submitting...' : isEditing ? 'Update Booking' : 'Submit Booking Request'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default RoomBookingModal;