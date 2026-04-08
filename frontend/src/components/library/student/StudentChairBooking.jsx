import React, { useState, useEffect } from 'react';
import { getFloors, getSeatsWithAvailability, createChairBooking } from '../../../api/libraryApi';
import { Spinner, EmptyState } from '../LibraryUI';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
  { id: 'morning',   label: 'Morning',   time: '08:00 AM – 12:00 PM' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM – 04:00 PM' },
  { id: 'evening',   label: 'Evening',   time: '04:00 PM – 08:00 PM' },
];

const StudentChairBooking = () => {
  const [floors,       setFloors]       = useState([]);
  const [seats,        setSeats]        = useState([]);
  const [floorId,      setFloorId]      = useState('');
  const [date,         setDate]         = useState('');
  const [timeSlot,     setTimeSlot]     = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [seatsLoading, setSeatsLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    getFloors().then(res => setFloors(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!floorId || !date || !timeSlot) return;
    setSeatsLoading(true);
    setSelectedSeat(null);
    getSeatsWithAvailability(floorId, date, timeSlot)
      .then(res => setSeats(res.data.seats))
      .catch(() => {})
      .finally(() => setSeatsLoading(false));
  }, [floorId, date, timeSlot]);

  const handleBook = async () => {
    if (!selectedSeat) return toast.error('Please select a seat');
    setLoading(true);
    try {
      await createChairBooking({ seatId: selectedSeat, date, timeSlot });
      toast.success('Seat booked! Awaiting admin confirmation.');
      // Refresh seat map
      const res = await getSeatsWithAvailability(floorId, date, timeSlot);
      setSeats(res.data.seats);
      setSelectedSeat(null);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const readyToShow = floorId && date && timeSlot;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Chair / Seat Booking</h2>
        <p className="text-sm text-slate-500 mt-1">Select a floor, date, and time slot to see available seats</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Floor</label>
            <select value={floorId} onChange={e => setFloorId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select Floor</option>
              {floors.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
            <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Time Slot</label>
            <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select Slot</option>
              {TIME_SLOTS.map(s => <option key={s.id} value={s.id}>{s.label} ({s.time})</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      {readyToShow && (
        <div className="flex flex-wrap gap-4 mb-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-green-100 border border-green-300 inline-block"/>Available</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-red-100 border border-red-300 inline-block"/>Booked</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-indigo-600 inline-block"/>Selected</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300 inline-block"/>Mine</span>
        </div>
      )}

      {/* Seat Map */}
      {seatsLoading && <Spinner />}

      {readyToShow && !seatsLoading && seats.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
          <div className="grid grid-cols-10 gap-1.5">
            {seats.map(seat => (
              <button key={seat._id} disabled={seat.isBooked}
                onClick={() => !seat.isBooked && setSelectedSeat(seat._id)}
                onDoubleClick={() => !seat.isBooked && selectedSeat === seat._id && setSelectedSeat(null)}
                title={`Seat ${seat.seatNumber}`}
                className={`w-full aspect-square rounded text-xs font-bold transition
                  ${seat.isBooked    ? 'bg-red-100 text-red-400 cursor-not-allowed border border-red-200'
                  : seat.isMine      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : selectedSeat === seat._id ? 'bg-indigo-600 text-white border border-indigo-600'
                                     : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'}`}
              >
                {seat.seatNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Button */}
      {selectedSeat && (
        <div className="flex items-center gap-4 bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
          <p className="text-sm text-indigo-700 font-semibold flex-1">
            Seat #{seats.find(s => s._id === selectedSeat)?.seatNumber} selected for {timeSlot}
          </p>
          <button onClick={handleBook} disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      )}

      {!readyToShow && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">💺</p>
          <p className="font-semibold">Select a floor, date and time slot to view seats</p>
        </div>
      )}
    </div>
  );
};

export default StudentChairBooking;