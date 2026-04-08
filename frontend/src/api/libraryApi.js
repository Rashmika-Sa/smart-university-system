import axios from './axios'; // reuse the existing axios instance with x-auth-token

// ── ROOMS ────────────────────────────────────────────────────────────────────
export const getRooms          = ()           => axios.get('/library/rooms');
export const getAllRoomsAdmin   = ()           => axios.get('/library/rooms/all');
export const createRoom        = (data)       => axios.post('/library/rooms', data);
export const updateRoom        = (id, data)   => axios.put(`/library/rooms/${id}`, data);
export const deleteRoom        = (id)         => axios.delete(`/library/rooms/${id}`);

// ── ROOM BOOKINGS ─────────────────────────────────────────────────────────────
export const getRoomAvailability  = (roomId, date, excludeId) => axios.get('/library/room-bookings/availability', { params: { roomId, date, excludeId } });
export const createRoomBooking    = (data)          => axios.post('/library/room-bookings', data);
export const updateRoomBooking    = (id, data)      => axios.put(`/library/room-bookings/${id}`, data);
export const getMyRoomBookings    = ()               => axios.get('/library/room-bookings/my');
export const cancelRoomBooking    = (id)             => axios.delete(`/library/room-bookings/${id}`);
export const getAllRoomBookings    = (filters = {})   => axios.get('/library/room-bookings', { params: filters });
export const updateRoomBookingStatus = (id, data)    => axios.patch(`/library/room-bookings/${id}/status`, data);

// ── FLOORS ───────────────────────────────────────────────────────────────────
export const getFloors         = ()           => axios.get('/library/floors');
export const getAllFloorsAdmin  = ()           => axios.get('/library/floors/all');
export const createFloor       = (data)       => axios.post('/library/floors', data);
export const updateFloor       = (id, data)   => axios.put(`/library/floors/${id}`, data);
export const deleteFloor       = (id)         => axios.delete(`/library/floors/${id}`);
export const toggleSeat        = (floorId, seatId) => axios.patch(`/library/floors/${floorId}/seats/${seatId}`);

// ── CHAIR BOOKINGS ────────────────────────────────────────────────────────────
export const getSeatsWithAvailability = (floorId, date, timeSlot) =>
  axios.get('/library/chair-bookings/seats', { params: { floorId, date, timeSlot } });
export const createChairBooking       = (data)        => axios.post('/library/chair-bookings', data);
export const getMyChairBookings       = ()             => axios.get('/library/chair-bookings/my');
export const cancelChairBooking       = (id)           => axios.delete(`/library/chair-bookings/${id}`);
export const getAllChairBookings       = (filters = {}) => axios.get('/library/chair-bookings', { params: filters });
export const updateChairBookingStatus = (id, data)     => axios.patch(`/library/chair-bookings/${id}/status`, data);

// ── BOOKS ─────────────────────────────────────────────────────────────────────
export const getBooks        = (params = {}) => axios.get('/library/books', { params });
export const getAllBooksAdmin = ()            => axios.get('/library/books/all');
export const getBook         = (id)          => axios.get(`/library/books/${id}`);
export const createBook      = (data)        => axios.post('/library/books', data);
export const updateBook      = (id, data)    => axios.put(`/library/books/${id}`, data);
export const deleteBook      = (id)          => axios.delete(`/library/books/${id}`);

// ── CART ──────────────────────────────────────────────────────────────────────
export const getCart         = ()      => axios.get('/library/cart');
export const addToCart       = (bookId)=> axios.post('/library/cart/add', { bookId });
export const removeFromCart  = (bookId)=> axios.delete(`/library/cart/remove/${bookId}`);
export const clearCart       = ()      => axios.delete('/library/cart/clear');

// ── BOOK BOOKINGS ─────────────────────────────────────────────────────────────
export const createBookBooking       = (data)        => axios.post('/library/book-bookings', data);
export const getMyBookBookings       = ()             => axios.get('/library/book-bookings/my');
export const cancelBookBooking       = (id)           => axios.delete(`/library/book-bookings/${id}`);
export const getAllBookBookings       = (filters = {}) => axios.get('/library/book-bookings', { params: filters });
export const updateBookBookingStatus = (id, data)     => axios.patch(`/library/book-bookings/${id}/status`, data);