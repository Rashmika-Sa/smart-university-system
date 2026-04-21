const Review = require('../../models/Canteen/Review');
const FoodItem = require('../../models/Canteen/FoodItem');
const User = require('../../models/Auth/User');
const jwt = require('jsonwebtoken');

const getOptionalUserFromToken = async (req) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    if (!decoded?.user?.id) return null;

    const user = await User.findById(decoded.user.id).select('role managedCanteen');
    return user || null;
  } catch {
    return null;
  }
};

const applyCanteenScopeForSubAdmin = (query, user) => {
  if (user?.role === 'canteen_admin' && user.managedCanteen) {
    query.canteen = user.managedCanteen;
  }
};

// POST /api/reviews — submit a review (authenticated student)
const submitReview = async (req, res) => {
  try {
    const { canteen, foodItemId, rating, category, comment, isAnonymous } = req.body;

    if (!canteen || !rating) {
      return res.status(400).json({ message: 'Canteen and rating are required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found.' });

    let foodItemName = null;
    if (foodItemId) {
      const item = await FoodItem.findById(foodItemId);
      if (!item) return res.status(404).json({ message: 'Food item not found.' });
      foodItemName = item.name;
    }

    // Prevent duplicate review for same canteen+foodItem by same user within 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await Review.findOne({
      author: req.user.id,
      canteen,
      foodItem: foodItemId || null,
      createdAt: { $gte: since },
    });
    if (existing) {
      return res.status(429).json({ message: 'You already reviewed this in the last 24 hours.' });
    }

    const review = await Review.create({
      canteen,
      foodItem: foodItemId || null,
      foodItemName,
      rating,
      category: category || 'general',
      comment: comment || '',
      isAnonymous: !!isAnonymous,
      author: req.user.id,
      authorName: user.name || 'Student',
    });

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/reviews — get reviews (public, filterable by canteen & foodItemId)
const getReviews = async (req, res) => {
  try {
    const { canteen, foodItemId, category, page = 1, limit = 20 } = req.query;
    const requestUser = await getOptionalUserFromToken(req);

    const query = {};
    if (canteen) query.canteen = canteen;
    if (foodItemId) query.foodItem = foodItemId;
    if (category) query.category = category;
    applyCanteenScopeForSubAdmin(query, requestUser);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Review.countDocuments(query),
    ]);

    // Mask author name if anonymous
    const sanitized = reviews.map((r) => {
      const obj = r.toObject();
      if (obj.isAnonymous) {
        obj.authorName = 'Anonymous';
        delete obj.author;
      }
      return obj;
    });

    res.json({ reviews: sanitized, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/reviews/stats — rating breakdown per canteen (or specific canteen)
const getReviewStats = async (req, res) => {
  try {
    const { canteen } = req.query;
    const requestUser = await getOptionalUserFromToken(req);
    const match = canteen ? { canteen } : {};
    applyCanteenScopeForSubAdmin(match, requestUser);

    const stats = await Review.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$canteen',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
      { $sort: { avgRating: -1 } },
    ]);

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/reviews/:id — edit own review (student) or any review (admin)
const updateReview = async (req, res) => {
  try {
    const { rating, category, comment } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });

    const isOwner = review.author.toString() === req.user.id;
    let isAdmin = ['admin', 'canteen_admin'].includes(req.user.role);

    if (req.user.role === 'canteen_admin') {
      const adminUser = await User.findById(req.user.id).select('managedCanteen');
      if (adminUser?.managedCanteen && review.canteen !== adminUser.managedCanteen) {
        isAdmin = false;
      }
    }

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorised to edit this review.' });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (category !== undefined) review.category = category;
    if (comment !== undefined) review.comment = comment;

    await review.save();
    res.json({ message: 'Review updated successfully.', review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/reviews/:id — delete own review (student) or any review (admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });

    const isOwner = review.author.toString() === req.user.id;
    let isAdmin = ['admin', 'canteen_admin'].includes(req.user.role);

    if (req.user.role === 'canteen_admin') {
      const adminUser = await User.findById(req.user.id).select('managedCanteen');
      if (adminUser?.managedCanteen && review.canteen !== adminUser.managedCanteen) {
        isAdmin = false;
      }
    }

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorised.' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/reviews/:id/reply — admin replies to a review
const replyToReview = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Reply text is required.' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });

    // Scope check for sub-admins
    if (req.user.role === 'canteen_admin') {
      const adminUser = await User.findById(req.user.id).select('managedCanteen');
      if (adminUser?.managedCanteen && review.canteen !== adminUser.managedCanteen) {
        return res.status(403).json({ message: 'Not authorised for this canteen.' });
      }
    }

    const replier = await User.findById(req.user.id).select('name');
    review.reply = {
      text: text.trim(),
      repliedBy: req.user.id,
      repliedByName: replier?.name || 'Admin',
      repliedAt: new Date(),
    };
    await review.save();

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/reviews/:id/reply — update an existing reply
const updateReply = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Reply text is required.' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (!review.reply?.text) return res.status(404).json({ message: 'No reply to update.' });

    // Scope check for sub-admins
    if (req.user.role === 'canteen_admin') {
      const adminUser = await User.findById(req.user.id).select('managedCanteen');
      if (adminUser?.managedCanteen && review.canteen !== adminUser.managedCanteen) {
        return res.status(403).json({ message: 'Not authorised for this canteen.' });
      }
    }

    // Only the original replier, admin, or canteen_admin can update
    const isOriginalReplier = review.reply.repliedBy?.toString() === req.user.id;
    const isAdmin = ['admin', 'canteen_admin'].includes(req.user.role);
    if (!isOriginalReplier && !isAdmin) {
      return res.status(403).json({ message: 'Not authorised.' });
    }

    review.reply.text = text.trim();
    review.reply.repliedAt = new Date();
    await review.save();

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/reviews/:id/reply — remove a reply
const deleteReply = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (!review.reply?.text) return res.status(404).json({ message: 'No reply to delete.' });

    // Scope check for sub-admins
    if (req.user.role === 'canteen_admin') {
      const adminUser = await User.findById(req.user.id).select('managedCanteen');
      if (adminUser?.managedCanteen && review.canteen !== adminUser.managedCanteen) {
        return res.status(403).json({ message: 'Not authorised for this canteen.' });
      }
    }

    const isOriginalReplier = review.reply.repliedBy?.toString() === req.user.id;
    const isAdmin = ['admin', 'canteen_admin'].includes(req.user.role);
    if (!isOriginalReplier && !isAdmin) {
      return res.status(403).json({ message: 'Not authorised.' });
    }

    review.reply = { text: null, repliedBy: null, repliedByName: null, repliedAt: null };
    await review.save();

    res.json({ message: 'Reply deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { submitReview, getReviews, getReviewStats, updateReview, deleteReview, replyToReview, updateReply, deleteReply };
