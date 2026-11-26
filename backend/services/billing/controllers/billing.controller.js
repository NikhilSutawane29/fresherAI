import razorpay from "../configs/razorpay.js";
import Billing from "../models/billing.model.js";
import crypto from "crypto";
import "dotenv/config";

const PLANS = {
  starter: {
    amount: 199,
    interviewCoins: 300,
  },
};

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.headers["x-user-id"]; // we get current user-id from headers by accessing those header's name, because in "Gateway" we use "proxxyWithHeaders to access our billing service"
    const plan = PLANS[planId]; // we find Plans through planId(which we get from frontend)

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });
    }

    // we create our Order through Instance of an Razorpay
    const order = await razorpay.orders.create({
      amount: plan.amount * 100, // we multiply Rupees with 100 becasue we want amount in Paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // we create a Billing model in Database
    await Billing.create({
      userId,
      amount: plan.amount,
      interviewCoins: plan.interviewCoins,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.status(200).json({
      success: true,
      order, // we return this order because we need in Frontend
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};








// verify payment
export const verifyPayment = async (req, res) => {
  try {
    // after providing order id in frontend to verify payment we get "3" things like :-
    // we verify payment through razorpay_payment_id,razorpay_signature,
    const {
      razorpay_order_id, // we already get
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ⭐⭐ How to verify
    // s-1 we find that payment through "razorpay orderId", which we want to verify
    const payment = await Billing.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // s-2 Generate a Signature through "payment id" and "razorpay's secret key" and then we "compare" both, if "Equal = so payment successful", update status - paid
    // if payment not successful, so we update status - failed
    const genSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET) // sha256 is an algorithm in "createHmac method" which is used to verify Payment by using "secret key"
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // s-3 we "compare"
    if (genSign !== razorpay_signature) {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({
        success: false,
        message: "Payment Verification failed",
      });
    }

    // if payment status is already paid
    if (payment.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
      });
    }

    // if signature is Equal, and we update payment's Model's fields
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment Successful",
    });
  } catch (error) {
    console.log(error);

    if (req.body?.razorpay_order_id) {
      await Payment.findOneAndUpdate(
        {
          razorpayOrderId: req.body.razorpay_order_id,
        },
        {
          status: "failed", // we create a status failed becasue some Error appears in Payment
        },
      );
    }

    return res.status(500).json({
      success: false,
      message: "Payment Verification failed",
    });
  }
};
