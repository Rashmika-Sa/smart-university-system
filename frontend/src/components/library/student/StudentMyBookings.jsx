import React, { useEffect, useState } from 'react';
import { getMyRoomBookings, cancelRoomBooking, getMyChairBookings, cancelChairBooking, getMyBookBookings, cancelBookBooking } from '../../../api/libraryApi';
import RoomBookingModal from './RoomBookingModal';
import { Spinner, EmptyState } from '../LibraryUI';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-500',
  completed: 'bg-slate-100 text-slate-500',
  collected: 'bg-blue-100 text-blue-700',
  returned:  'bg-slate-100 text-slate-500',
  overdue:   'bg-orange-100 text-orange-600',
};

const Badge = ({ status }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[status] || 'bg-slate-100'}`}>
    {status}
  </span>
);

const StudentMyBookings = () => {
  const [tab,          setTab]          = useState('rooms');
  const [roomBookings,  setRoomBookings]  = useState([]);
  const [chairBookings, setChairBookings] = useState([]);
  const [bookBookings,  setBookBookings]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [editingRoomBooking, setEditingRoomBooking] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const [roomRes, chairRes, bookRes] = await Promise.all([
        getMyRoomBookings(),
        getMyChairBookings(),
        getMyBookBookings(),
      ]);

      setRoomBookings(roomRes.data);
      setChairBookings(chairRes.data);
      setBookBookings(bookRes.data);
    } catch (err) {
      setRoomBookings([]);
      setChairBookings([]);
      setBookBookings([]);
      toast.error(err.response?.data?.msg || 'Please log in to view your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelRoom = async (id) => {
    if (!confirm('Cancel this room booking?')) return;
    try {
      await cancelRoomBooking(id);
      await loadBookings();
      toast.success('Room booking cancelled');
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  const handleCancelChair = async (id) => {
    if (!confirm('Cancel this seat booking?')) return;
    try {
      await cancelChairBooking(id);
      await loadBookings();
      toast.success('Seat booking cancelled');
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  const handleCancelBook = async (id) => {
    if (!confirm('Cancel this book booking?')) return;
    try {
      await cancelBookBooking(id);
      await loadBookings();
      toast.success('Book booking cancelled');
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  if (loading) return <Spinner />;

  const TABS = [
    { id: 'rooms',  label: `🏠 Rooms (${roomBookings.length})`  },
    { id: 'chairs', label: `💺 Seats (${chairBookings.length})` },
    { id: 'books',  label: `📚 Books (${bookBookings.length})`  },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">My Bookings</h2>
        <p className="text-sm text-slate-500 mt-1">View and manage all your library bookings</p>
      </div>

      <div className="flex gap-2 mb-5 border-b border-slate-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Room Bookings */}
      {tab === 'rooms' && (
        <div className="space-y-3">
          {roomBookings.length === 0 ? <EmptyState msg="No room bookings yet." />
            : roomBookings.map(b => (
              <div key={b._id} className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-800">{b.room?.name}</p>
                    <p className="text-sm text-slate-500">{b.room?.floor} · {b.date}</p>
                    <p className="text-sm text-slate-500">Sessions: {b.sessions?.map(n => `S${n}`).join(', ')}</p>
                    <p className="text-sm text-slate-500">Group: {b.groupMembers?.length} students</p>
                    {b.adminNote && <p className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded-lg">Note: {b.adminNote}</p>}
                  </div>
                  <Badge status={b.status} />
                </div>
                {b.status === 'pending' && (
                  <div className="mt-3 flex gap-4">
                    <button onClick={() => setEditingRoomBooking(b)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold">Edit Booking</button>
                    <button onClick={() => handleCancelRoom(b._id)}
                      className="text-sm text-red-500 hover:text-red-700 font-semibold">Cancel Booking</button>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}

      {/* Chair Bookings */}
      {tab === 'chairs' && (
        <div className="space-y-3">
          {chairBookings.length === 0 ? <EmptyState msg="No seat bookings yet." />
            : chairBookings.map(b => (
              <div key={b._id} className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-800">Seat #{b.seat?.seatNumber} — {b.seat?.floor?.name}</p>
                    <p className="text-sm text-slate-500 capitalize">{b.date} · {b.timeSlot}</p>
                    {b.adminNote && <p className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded-lg">Note: {b.adminNote}</p>}
                  </div>
                  <Badge status={b.status} />
                </div>
                {b.status === 'pending' && (
                  <button onClick={() => handleCancelChair(b._id)}
                    className="mt-3 text-sm text-red-500 hover:text-red-700 font-semibold">Cancel Booking</button>
                )}
              </div>
            ))
          }
        </div>
      )}

      {/* Book Bookings */}
      {tab === 'books' && (
        <div className="space-y-3">
          {bookBookings.length === 0 ? <EmptyState msg="No book bookings yet." />
            : bookBookings.map(b => (
              <div key={b._id} className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {b.books?.map(book => (
                      <p key={book._id} className="font-semibold text-slate-800 text-sm">
                        {book.title} <span className="text-xs text-slate-400 font-normal">by {book.author}</span>
                      </p>
                    ))}
                    <p className="text-xs text-slate-500 mt-1">Collection: {b.bookingDate}</p>
                    {b.returnDate && <p className="text-xs text-orange-600 font-semibold">Return by: {b.returnDate}</p>}
                    {b.adminNote && <p className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded-lg">Note: {b.adminNote}</p>}
                  </div>
                  <Badge status={b.status} />
                </div>
                {b.status === 'pending' && (
                  <button onClick={() => handleCancelBook(b._id)}
                    className="mt-3 text-sm text-red-500 hover:text-red-700 font-semibold">Cancel Booking</button>
                )}
              </div>
            ))
          }
        </div>
      )}

      {editingRoomBooking && (
        <RoomBookingModal
          booking={editingRoomBooking}
          room={editingRoomBooking.room}
          onClose={() => setEditingRoomBooking(null)}
          onSaved={() => {
            setEditingRoomBooking(null);
            loadBookings();
          }}
        />
      )}
    </div>
  );
};

export default StudentMyBookings;