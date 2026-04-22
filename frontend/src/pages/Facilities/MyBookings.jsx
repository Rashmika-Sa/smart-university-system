import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import FacilitiesLayout from "./FacilitiesLayout";

// ── helpers ───────────────────────────────────────────────────────────────────
const TABS = [
  { key: "pending", label: "Pending" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-green-50 text-green-700 border border-green-200",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200",
  cancelled: "bg-red-50   text-red-600   border border-red-200",
};

const fmtDate = (str) =>
  new Date(str + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ── booking row ───────────────────────────────────────────────────────────────
const BookingRow = ({ booking, onCancel }) => {
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const isUpcoming = booking.status === "confirmed" && booking.date >= new Date().toISOString().split("T")[0];

  const handleCancel = async () => {
    setCancelling(true);
    await onCancel(booking._id);
    setCancelling(false);
    setConfirming(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
      <div className="flex items-center gap-4">
        {/* icon */}
        <div className="w-10 h-10 rounded-lg bg-[#0d1b3e]/8 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-[#0d1b3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>

        {/* info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{booking.space?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {fmtDate(booking.date)} &nbsp;·&nbsp; {booking.startTime} – {booking.endTime}
          </p>
          {booking.label && <p className="text-xs text-gray-500 truncate mt-0.5">{booking.label}</p>}
        </div>

        {/* badge + cancel */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[booking.status]}`}
          >
            {booking.status}
          </span>
          {isUpcoming && !confirming && (
            <button
              onClick={() => setConfirming(true)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* inline cancel confirm */}
      {confirming && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">Cancel this booking?</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5 rounded-lg border border-gray-200"
            >
              Keep it
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs text-white bg-red-500 hover:bg-red-600 transition-colors px-3 py-1.5 rounded-lg font-semibold disabled:opacity-60"
            >
              {cancelling ? "Cancelling…" : "Yes, cancel"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ tab, onNew }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-100">
    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
    <p className="text-sm font-semibold text-gray-700">No {tab} bookings</p>
    {tab === "upcoming" && (
      <>
        <p className="text-xs text-gray-400 mt-1 mb-4">Reserve a space for your next session</p>
        <button
          onClick={onNew}
          className="px-4 py-2 rounded-lg bg-[#0d1b3e] text-white text-xs font-semibold hover:bg-[#162244] transition-colors"
        >
          Make a Booking
        </button>
      </>
    )}
  </div>
);

// ── main ──────────────────────────────────────────────────────────────────────
const MyBookings = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("pending");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`/facilities/bookings?status=${activeTab}`);
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id) => {
    try {
      await axios.delete(`/facilities/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to cancel booking");
    }
  };

  return (
    <FacilitiesLayout>
      <div className="p-8 max-w-3xl">
        {/* heading */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-[#0d1b3e]">My Bookings</h1>
            <p className="text-sm text-gray-400 mt-1">All your space reservations</p>
          </div>
          <button
            onClick={() => navigate("/facilities/bookings/new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0d1b3e] text-white text-sm font-semibold hover:bg-[#162244] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Booking
          </button>
        </div>

        {/* tabs */}
        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-100 p-1 w-fit mb-5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150
                ${activeTab === tab.key ? "bg-[#0d1b3e] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState tab={activeTab} onNew={() => navigate("/facilities/bookings/new")} />
        ) : (
          <div className="space-y-2.5">
            {bookings.map((b) => (
              <BookingRow key={b._id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </FacilitiesLayout>
  );
};

export default MyBookings;
