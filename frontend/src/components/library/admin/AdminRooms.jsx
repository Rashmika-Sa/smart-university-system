import React, { useEffect, useState } from 'react';
import { getAllRoomsAdmin, createRoom, updateRoom, deleteRoom } from '../../../api/libraryApi';
import { Spinner } from '../LibraryUI';
import toast from 'react-hot-toast';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const emptyRoom = {
  name: '', floor: '', description: '',
  sessions: [
    { sessionNumber: 1, startTime: '08:00', endTime: '10:00', label: 'Morning' },
    { sessionNumber: 2, startTime: '10:00', endTime: '12:00', label: 'Late Morning' },
    { sessionNumber: 3, startTime: '13:00', endTime: '15:00', label: 'Afternoon' },
    { sessionNumber: 4, startTime: '15:00', endTime: '17:00', label: 'Late Afternoon' },
  ],
  availableDays: ['Mon','Tue','Wed','Thu','Fri'],
  status: 'active',
};

const AdminRooms = () => {
  const [rooms,    setRooms]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(emptyRoom);

  const load = () => {
    getAllRoomsAdmin()
      .then(res => setRooms(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyRoom); setEditing(null); setShowForm(true); };
  const openEdit   = (room) => { setForm({ ...room }); setEditing(room._id); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this room?')) return;
    try { await deleteRoom(id); setRooms(prev => prev.filter(r => r._id !== id)); toast.success('Room deleted'); }
    catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  const handleSessionChange = (i, field, val) => {
    const s = [...form.sessions]; s[i] = { ...s[i], [field]: val };
    setForm({ ...form, sessions: s });
  };

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.floor) return toast.error('Name and floor are required');
    try {
      if (editing) {
        const res = await updateRoom(editing, form);
        setRooms(prev => prev.map(r => r._id === editing ? res.data : r));
        toast.success('Room updated');
      } else {
        const res = await createRoom(form);
        setRooms(prev => [...prev, res.data]);
        toast.success('Room created');
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Private Room Management</h2>
          <p className="text-sm text-slate-500 mt-1">Add, edit and manage study rooms</p>
        </div>
        <button onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition">
          + Add Room
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                {['Room','Floor','Sessions','Days','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map(room => (
                <tr key={room._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{room.name}</td>
                  <td className="px-4 py-3 text-slate-600">{room.floor}</td>
                  <td className="px-4 py-3 text-slate-600">{room.sessions?.length || 0} sessions</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{room.availableDays?.join(', ')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${room.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-3">
                    <button onClick={() => openEdit(room)} className="text-indigo-600 hover:underline text-xs font-semibold">Edit</button>
                    <button onClick={() => handleDelete(room._id)} className="text-red-500 hover:underline text-xs font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No rooms yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Room Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Room' : 'Add New Room'}</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Room Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="Study Room A"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Floor *</label>
                    <input value={form.floor} onChange={e => setForm({...form, floor: e.target.value})}
                      placeholder="Ground Floor"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    rows={2} placeholder="Optional description..."
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Sessions (4 required)</label>
                  <div className="space-y-2">
                    {form.sessions.map((s, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2 items-center">
                        <span className="text-xs text-slate-500 font-semibold">S{s.sessionNumber}</span>
                        <input value={s.label} onChange={e => handleSessionChange(i, 'label', e.target.value)}
                          placeholder="Label" className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input type="time" value={s.startTime} onChange={e => handleSessionChange(i, 'startTime', e.target.value)}
                          className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input type="time" value={s.endTime} onChange={e => handleSessionChange(i, 'endTime', e.target.value)}
                          className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Available Days</label>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map(day => (
                      <button key={day} type="button" onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          form.availableDays.includes(day) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={handleSubmit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition">
                  {editing ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;