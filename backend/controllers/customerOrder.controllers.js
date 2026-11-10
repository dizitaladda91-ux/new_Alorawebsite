import Order from "../models/order.models.js";
import User from "../models/userAuth.models.js";
import SimpleProduct from "../models/product.models.js";

export const getMyOrders = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
    
    const user = await User.findById(req.user.id).select("email isEmailVerified").lean();
    
    const queryConditions = [{ userId: req.user.id }];
    
    if (user?.isEmailVerified && user.email && user.email.trim()) {
      const cleanEmail = user.email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      queryConditions.push({ "customer.email": new RegExp(`^${cleanEmail}$`, "i") });
    }
    
    const filter = { $or: queryConditions };

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Order.countDocuments(filter)
    ]);

    return res.status(200).json({ 
      success: true, 
      data: orders, 
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } 
    });
  } catch (error) {
    console.error("GET_MY_ORDERS_ERROR:", error);
    return res.status(500).json({ success: false, message: "Could not load your orders." });
  }
};

// Public lookup by Razorpay Order ID or Payment ID only — both are long random
// tokens (not guessable like a phone number), so an exact match on either is
// safe without also requiring a second secret like the customer's phone.
export const trackOrder = async (req, res) => {
  try {
    const rawIdentifier = req.query.orderId || req.query.trackingId || req.query.query || req.params.query || "";
    const identifier = String(rawIdentifier).trim();
    if (!/^(?:order|pay)_[A-Za-z0-9]+$/.test(identifier)) {
      return res.status(400).json({ success: false, message: "Enter a valid Razorpay Order ID or Payment ID." });
    }

    const searchConditions = [
      { razorpayOrderId: identifier },
      { razorpayPaymentId: identifier }
    ];

    const order = await Order.findOne({ $or: searchConditions })
      .select("razorpayOrderId orderStatus paymentStatus trackingNumber courierLink expectedDeliveryDate createdAt")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "No active order found matching this Tracking ID or Order ID." });
    }

    return res.status(200).json({ success: true, data: order });
  } catch {
    return res.status(500).json({ success: false, message: "Could not look up this order." });
  }
};

export const getBuyAgainProducts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email isEmailVerified").lean();
    const queryConditions = [{ userId: req.user.id }];
    
    if (user?.isEmailVerified && user.email && user.email.trim()) {
      const cleanEmail = user.email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      queryConditions.push({ "customer.email": new RegExp(`^${cleanEmail}$`, "i") });
    }

    const filter = {
      $or: queryConditions,
      paymentStatus: { $in: ["paid", "delivered", "processing", "packed", "shipped"] }
    };

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    const productMap = new Map();
    for (const order of orders) {
      for (const item of (order.items || [])) {
        const pId = String(item.productId || item.id || "").split("__")[0];
        const key = pId || item.name;
        if (key && !productMap.has(key)) {
          productMap.set(key, {
            productId: pId,
            name: item.name,
            variant: item.variant || item.size || "Standard",
            price: item.price || item.unitPrice || 0,
            image: item.image || item.imageUrl || "/static/placeholder.png",
            lastOrderedAt: order.createdAt
          });
        }
      }
    }

    const purchasedList = Array.from(productMap.values());
    const catalogProducts = await SimpleProduct.find({}).lean();
    
    const result = purchasedList.map(item => {
      const match = catalogProducts.find(p => String(p._id) === item.productId || String(p.name || "").toLowerCase() === String(item.name || "").toLowerCase());
      if (match) {
        return {
          ...match,
          lastOrderedAt: item.lastOrderedAt,
          preferredVariant: item.variant
        };
      }
      return item;
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("GET_BUY_AGAIN_ERROR:", error);
    return res.status(500).json({ success: false, message: "Could not load buy again items." });
  }
};
