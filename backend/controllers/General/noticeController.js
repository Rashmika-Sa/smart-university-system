const Notice = require('../../models/General/Notice');
const User = require('../../models/Auth/User');

const ADMIN_ROLES = ['admin', 'canteen_admin', 'academic_admin', 'shuttle_admin', 'facility_admin'];

const isSuperAdmin = (user) => {
  // Main admin role or canteen super admin (no specific canteen assigned)
  return user.role === 'admin' || (user.role === 'canteen_admin' && !user.managedCanteen);
};

const getNotices = async (req, res) => {
  try {
    const { includeUnpublished = 'false', audience = 'students', limit = 10 } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const query = {};
    if (includeUnpublished !== 'true') {
      query.isPublished = true;
    }

    if (audience && audience !== 'all') {
      query.$or = [{ targetAudience: 'all' }, { targetAudience: audience }];
    }

    // Sub-admins only see their own notices
    if (req.user && ADMIN_ROLES.includes(req.user.role)) {
      const user = await User.findById(req.user.id);
      if (user && !isSuperAdmin(user)) {
        query.postedBy = user._id;
      }
    }

    const notices = await Notice.find(query)
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .lean();

    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notices.' });
  }
};

const createNotice = async (req, res) => {
  try {
    const { title, content, priority = 'normal', targetAudience = 'students', isPublished = true } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!ADMIN_ROLES.includes(user.role)) {
      return res.status(403).json({ message: 'Only admins can create notices.' });
    }

    const notice = await Notice.create({
      title,
      content,
      priority,
      targetAudience,
      isPublished,
      postedBy: user._id,
      postedByName: user.name || 'Admin'
    });

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notice.' });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, priority, targetAudience, isPublished } = req.body;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    // Sub-admins can only edit their own notices
    const user = await User.findById(req.user.id);
    if (user && !isSuperAdmin(user) && notice.postedBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own notices.' });
    }

    notice.title = title ?? notice.title;
    notice.content = content ?? notice.content;
    notice.priority = priority ?? notice.priority;
    notice.targetAudience = targetAudience ?? notice.targetAudience;
    if (typeof isPublished === 'boolean') {
      notice.isPublished = isPublished;
    }

    const updated = await notice.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notice.' });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    // Sub-admins can only delete their own notices
    const user = await User.findById(req.user.id);
    if (user && !isSuperAdmin(user) && notice.postedBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own notices.' });
    }

    await notice.deleteOne();
    res.json({ message: 'Notice deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notice.' });
  }
};

module.exports = {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice
};
