const transporter = require('./transporter');

const send = (to, subject, html) =>
  transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });

// 1. New registration submitted → notify reviewers (Sports Council or facility_admin)
const notifyReviewers = async (reviewerEmails, registration, user) => {
  const roleLabel = registration.role === 'team_captain' ? 'Team Captain' : 'Society';
  const detail = registration.role === 'team_captain'
    ? `<p><strong>Team:</strong> ${registration.teamName} &nbsp;|&nbsp; <strong>Sport:</strong> ${registration.sportName}</p>`
    : `<p><strong>Society:</strong> ${registration.societyName}</p>`;

  const html = `
    <h2>New ${roleLabel} Registration – Action Required</h2>
    <p><strong>Applicant:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    ${detail}
    <p>Please log in to review and approve or reject this registration.</p>
  `;

  for (const email of reviewerEmails) {
    await send(email, `New ${roleLabel} Registration – Action Required`, html);
  }
};

// 2. Registration approved → notify applicant
const notifyApproved = (user) => {
  const html = `
    <h2>Registration Approved</h2>
    <p>Hi ${user.name},</p>
    <p>Your registration has been <strong>approved</strong>. You can now log in and make bookings.</p>
  `;
  return send(user.email, 'Your Registration Has Been Approved', html);
};

// 3. Registration rejected → notify applicant
const notifyRejected = (user, reason) => {
  const html = `
    <h2>Registration Update</h2>
    <p>Hi ${user.name},</p>
    <p>Unfortunately, your registration has been <strong>rejected</strong>.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>If you have any questions, please contact the administration.</p>
  `;
  return send(user.email, 'Registration Status Update', html);
};

// 4. Booking confirmed → notify booker
const notifyBookingConfirmed = (user, booking, space) => {
  const html = `
    <h2>Booking Confirmed</h2>
    <p>Hi ${user.name},</p>
    <p>Your booking has been <strong>confirmed</strong>.</p>
    <p><strong>Space:</strong> ${space.name}</p>
    <p><strong>Date:</strong> ${booking.date}</p>
    <p><strong>Time:</strong> ${booking.startTime} – ${booking.endTime}</p>
    <p><strong>Purpose:</strong> ${booking.label}</p>
  `;
  return send(user.email, 'Booking Confirmed', html);
};

// 5. Booking cancelled → notify booker
const notifyBookingCancelled = (user, booking, space) => {
  const html = `
    <h2>Booking Cancelled</h2>
    <p>Hi ${user.name},</p>
    <p>Your booking has been <strong>cancelled</strong>.</p>
    <p><strong>Space:</strong> ${space.name}</p>
    <p><strong>Date:</strong> ${booking.date}</p>
    <p><strong>Time:</strong> ${booking.startTime} – ${booking.endTime}</p>
  `;
  return send(user.email, 'Booking Cancelled', html);
};

module.exports = {
  notifyReviewers,
  notifyApproved,
  notifyRejected,
  notifyBookingConfirmed,
  notifyBookingCancelled
};
