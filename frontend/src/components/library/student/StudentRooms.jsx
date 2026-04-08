import React, { useEffect, useState } from 'react';
import { getRooms } from '../../../api/libraryApi';
import RoomBookingModal from './RoomBookingModal';
import { Spinner, EmptyState } from '../LibraryUI';

const StudentRooms = () => {
  const [rooms,  setRooms]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,  setError]  = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    getRooms()
      .then(res => setRooms(res.data))
      .catch(err => setError(err.response?.data?.msg || 'Failed to load rooms'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Private Study Rooms</h2>
        <p className="text-sm text-slate-500 mt-1">Book a room for your group (4–5 students, max 2 sessions/day)</p>
      </div>

      {rooms.length === 0
        ? <EmptyState msg="No rooms available at the moment." />
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map(room => (
              <div key={room._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 text-lg">{room.name}</h3>
                  <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-1 rounded-full">
                    {room.floor}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-4 min-h-[36px]">
                  {room.description || 'Private study room for group bookings.'}
                </p>
                <div className="space-y-1.5 mb-4">
                  {room.sessions?.map(s => (
                    <div key={s.sessionNumber} className="flex justify-between text-xs bg-slate-50 rounded-lg px-3 py-1.5">
                      <span className="font-semibold text-slate-700">{s.label || `Session ${s.sessionNumber}`}</span>
                      <span className="text-slate-500">{s.startTime} – {s.endTime}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setSelectedRoom(room)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition">
                  Book This Room
                </button>
              </div>
            ))}
          </div>
        )
      }

      {selectedRoom && (
        <RoomBookingModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
};

export default StudentRooms;