import React, { useEffect, useState } from 'react';
import { getAllFloorsAdmin, createFloor, deleteFloor, getAllChairBookings, updateChairBookingStatus } from '../../../api/libraryApi';
import { Spinner, EmptyState } from '../LibraryUI';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-500',
  completed: 'bg-slate-100 text-slate-500',
};

const AdminChairBookings = () => {
  const [floors,      setFloors]     = useState([]);
  const [bookings,    setBookings]   = useState([]);
  const [loading,     setLoading]    = useState(false);
  const [activeTab,   setActiveTab]  = useState('bookings');
  const [filter,      setFilter]     = useState('pending');
  const [noteModal,   setNoteModal]  = useState(null);
  const [note,        setNote]       = useState('');
  const [floorForm,   setFloorForm]  = useState({ floorNumber: '', name: '', totalSeats: 250 });

  const loadFloors   = () => getAllFloorsAdmin().then(r => setFloors(r.data)).catch(() => {});
  const loadBookings = (f) => {
    setLoading(true);
    getAllChairBookings(f ? { status: f } : {})
      .then(r => setBookings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFloors(); }, []);
  useEffect(() => { loadBookings(filter); }, [filter]);

  const handleAction = async (id, status) => {
    try {
      await updateChairBookingStatus(id, { status, adminNote: note });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status, adminNote: note } : b));
      toast.success(`Booking ${status}`);
      setNoteModal(null); setNote('');
    } catch (err) { toast.error(err.response?.data?.msg || 'Action failed'); }
  };

  const handleCreateFloor = async () => {
    if (!floorForm.floorNumber || !floorForm.name) return toast.error('Floor number and name required');
    try {
      const res = await createFloor(floorForm);
      setFloors(prev => [...prev, res.data.floor]);
      toast.success(`Floor created with ${floorForm.totalSeats} seats`);
      setFloorForm({ floorNumber: '', name: '', totalSeats: 250 });
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  const handleDeleteFloor = async (id) => {
    if (!confirm('Delete this floor and all its seats?')) return;
    try {
      await deleteFloor(id);
      setFloors(prev => prev.filter(f => f._id !== id));
      toast.success('Floor deleted');
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Chair Booking Management</h2>
        <p className="text-sm text-slate-500 mt-1">Manage floors, seats and chair booking requests</p>
      </div>

      <div className="flex gap-2 mb-5 border-b border-slate-200">
        {[{id:'bookings',label:'📋 Bookings'},{id:'floors',label:'🏢 Floors & Seats'}].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              activeTab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* BOOKINGS */}
      {activeTab === 'bookings' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {['pending','confirmed','cancelled',''].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {s ? s.charAt(0).toUpperCase()+s.slice(1) : 'All'}
              </button>
            ))}
          </div>

          {loading ? <Spinner /> : bookings.length === 0 ? <EmptyState msg="No chair bookings found." /> : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b._id} className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="flex flex-col md:flex-row md:justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-800">Seat #{b.seat?.seatNumber} — {b.seat?.floor?.name}</p>
                      <p className="text-sm text-slate-500">{b.date} · <span className="capitalize">{b.timeSlot}</span></p>
                      <p className="text-sm text-slate-600"><span className="font-semibold">Student:</span> {b.student?.name} ({b.student?.universityId})</p>
                      {b.adminNote && <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg mt-1">Note: {b.adminNote}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[b.status] || ''}`}>{b.status}</span>
                      {b.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(b._id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">Confirm</button>
                          <button onClick={() => { setNoteModal(b._id); setNote(''); }}
                            className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl">Cancel</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {noteModal === b._id && (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                      <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                        placeholder="Reason (optional)"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setNoteModal(null)}
                          className="flex-1 border border-slate-300 text-slate-600 text-xs font-semibold py-2 rounded-xl">Back</button>
                        <button onClick={() => handleAction(b._id, 'cancelled')}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-xl">Confirm Cancellation</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FLOORS */}
      {activeTab === 'floors' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="font-bold text-slate-800 mb-4">Add New Floor</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Floor Number</label>
                <input type="number" value={floorForm.floorNumber} min="1"
                  onChange={e => setFloorForm({...floorForm, floorNumber: e.target.value})}
                  placeholder="1"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Floor Name</label>
                <input value={floorForm.name}
                  onChange={e => setFloorForm({...floorForm, name: e.target.value})}
                  placeholder="Ground Floor"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Seats</label>
                <input type="number" value={floorForm.totalSeats} min="1" max="500"
                  onChange={e => setFloorForm({...floorForm, totalSeats: parseInt(e.target.value)})}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button onClick={handleCreateFloor}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
              Create Floor + Auto-generate Seats
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  {['Floor No.','Name','Total Seats','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {floors.map(f => (
                  <tr key={f._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold">{f.floorNumber}</td>
                    <td className="px-4 py-3">{f.name}</td>
                    <td className="px-4 py-3">{f.totalSeats}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${f.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteFloor(f._id)} className="text-red-500 hover:underline text-xs font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
                {floors.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No floors yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChairBookings;