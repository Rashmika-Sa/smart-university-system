import React, { useEffect, useState } from 'react';
import {
  getAllRoomBookings, updateRoomBookingStatus,
  getAllChairBookings, updateChairBookingStatus,
  getAllBookBookings, updateBookBookingStatus,
} from '../../../api/libraryApi';
import { Spinner, EmptyState } from '../LibraryUI';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-500',
  completed: 'bg-slate-100 text-slate-500',
  collected: 'bg-blue-100 text-blue-700',
  returned:  'bg-slate-100 text-slate-600',
  overdue:   'bg-orange-100 text-orange-600',
};

const Badge = ({ status }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[status] || ''}`}>{status}</span>
);

const CancelNoteForm = ({ note, setNote, onCancel, onConfirm }) => (
  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
    <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
      placeholder="Reason for cancellation (optional)"
      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
    />
    <div className="flex gap-2">
      <button onClick={onCancel} className="flex-1 border border-slate-300 text-slate-600 text-xs font-semibold py-2 rounded-xl">Back</button>
      <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-xl">Confirm Cancellation</button>
    </div>
  </div>
);

const AdminConfirmations = () => {
  const [roomBookings,  setRoomBookings]  = useState([]);
  const [chairBookings, setChairBookings] = useState([]);
  const [bookBookings,  setBookBookings]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [type,          setType]          = useState('all');
  const [status,        setStatus]        = useState('pending');
  const [noteModal,     setNoteModal]     = useState(null);
  const [note,          setNote]          = useState('');
  const [returnDate,    setReturnDate]    = useState('');

  const today = new Date().toISOString().split('T')[0];

  const load = (s) => {
    const f = s ? { status: s } : {};
    setLoading(true);
    Promise.all([
      getAllRoomBookings(f).then(r  => setRoomBookings(r.data)),
      getAllChairBookings(f).then(r => setChairBookings(r.data)),
      getAllBookBookings(f).then(r  => setBookBookings(r.data)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { load(status); }, [status]);

  const handleRoom = async (id, s) => {
    try {
      await updateRoomBookingStatus(id, { status: s, adminNote: note });
      setRoomBookings(prev => prev.map(b => b._id === id ? { ...b, status: s, adminNote: note } : b));
      toast.success(`Room booking ${s}`); setNoteModal(null); setNote('');
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  const handleChair = async (id, s) => {
    try {
      await updateChairBookingStatus(id, { status: s, adminNote: note });
      setChairBookings(prev => prev.map(b => b._id === id ? { ...b, status: s, adminNote: note } : b));
      toast.success(`Chair booking ${s}`); setNoteModal(null); setNote('');
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  const handleBook = async (id, s) => {
    try {
      await updateBookBookingStatus(id, { status: s, adminNote: note, returnDate });
      setBookBookings(prev => prev.map(b => b._id === id ? { ...b, status: s, adminNote: note, returnDate } : b));
      toast.success(`Book booking ${s}`); setNoteModal(null); setNote(''); setReturnDate('');
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Booking Confirmations</h2>
        <p className="text-sm text-slate-500 mt-1">Review and action all booking requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-1.5">
          {[{id:'all',l:'All'},{id:'rooms',l:'🏠 Rooms'},{id:'chairs',l:'💺 Chairs'},{id:'books',l:'📚 Books'}].map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${type === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {t.l}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {[{id:'pending',l:'Pending'},{id:'confirmed',l:'Confirmed'},{id:'cancelled',l:'Cancelled'},{id:'',l:'All'}].map(s => (
            <button key={s.id} onClick={() => setStatus(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${status === s.id ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-6">

          {/* ROOM BOOKINGS */}
          {(type === 'all' || type === 'rooms') && roomBookings.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">🏠 Room Bookings</h3>
              <div className="space-y-3">
                {roomBookings.map(b => (
                  <div key={b._id} className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="flex flex-col md:flex-row md:justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-800">{b.room?.name} — {b.room?.floor}</p>
                        <p className="text-sm text-slate-500">{b.date} · Sessions: {b.sessions?.join(', ')}</p>
                        <p className="text-sm text-slate-600"><span className="font-semibold">Lead:</span> {b.leadStudent?.name} ({b.leadStudent?.universityId})</p>
                        <p className="text-xs text-slate-400">Group: {b.groupMembers?.map(m => m.name).join(', ')}</p>
                        {b.adminNote && <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg mt-1">Note: {b.adminNote}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge status={b.status} />
                        {b.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleRoom(b._id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">Confirm</button>
                            <button onClick={() => { setNoteModal({id:b._id,type:'room'}); setNote(''); }}
                              className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl">Cancel</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {noteModal?.id === b._id && noteModal?.type === 'room' && (
                      <CancelNoteForm note={note} setNote={setNote}
                        onCancel={() => setNoteModal(null)}
                        onConfirm={() => handleRoom(b._id, 'cancelled')}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAIR BOOKINGS */}
          {(type === 'all' || type === 'chairs') && chairBookings.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">💺 Chair Bookings</h3>
              <div className="space-y-3">
                {chairBookings.map(b => (
                  <div key={b._id} className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="flex flex-col md:flex-row md:justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-800">Seat #{b.seat?.seatNumber} — {b.seat?.floor?.name}</p>
                        <p className="text-sm text-slate-500">{b.date} · <span className="capitalize">{b.timeSlot}</span></p>
                        <p className="text-sm text-slate-600"><span className="font-semibold">Student:</span> {b.student?.name} ({b.student?.universityId})</p>
                        {b.adminNote && <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg mt-1">Note: {b.adminNote}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge status={b.status} />
                        {b.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleChair(b._id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">Confirm</button>
                            <button onClick={() => { setNoteModal({id:b._id,type:'chair'}); setNote(''); }}
                              className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl">Cancel</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {noteModal?.id === b._id && noteModal?.type === 'chair' && (
                      <CancelNoteForm note={note} setNote={setNote}
                        onCancel={() => setNoteModal(null)}
                        onConfirm={() => handleChair(b._id, 'cancelled')}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOOK BOOKINGS */}
          {(type === 'all' || type === 'books') && bookBookings.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">📚 Book Bookings</h3>
              <div className="space-y-3">
                {bookBookings.map(b => (
                  <div key={b._id} className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="flex flex-col md:flex-row md:justify-between gap-3">
                      <div className="flex-1">
                        {b.books?.map(book => (
                          <p key={book._id} className="font-semibold text-slate-800 text-sm">
                            {book.title} <span className="text-xs text-slate-400 font-normal">by {book.author}</span>
                          </p>
                        ))}
                        <p className="text-sm text-slate-600 mt-1"><span className="font-semibold">Student:</span> {b.student?.name} ({b.student?.universityId})</p>
                        <p className="text-xs text-slate-500">Collection: {b.bookingDate}</p>
                        {b.returnDate && <p className="text-xs text-orange-600 font-semibold">Return by: {b.returnDate}</p>}
                        {b.adminNote && <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg mt-1">Note: {b.adminNote}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge status={b.status} />
                        {b.status === 'pending' && (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex gap-2">
                              <button onClick={() => { setNoteModal({id:b._id,type:'book-confirm'}); setNote(''); setReturnDate(''); }}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">Confirm</button>
                              <button onClick={() => { setNoteModal({id:b._id,type:'book-cancel'}); setNote(''); }}
                                className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl">Cancel</button>
                            </div>
                          </div>
                        )}
                        {b.status === 'confirmed' && (
                          <button onClick={() => handleBook(b._id, 'collected')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">Mark Collected</button>
                        )}
                        {b.status === 'collected' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleBook(b._id, 'returned')}
                              className="bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">Mark Returned</button>
                            <button onClick={() => handleBook(b._id, 'overdue')}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">Mark Overdue</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Confirm with return date */}
                    {noteModal?.id === b._id && noteModal?.type === 'book-confirm' && (
                      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Return Date *</label>
                          <input type="date" min={today} value={returnDate} onChange={e => setReturnDate(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                          placeholder="Admin note (optional)"
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => { setNoteModal(null); setReturnDate(''); }}
                            className="flex-1 border border-slate-300 text-slate-600 text-xs font-semibold py-2 rounded-xl">Back</button>
                          <button onClick={() => handleBook(b._id, 'confirmed')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-xl">Confirm Booking</button>
                        </div>
                      </div>
                    )}
                    {noteModal?.id === b._id && noteModal?.type === 'book-cancel' && (
                      <CancelNoteForm note={note} setNote={setNote}
                        onCancel={() => setNoteModal(null)}
                        onConfirm={() => handleBook(b._id, 'cancelled')}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {roomBookings.length === 0 && chairBookings.length === 0 && bookBookings.length === 0 && (
            <EmptyState msg={`No ${status || ''} bookings found.`} />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminConfirmations;