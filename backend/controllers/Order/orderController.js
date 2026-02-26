const Order = require('../../models/Order/order'); 
const User = require('../../models/Auth/User');
const nodemailer = require('nodemailer');

// CONFIG: Email Transporter 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com', 
  port: 465,              
  secure: true,           
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4, 
  tls: {
    rejectUnauthorized: false
  }
});

// HELPER: Send Email Function 
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"Campus Canteen" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: text, 
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if ((info.rejected && info.rejected.length > 0) || (info.pending && info.pending.length > 0)) {
      throw new Error(`Email was not accepted for delivery to ${to}. Rejected: ${(info.rejected || []).join(', ')}`);
    }
    console.log(`✅ Email sent successfully to ${to}`);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

// --- HELPER: Time Police ---
const isOrderValid = (targetDate) => {
    const now = new Date();
    const orderDate = new Date(targetDate);
    
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const orderMidnight = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());

    const diffTime = orderMidnight - todayMidnight;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return { valid: false, message: "You cannot order for today. You must pre-order at least one day in advance." };
    }

    if (diffDays === 1 && now.getHours() >= 17) {
        return { valid: false, message: "Deadline passed. Orders for tomorrow must be placed before 5:00 PM today." };
    }

    return { valid: true };
};

// 1. Create New Pre-Order (Pending Status) 
exports.createOrder = async (req, res) => {
  try {
    const { 
      items, 
      totalAmount, 
      canteen, 
      user: userId, 
      paymentMethod,
      preOrderDate,
      remarks // <--- ADDED REMARKS HERE
    } = req.body;

    const formattedItems = items.map(item => ({
        foodItem: item.foodId,     
        quantity: item.qty || 1,   
        price: item.price          
    }));

    if (!preOrderDate) {
        return res.status(400).json({ message: "A pre-order date is required." });
    }

    const timeCheck = isOrderValid(preOrderDate);
    if (!timeCheck.valid) {
        return res.status(400).json({ message: timeCheck.message });
    }

    const studentUser = await User.findById(userId);
    if (!studentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the Order in PENDING status
    const newOrder = new Order({
      items: formattedItems, 
      totalAmount,
      canteen,
      paymentMethod: paymentMethod || 'Pre-order',
      user: userId,
      preOrderDate: new Date(preOrderDate),
      remarks: remarks || '', // <--- SAVE REMARKS TO DB
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();
  
    // Send email to canteen admin
    const canteenEmail = canteen.toLowerCase().replace(/\s/g, '') + '@sliit.lk'; 
    sendEmail(
      canteenEmail,
      '📢 New Pre-Order Requires Approval!',
      `You have a new pre-order from ${studentUser.name} for ${new Date(preOrderDate).toDateString()}.\nItems: ${items.length}\nTotal: LKR ${totalAmount}\nRemarks: ${remarks || 'None'}\n\nPlease log into the dashboard to approve or reject this order.`
    );

    // NEW: Send email to the STUDENT confirming the order was placed
    if (studentUser.email) {
      sendEmail(
        studentUser.email,
        `⏳ Order Received - ${canteen}`,
        `Hello ${studentUser.name},\n\nYour pre-order at ${canteen} for ${new Date(preOrderDate).toDateString()} has been sent to the canteen for approval.\n\nTotal: LKR ${totalAmount}\nRemarks: ${remarks || 'None'}\n\nWe will email you again once the canteen approves it!`
      );
    }

    res.status(201).json({ 
      success: true, 
      order: savedOrder, 
      message: 'Order added to waiting list. Awaiting canteen approval.' 
    });

  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Server Error during Checkout' });
  }
};

// ADMIN ONLY: Approve Order & Email Student
exports.approveOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'Pending') {
            return res.status(400).json({ message: `Cannot approve order. Current status is ${order.status}` });
        }

        order.status = 'Approved';
        await order.save();

        await sendEmail(
            order.user.email,
            '✅ Pre-Order Approved!',
            `Hello ${order.user.name},\n\nGreat news! Your pre-order for ${new Date(order.preOrderDate).toDateString()} at ${order.canteen} has been APPROVED.\n\nTotal: LKR ${order.totalAmount}\n\nWe will have it ready for you on that day!`
        );

        res.json({ success: true, message: 'Order approved and student notified.', order });

    } catch (error) {
        console.error('Error approving order:', error);
        res.status(500).json({ message: 'Server Error during Approval' });
    }
};

// 3. Get Orders for a Specific Student 
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 4. Get Orders for a Canteen (Admin View) 
exports.getCanteenOrders = async (req, res) => {
  try {
    const { canteenName } = req.params;
    const orders = await Order.find({ canteen: canteenName })
      .populate('user', 'name email universityId')
      .sort({ preOrderDate: 1 }); 
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 5. STUDENT ONLY: Cancel Order (Must be before 5 PM deadline)
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const timeCheck = isOrderValid(order.preOrderDate);
        if (!timeCheck.valid) {
            return res.status(400).json({ message: "It is too late to cancel this order. The 5:00 PM deadline has passed." });
        }

        order.status = 'Cancelled';
        await order.save();

        res.json({ success: true, message: 'Order successfully cancelled.', order });

    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Server Error during cancellation' });
    }
}

// ADMIN ONLY - Cancel Order & Email Student
exports.adminCancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body; // Canteen admin can optionally provide a reason
        
        const order = await Order.findById(orderId).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = 'Cancelled';
        await order.save();

        let emailSent = false;
        let emailError = null;

        // Email the student letting them know the canteen cancelled it
        if (order.user && order.user.email) {
            const cancellationReason = reason ? `\n\nReason from canteen: "${reason}"` : '';
          try {
            await sendEmail(
              order.user.email,
              '❌ Order Cancelled by Canteen',
              `Hello ${order.user.name},\n\nUnfortunately, your pre-order at ${order.canteen} for ${new Date(order.preOrderDate).toDateString()} has been CANCELLED by the canteen administration.${cancellationReason}\n\nPlease contact the canteen directly if you have any questions.`
            );
            emailSent = true;
          } catch (mailError) {
            emailError = mailError.message;
          }
        }

        const message = emailSent
          ? 'Order cancelled by admin and student notified.'
          : 'Order cancelled by admin, but email notification failed.';

        res.json({ success: true, emailSent, emailError, message, order });

    } catch (error) {
        console.error('Error admin cancelling order:', error);
        res.status(500).json({ message: 'Server Error during admin cancellation' });
    }
};

// ADMIN ONLY: Generic Order Status Update
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params; 
        const { status } = req.body; 

        const order = await Order.findByIdAndUpdate(
            orderId, 
            { status: status }, 
            { returnDocument: 'after', runValidators: false } 
        ).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (status === 'Ready' && order.user?.email) {
            await sendEmail(
                order.user.email,
                '🍛 Your Order is Ready!',
                `Hello ${order.user.name},\n\nYour pre-order at ${order.canteen} is ready for pickup!\n\nSee you soon!`
            );
        }

        res.json({ success: true, message: `Order status updated to ${status}`, order });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server Error during status update' });
    }
};