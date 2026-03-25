const User = require("../../models/Auth/User");
const { Registration } = require("../models");
const { notifyReviewers } = require("../email");

// POST /api/facilities/auth/register
// Creates a new team_captain or society account (status: pending)
// and fires an email to the relevant reviewers.
const register = async (req, res) => {
  try {
    const { name, email, password, role, teamName, sportName, societyName } = req.body;
    console.log({ name, email, password, role, teamName, sportName, societyName });
    if (!["team_captain", "society"].includes(role)) {
      return res.status(400).json({ msg: "Role must be team_captain or society" });
    }

    if (role === "team_captain" && (!teamName || !sportName)) {
      return res.status(400).json({ msg: "teamName and sportName are required for Team Captains" });
    }

    if (role === "society" && !societyName) {
      return res.status(400).json({ msg: "societyName is required for Societies" });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password,
      role,
      facilityStatus: "pending",
      ...(role === "team_captain" && { teamName }),
      ...(role === "society" && { societyName }),
    });

    const registration = await Registration.create({
      user: user._id,
      role,
      ...(role === "team_captain" && { teamName, sportName }),
      ...(role === "society" && { societyName }),
    });

    // Notify: team_captain → sports_council, society → facility_admin
    const reviewerRole = role === "team_captain" ? "sports_council" : "facility_admin";
    const reviewers = await User.find({ role: reviewerRole }).select("email");
    const reviewerEmails = reviewers.map((r) => r.email);

    if (reviewerEmails.length) {
      notifyReviewers(reviewerEmails, registration, user).catch(err =>
        console.error('Failed to send reviewer notification email:', err.message)
      );
    }

    res.status(201).json({
      msg: "Your registration is under review. You will be notified once approved.",
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

module.exports = { register };
