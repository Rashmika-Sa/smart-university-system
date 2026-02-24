const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/Order/orderController');

// @route   POST /api/orders/create
// @desc    Create a new pre-order (Pending Status)
router.post('/create', orderController.createOrder);

// @route   GET /api/orders/my-orders/:userId
// @desc    Get order history for a specific student
router.get('/my-orders/:userId', orderController.getUserOrders);

// @route   GET /api/orders/canteen/:canteenName
// @desc    Get all orders for a specific Canteen (Admin View)
router.get('/canteen/:canteenName', orderController.getCanteenOrders);

// @route   PUT /api/orders/update-status/:orderId
// @desc    Update Order Status (Preparing -> Ready -> Completed)
router.put('/update-status/:orderId', orderController.updateOrderStatus);

// @route   PUT /api/orders/approve/:orderId
// @desc    Approve a pending order and email the student
router.put('/approve/:orderId', orderController.approveOrder);

// @route   PUT /api/orders/cancel/:orderId
// @desc    Student cancels an order (enforces 5 PM deadline)
router.put('/cancel/:orderId', orderController.cancelOrder);

// NEW: @route   PUT /api/orders/admin-cancel/:orderId
// @desc    Canteen Admin cancels an order and emails the student
router.put('/admin-cancel/:orderId', orderController.adminCancelOrder);

module.exports = router;