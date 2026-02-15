// 👇 Notice the path: Up 2 levels -> models -> Canteen -> FoodItem
const FoodItem = require('../../models/Canteen/FoodItem');
const User = require('../../models/Auth/User');

// @desc    Get all food items (Menu)
// @route   GET /api/canteen/menu
// @access  Public (but respects canteen_admin restrictions if authenticated)
const getMenu = async (req, res) => {
  try {
    const { canteen } = req.query; // Get canteen from URL params
    
    // 🔒 Check if user is authenticated as a canteen_admin (sub admin)
    let userDetails = null;
    if (req.userDetails) {
      userDetails = req.userDetails;
    } else if (req.user) {
      // Fetch user details if user is in request but userDetails not set
      const User = require('../../models/Auth/User');
      userDetails = await User.findById(req.user.id);
    }

    // If authenticated user is a sub admin (specific canteen), restrict access
    if (userDetails && userDetails.role === 'canteen_admin' && userDetails.managedCanteen) {
      if (canteen && canteen !== userDetails.managedCanteen) {
        return res.status(403).json({ 
          message: `You can only view items from '${userDetails.managedCanteen}' canteen` 
        });
      }
      // If no canteen specified, show their managed canteen
      const items = await FoodItem.find({ canteen: userDetails.managedCanteen }).sort({ createdAt: -1 });
      return res.status(200).json(items);
    }

    // For public access or super admin, fetch normally
    let query = {};
    if (canteen) {
      query.canteen = canteen;
    }

    const items = await FoodItem.find(query).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new food item
// @route   POST /api/canteen/add
// @access  Canteen Admin
const addFoodItem = async (req, res) => {
  const { name, price, category, canteen, image, isAvailable } = req.body;

  try {
    if (!name || !price || !category || !canteen) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Check canteen permission for canteen_admin
    if (req.userDetails && req.userDetails.role === 'canteen_admin' && req.userDetails.managedCanteen) {
      if (canteen !== req.userDetails.managedCanteen) {
        return res.status(403).json({ 
          message: `You can only add items to '${req.userDetails.managedCanteen}' canteen` 
        });
      }
    }

    const newItem = await FoodItem.create({
      name,
      price,
      category,
      canteen,
      image,
      isAvailable,
      createdBy: req.user?.id
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a food item
// @route   DELETE /api/canteen/delete/:id
// @access  Canteen Admin
const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await FoodItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check canteen permission for canteen_admin
    if (req.userDetails && req.userDetails.role === 'canteen_admin' && req.userDetails.managedCanteen) {
      if (item.canteen !== req.userDetails.managedCanteen) {
        return res.status(403).json({ 
          message: `You can only delete items from '${req.userDetails.managedCanteen}' canteen` 
        });
      }
    }

    const deletedItem = await FoodItem.findByIdAndDelete(id);

    res.status(200).json({ message: 'Item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Availability
// @route   PUT /api/canteen/update/:id
// @access  Canteen Admin
const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const item = await FoodItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check canteen permission for canteen_admin
    if (req.userDetails && req.userDetails.role === 'canteen_admin' && req.userDetails.managedCanteen) {
      if (item.canteen !== req.userDetails.managedCanteen) {
        return res.status(403).json({ 
          message: `You can only update items from '${req.userDetails.managedCanteen}' canteen` 
        });
      }
    }

    const updatedItem = await FoodItem.findByIdAndUpdate(
      id, 
      { isAvailable }, 
      { new: true }
    );

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update food item details
// @route   PUT /api/canteen/edit/:id
// @access  Canteen Admin
const updateFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, image } = req.body;

    const item = await FoodItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check canteen permission for canteen_admin
    if (req.userDetails && req.userDetails.role === 'canteen_admin' && req.userDetails.managedCanteen) {
      if (item.canteen !== req.userDetails.managedCanteen) {
        return res.status(403).json({ 
          message: `You can only edit items from '${req.userDetails.managedCanteen}' canteen` 
        });
      }
    }

    const updatedItem = await FoodItem.findByIdAndUpdate(
      id,
      { name, price, category, image },
      { new: true }
    );

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all canteens (for super admin)
// @route   GET /api/canteen/all-canteens
// @access  Canteen Admin (super only)
const getAllCanteens = async (req, res) => {
  try {
    // Check if user is super admin (canteen_admin with no managedCanteen)
    if (req.userDetails.role !== 'canteen_admin' || req.userDetails.managedCanteen) {
      return res.status(403).json({ 
        message: 'Only super admin can view all canteens' 
      });
    }

    const canteens = ['Main Canteen', 'Birdnest Canteen', 'Perera & Sons (P&S)', 'Barista'];
    res.status(200).json(canteens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get accessible canteens for logged-in user
// @route   GET /api/canteen/accessible-canteens
// @access  Canteen Admin
const getAccessibleCanteens = async (req, res) => {
  try {
    if (!req.userDetails) {
      return res.status(400).json({ 
        message: 'User details not found' 
      });
    }

    // If sub admin (has managedCanteen), return only their canteen
    if (req.userDetails.managedCanteen) {
      return res.status(200).json([req.userDetails.managedCanteen]);
    }

    // If super admin (no managedCanteen), return all canteens
    const allCanteens = ['Main Canteen', 'Birdnest Canteen', 'Perera & Sons (P&S)', 'Barista'];
    res.status(200).json(allCanteens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMenu,
  addFoodItem,
  deleteFoodItem,
  updateAvailability,
  updateFoodItem,
  getAllCanteens,
  getAccessibleCanteens
};