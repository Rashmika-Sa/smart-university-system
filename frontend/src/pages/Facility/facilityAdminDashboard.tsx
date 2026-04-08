import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

type BookingStatus = 'pending' | 'approved' | 'rejected';
type FilterType = 'all' | BookingStatus;

type BookingUser = {
	name?: string;
	role?: string;
};

type FacilityBooking = {
	_id: string;
	facilityName?: string;
	purpose?: string;
	date?: string;
	timeSlot?: string;
	status: BookingStatus;
	rejectionReason?: string;
	requestedBy?: BookingUser;
	user?: BookingUser;
	createdAt?: string;
};

type Facility = {
	_id: string;
	name: string;
	location?: string;
	capacity?: number;
	timeSlots?: string[];
	isActive?: boolean;
};

const statusStyles = {
	pending: 'bg-amber-100 text-amber-700 border-amber-200',
	approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
	rejected: 'bg-rose-100 text-rose-700 border-rose-200',
} as const;

const formatDate = (dateString?: string) => {
	if (!dateString) return '-';
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return dateString;
	return date.toLocaleDateString();
};

const capitalize = (value?: string) => {
	if (!value) return '-';
	return value.charAt(0).toUpperCase() + value.slice(1);
};

const normalizeTimeValue = (time?: string) => {
	if (!time) return '';
	const match = String(time).trim().match(/^(\d{1,2}):(\d{2})$/);
	if (!match) return '';
	const hour = Number(match[1]);
	const minute = Number(match[2]);
	if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
		return '';
	}
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const normalizeAmPmTime = (value?: string) => {
	if (!value) return '';
	const match = String(value)
		.trim()
		.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
	if (!match) return '';
	let hour = Number(match[1]);
	const minute = Number(match[2]);
	const period = match[3].toUpperCase();
	if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 1 || hour > 12 || minute < 0 || minute > 59) {
		return '';
	}
	if (period === 'AM' && hour === 12) hour = 0;
	if (period === 'PM' && hour !== 12) hour += 12;
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const parseSlotToRange = (slot?: unknown) => {
	if (!slot) return { start: '', end: '' };

	if (typeof slot === 'object') {
		const maybeSlot = slot as { start?: string; end?: string };
		const start = normalizeTimeValue(maybeSlot.start) || normalizeAmPmTime(maybeSlot.start);
		const end = normalizeTimeValue(maybeSlot.end) || normalizeAmPmTime(maybeSlot.end);
		return { start, end };
	}

	const slotText = String(slot).trim();
	const matches = slotText.match(/\b\d{1,2}:\d{2}\b/g) || [];
	if (matches.length >= 2) {
		return {
			start: normalizeTimeValue(matches[0]),
			end: normalizeTimeValue(matches[1]),
		};
	}

	const amPmMatches = slotText.match(/\b\d{1,2}:\d{2}\s*(?:AM|PM)\b/gi) || [];
	if (amPmMatches.length >= 2) {
		return {
			start: normalizeAmPmTime(amPmMatches[0]),
			end: normalizeAmPmTime(amPmMatches[1]),
		};
	}

	const directParts = slotText.split('-').map((part) => part.trim());
	if (directParts.length >= 2) {
		const start = normalizeTimeValue(directParts[0]) || normalizeAmPmTime(directParts[0]);
		const end = normalizeTimeValue(directParts[1]) || normalizeAmPmTime(directParts[1]);
		return { start, end };
	}

	return { start: '', end: '' };
};

const expandFacilityTimeSlots = (slots?: unknown[]) => {
	if (!Array.isArray(slots)) return [];
	if (slots.length === 1 && typeof slots[0] === 'string' && String(slots[0]).includes(',')) {
		return String(slots[0])
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}
	return slots;
};

const filterCards: Array<{ key: FilterType; label: string }> = [
	{ key: 'all', label: 'All Bookings' },
	{ key: 'pending', label: 'Requested' },
	{ key: 'approved', label: 'Approved' },
	{ key: 'rejected', label: 'Rejected' },
];

const FacilityAdminDashboard = () => {
	const navigate = useNavigate();
	const [bookings, setBookings] = useState<FacilityBooking[]>([]);
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [loading, setLoading] = useState(true);
	const [facilitiesLoading, setFacilitiesLoading] = useState(true);
	const [error, setError] = useState('');
	const [facilityError, setFacilityError] = useState('');
	const [creatingFacility, setCreatingFacility] = useState(false);
	const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [filter, setFilter] = useState<FilterType>('all');
	const [updatingId, setUpdatingId] = useState('');
	const [deletingId, setDeletingId] = useState('');
	const [userName, setUserName] = useState('Facility Manager');
	const [successMessage, setSuccessMessage] = useState('');
	const [facilityForm, setFacilityForm] = useState({
		name: '',
		location: '',
		capacity: 1,
		timeSlots: [
			{ start: '', end: '' },
			{ start: '', end: '' },
			{ start: '', end: '' },
		],
		isActive: true,
	});

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		navigate('/login');
	};

	const loadBookings = async () => {
		setLoading(true);
		setError('');

		try {
			const response = await api.get('/facilities/bookings');
			const incoming: FacilityBooking[] = Array.isArray(response.data)
				? response.data
				: response.data?.bookings || [];
			setBookings(incoming);
		} catch (err) {
			setBookings([]);
			setError('Unable to fetch facility bookings from the server.');
		} finally {
			setLoading(false);
		}
	};

	const loadFacilities = async () => {
		setFacilitiesLoading(true);
		setFacilityError('');

		try {
			const response = await api.get('/facilities');
			const incoming: Facility[] = Array.isArray(response.data)
				? response.data
				: response.data?.facilities || [];
			setFacilities(incoming);
		} catch (err) {
			setFacilities([]);
			setFacilityError('Unable to load facilities list from server.');
		} finally {
			setFacilitiesLoading(false);
		}
	};

	useEffect(() => {
		loadBookings();
		loadFacilities();
	}, []);

	useEffect(() => {
		const rawUser = localStorage.getItem('user');
		if (!rawUser) return;
		try {
			const parsed = JSON.parse(rawUser);
			if (parsed?.name) setUserName(parsed.name);
		} catch {
			setUserName('Facility Manager');
		}
	}, []);

	const filteredBookings = useMemo(() => {
		if (filter === 'all') return bookings;
		return bookings.filter((booking) => booking.status === filter);
	}, [bookings, filter]);

	const counts = useMemo(() => {
		const stats = { all: bookings.length, pending: 0, approved: 0, rejected: 0 };
		bookings.forEach((booking) => {
			if (stats[booking.status] !== undefined) {
				stats[booking.status] += 1;
			}
		});
		return stats;
	}, [bookings]);

	const updateStatus = async (bookingId: string, status: BookingStatus) => {
		setUpdatingId(bookingId);

		try {
			await api.patch(`/facilities/bookings/${bookingId}/status`, { status });
			setBookings((prev) =>
				prev.map((booking) => (booking._id === bookingId ? { ...booking, status } : booking))
			);
		} catch (err) {
			setError('Failed to update booking status. Please try again.');
		} finally {
			setUpdatingId('');
		}
	};

	const deleteBooking = async (bookingId: string) => {
		setError('');
		setDeletingId(bookingId);

		try {
			await api.delete(`/facilities/bookings/${bookingId}`);
			setBookings((prev) => prev.filter((booking) => booking._id !== bookingId));
		} catch (err) {
			setError('Failed to delete booking. Please try again.');
		} finally {
			setDeletingId('');
		}
	};

	const handleCreateFacility = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFacilityError('');
		setSuccessMessage('');

		if (!facilityForm.name.trim()) {
			setFacilityError('Facility name is required.');
			return;
		}

		const cleanedSlots = facilityForm.timeSlots
			.map((slot) => {
				const start = slot.start.trim();
				const end = slot.end.trim();
				if (!start || !end) return '';
				if (start >= end) return '';
				return `${start}-${end}`;
			})
			.filter(Boolean);

		if (cleanedSlots.length !== 3) {
			setFacilityError('Please add exactly 3 time slots.');
			return;
		}

		setCreatingFacility(true);
		try {
			const payload = {
				name: facilityForm.name.trim(),
				location: facilityForm.location.trim(),
				capacity: Number(facilityForm.capacity) > 0 ? Number(facilityForm.capacity) : 1,
				timeSlots: cleanedSlots,
				isActive: facilityForm.isActive,
			};

			if (editingFacilityId) {
				const response = await api.put(`/facilities/${editingFacilityId}`, payload);
				const updated: Facility | undefined = response.data?.facility;
				if (updated) {
					if (!Array.isArray(updated.timeSlots) || updated.timeSlots.length !== 3) {
						setFacilityError('Facility updated, but time slots were not saved correctly. Please retry.');
						return;
					}
					setFacilities((prev) => prev.map((f) => (f._id === editingFacilityId ? updated : f)));
				} else {
					await loadFacilities();
				}
				setSuccessMessage('Facility updated successfully.');
			} else {
				const response = await api.post('/facilities', payload);
				const created: Facility | undefined = response.data?.facility;

				if (created) {
					if (!Array.isArray(created.timeSlots) || created.timeSlots.length !== 3) {
						setFacilityError('Facility created, but time slots were not saved correctly. Please retry.');
						return;
					}
					setFacilities((prev) => [created, ...prev]);
				} else {
					await loadFacilities();
				}
				setSuccessMessage('Facility created successfully.');
			}

			setFacilityForm({
				name: '',
				location: '',
				capacity: 1,
				timeSlots: [
					{ start: '', end: '' },
					{ start: '', end: '' },
					{ start: '', end: '' },
				],
				isActive: true,
			});
			setEditingFacilityId(null);
			setShowCreateForm(false);
		} catch (err: any) {
			setFacilityError(err?.response?.data?.message || 'Failed to create facility.');
		} finally {
			setCreatingFacility(false);
		}
	};

	const handleEditFacility = (facility: Facility) => {
		const rawSlots = expandFacilityTimeSlots(facility.timeSlots as unknown[]);
		const parsedSlots = rawSlots.slice(0, 3).map((slot) => parseSlotToRange(slot));

		while (parsedSlots.length < 3) {
			parsedSlots.push({ start: '', end: '' });
		}

		setFacilityForm({
			name: facility.name || '',
			location: facility.location || '',
			capacity: facility.capacity || 1,
			timeSlots: parsedSlots,
			isActive: Boolean(facility.isActive),
		});
		setEditingFacilityId(facility._id);
		setShowCreateForm(true);
		setFacilityError('');
		setSuccessMessage('');
	};

	return (
		<div className="min-h-screen bg-white font-sans text-slate-800">
			<div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
				<div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-cyan-500 text-white flex items-center justify-center text-xl shadow-lg">
							🏟️
						</div>
						<div>
							<p className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Facility Command</p>
							<h1 className="text-white font-black text-xl tracking-tight">Facility Admin Dashboard</h1>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<div className="hidden sm:block text-right">
							<p className="text-xs text-slate-400">Signed in as</p>
							<p className="text-sm font-semibold text-white">{userName}</p>
						</div>
						<button
							onClick={handleLogout}
							className="text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-xl transition"
						>
							Log Out
						</button>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
				<section className="rounded-2xl border border-slate-200 shadow-sm bg-white p-5 md:p-6">
					<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
						<div>
							<p className="text-xs text-primary uppercase tracking-widest font-bold">Facilities Registry</p>
							<h2 className="text-2xl font-black text-slate-900">Manage Facilities</h2>
							<p className="text-sm text-slate-500 mt-1">Create and maintain facilities available for booking.</p>
						</div>
						<div className="flex gap-2">
							<button
								onClick={loadFacilities}
								className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
							>
								Reload
							</button>
							<button
								onClick={() => {
									setShowCreateForm((prev) => !prev);
									if (showCreateForm) {
										setEditingFacilityId(null);
									}
									setFacilityError('');
									setSuccessMessage('');
								}}
								className="px-4 py-2 text-sm font-bold rounded-xl bg-accent text-white hover:opacity-90 transition"
							>
								{showCreateForm ? 'Close Form' : 'Create Facility'}
							</button>
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
						<div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
							<p className="text-xs text-slate-500 uppercase tracking-wider">Total Facilities</p>
							<p className="text-2xl font-black text-slate-900 mt-1">{facilities.length}</p>
						</div>
						<div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
							<p className="text-xs text-slate-500 uppercase tracking-wider">Active</p>
							<p className="text-2xl font-black text-slate-900 mt-1">{facilities.filter((f) => f.isActive).length}</p>
						</div>
						<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
							<p className="text-xs text-slate-500 uppercase tracking-wider">Inactive</p>
							<p className="text-2xl font-black text-slate-900 mt-1">{facilities.filter((f) => !f.isActive).length}</p>
						</div>
						<div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
							<p className="text-xs text-slate-500 uppercase tracking-wider">Pending Requests</p>
							<p className="text-2xl font-black text-slate-900 mt-1">{counts.pending}</p>
						</div>
					</div>

					{showCreateForm && (
						<form onSubmit={handleCreateFacility} className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5">
							<div className="grid md:grid-cols-4 gap-3">
								<div className="md:col-span-2">
									<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Facility Name</label>
									<input
										type="text"
										value={facilityForm.name}
										onChange={(e) => setFacilityForm((prev) => ({ ...prev, name: e.target.value }))}
										placeholder="Ex: Indoor Court A"
										className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
									<input
										type="text"
										value={facilityForm.location}
										onChange={(e) => setFacilityForm((prev) => ({ ...prev, location: e.target.value }))}
										placeholder="Block C"
										className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Capacity</label>
									<input
										type="number"
										min={1}
										value={facilityForm.capacity}
										onChange={(e) => setFacilityForm((prev) => ({ ...prev, capacity: Number(e.target.value) || 1 }))}
										className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
									/>
								</div>
							</div>
							<div className="grid md:grid-cols-3 gap-3 mt-3">
								{[0, 1, 2].map((index) => (
									<div key={index} className="rounded-xl border border-slate-200 bg-white p-3">
										<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
											Time Slot {index + 1}
										</label>
										<div className="grid grid-cols-2 gap-2">
											<div>
												<label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Start</label>
												<input
													type="time"
													value={facilityForm.timeSlots[index].start}
													onChange={(e) => {
														const value = e.target.value;
														setFacilityForm((prev) => {
															const nextSlots = [...prev.timeSlots];
															nextSlots[index] = { ...nextSlots[index], start: value };
															return { ...prev, timeSlots: nextSlots };
														});
													}}
													className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
												/>
											</div>
											<div>
												<label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">End</label>
												<input
													type="time"
													value={facilityForm.timeSlots[index].end}
													onChange={(e) => {
														const value = e.target.value;
														setFacilityForm((prev) => {
															const nextSlots = [...prev.timeSlots];
															nextSlots[index] = { ...nextSlots[index], end: value };
															return { ...prev, timeSlots: nextSlots };
														});
													}}
													className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
												/>
											</div>
										</div>
									</div>
								))}
							</div>
							<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
								<label className="inline-flex items-center gap-2 text-sm text-slate-700">
									<input
										type="checkbox"
										checked={facilityForm.isActive}
										onChange={(e) => setFacilityForm((prev) => ({ ...prev, isActive: e.target.checked }))}
										className="rounded border-slate-300"
									/>
									Set as active
								</label>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => {
											setShowCreateForm(false);
											setEditingFacilityId(null);
										}}
										className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={creatingFacility}
										className="px-4 py-2 rounded-xl text-sm font-bold bg-accent text-white hover:opacity-90 disabled:opacity-60 transition"
									>
										{creatingFacility ? (editingFacilityId ? 'Updating...' : 'Creating...') : editingFacilityId ? 'Update Facility' : 'Save Facility'}
									</button>
								</div>
							</div>
						</form>
					)}

					{facilityError && (
						<div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
							{facilityError}
						</div>
					)}
					{successMessage && (
						<div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
							{successMessage}
						</div>
					)}

					<div className="rounded-xl border border-slate-200 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[760px]">
								<thead className="bg-slate-50">
									<tr className="text-left text-xs uppercase tracking-wider text-slate-500">
										<th className="px-4 py-3">Name</th>
										<th className="px-4 py-3">Location</th>
										<th className="px-4 py-3">Capacity</th>
										<th className="px-4 py-3">Time Slots</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3">Actions</th>
									</tr>
								</thead>
								<tbody className="bg-white">
									{facilitiesLoading && (
										<tr>
											<td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
												Loading facilities...
											</td>
										</tr>
									)}
									{!facilitiesLoading && facilities.length === 0 && (
										<tr>
											<td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
												No facilities created yet.
											</td>
										</tr>
									)}
									{!facilitiesLoading &&
										facilities.map((facility) => (
											<tr key={facility._id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50/60">
												<td className="px-4 py-3 font-semibold text-slate-900">{facility.name}</td>
												<td className="px-4 py-3">{facility.location || '-'}</td>
												<td className="px-4 py-3">{facility.capacity || 1}</td>
												<td className="px-4 py-3">
													<div className="flex flex-wrap gap-1.5">
														{(facility.timeSlots || []).length > 0 ? (
															facility.timeSlots?.map((slot, slotIndex) => (
																<span key={`${facility._id}-${slotIndex}`} className="px-2 py-1 rounded-md border border-slate-200 text-xs text-slate-600 bg-slate-50">
																	{slot}
																</span>
															))
														) : (
															<span className="text-xs text-slate-400">-</span>
														)}
													</div>
												</td>
												<td className="px-4 py-3">
													<span
														className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
															facility.isActive
																? 'bg-emerald-100 text-emerald-700 border-emerald-200'
																: 'bg-slate-100 text-slate-600 border-slate-200'
														}`}
													>
														{facility.isActive ? 'Active' : 'Inactive'}
													</span>
												</td>
												<td className="px-4 py-3">
													<button
														onClick={() => handleEditFacility(facility)}
														className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition"
													>
														Edit
													</button>
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>
				</section>

				<section className="rounded-2xl border border-slate-200 shadow-sm bg-white p-5 md:p-6">
				<div className="flex flex-wrap items-end justify-between gap-4 mb-6">
					<div>
						<p className="text-xs text-primary uppercase tracking-widest font-bold">Bookings</p>
						<h2 className="text-2xl font-black text-slate-900">Requested Facility Bookings</h2>
						<p className="text-sm text-slate-500 mt-1">
							Approve or reject requests and see requester roles clearly.
						</p>
					</div>
					<button
						onClick={loadBookings}
						className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
					>
						Refresh
					</button>
				</div>

				{error && (
					<div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 px-4 py-3 text-sm">
						{error}
					</div>
				)}

				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
					{filterCards.map((item) => (
						<button
							key={item.key}
							onClick={() => setFilter(item.key)}
							className={`rounded-xl border p-4 text-left transition ${
								{
									all: 'bg-cyan-50 border-cyan-100',
									pending: 'bg-amber-50 border-amber-100',
									approved: 'bg-emerald-50 border-emerald-100',
									rejected: 'bg-rose-50 border-rose-100',
								}[item.key]
							} ${filter === item.key ? 'ring-2 ring-slate-300 shadow-sm' : 'hover:shadow-sm'}`}
						>
							<p className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</p>
							<p className="text-2xl font-black text-slate-900 mt-1">{counts[item.key as FilterType]}</p>
						</button>
					))}
				</div>

				<div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[980px]">
							<thead className="bg-slate-50">
								<tr className="text-left text-xs uppercase tracking-wider text-slate-500">
									<th className="px-4 py-3">Facility</th>
									<th className="px-4 py-3">Date</th>
									<th className="px-4 py-3">Time</th>
									<th className="px-4 py-3">Purpose</th>
									<th className="px-4 py-3">Requested By</th>
									<th className="px-4 py-3">Role</th>
									<th className="px-4 py-3">Status</th>
									<th className="px-4 py-3">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white">
								{loading && (
									<tr>
										<td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-sm">
											Loading facility bookings...
										</td>
									</tr>
								)}

								{!loading && filteredBookings.length === 0 && (
									<tr>
										<td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-sm">
											No bookings found for this filter.
										</td>
									</tr>
								)}

								{!loading &&
									filteredBookings.map((booking) => {
										const isPending = booking.status === 'pending';
										const isUpdating = updatingId === booking._id;
										const isDeleting = deletingId === booking._id;

										return (
											<tr key={booking._id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50/60">
												<td className="px-4 py-3">
													<div className="font-semibold text-slate-900">{booking.facilityName || '-'}</div>
													<div className="text-xs text-slate-400">ID: {booking._id}</div>
												</td>
												<td className="px-4 py-3">{formatDate(booking.date || booking.createdAt)}</td>
												<td className="px-4 py-3">{booking.timeSlot || '-'}</td>
												<td className="px-4 py-3 max-w-[220px]">
													<p className="truncate" title={booking.purpose || '-'}>
														{booking.purpose || '-'}
													</p>
												</td>
												<td className="px-4 py-3">{booking.requestedBy?.name || booking.user?.name || '-'}</td>
												<td className="px-4 py-3">
													<span className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50">
														{capitalize(booking.requestedBy?.role || booking.user?.role || 'unknown')}
													</span>
												</td>
												<td className="px-4 py-3">
													<span
														className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${
															statusStyles[booking.status] || 'bg-slate-100 text-slate-700 border-slate-200'
														}`}
													>
														{capitalize(booking.status)}
													</span>
													{booking.status === 'rejected' && booking.rejectionReason && (
														<p className="text-xs text-rose-600 mt-1">{booking.rejectionReason}</p>
													)}
												</td>
												<td className="px-4 py-3">
													{isPending ? (
														<div className="flex gap-2">
															<button
																disabled={isUpdating || isDeleting}
																onClick={() => updateStatus(booking._id, 'approved')}
																className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60"
															>
																Approve
															</button>
															<button
																disabled={isUpdating || isDeleting}
																onClick={() => updateStatus(booking._id, 'rejected')}
																className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-60"
															>
																Reject
															</button>
															<button
																disabled={isUpdating || isDeleting}
																onClick={() => deleteBooking(booking._id)}
																className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60"
															>
																{isDeleting ? 'Deleting...' : 'Delete'}
															</button>
														</div>
													) : (
														<button
															disabled={isDeleting}
															onClick={() => deleteBooking(booking._id)}
															className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60"
														>
															{isDeleting ? 'Deleting...' : 'Delete'}
														</button>
													)}
												</td>
											</tr>
										);
									})}
							</tbody>
						</table>
					</div>
				</div>
				</section>
			</div>
		</div>
	);
};

export default FacilityAdminDashboard;
