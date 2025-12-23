import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }

  try {
    const { emailType, data } = await req.json();
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    let subject = "";
    let html = "";
    let to = data?.recipientEmail || "";

    switch (emailType) {
      case "order_confirmation":
        subject = `Order Confirmation - ${data?.orderNumber}`;
        html = `
          <h2>Order Confirmed!</h2>
          <p>Thank you for your order, ${data?.customerName}!</p>
          <p><strong>Order Number:</strong> ${data?.orderNumber}</p>
          <p><strong>Total Amount:</strong> $${data?.totalAmount}</p>
          <p><strong>Order Date:</strong> ${new Date(data?.orderDate).toLocaleDateString()}</p>
          <h3>Items Ordered:</h3>
          <ul>
            ${data?.items?.map((item: any) => `
              <li>${item?.productName} - Qty: ${item?.quantity} - $${item?.price}</li>
            `).join('') || ''}
          </ul>
          <p>We will notify you when your order ships.</p>
        `;
        break;

      case "shipping_update":
        subject = `Shipping Update - ${data?.orderNumber}`;
        html = `
          <h2>Your Order Has Been Shipped!</h2>
          <p>Hi ${data?.customerName},</p>
          <p>Your order <strong>${data?.orderNumber}</strong> has been shipped.</p>
          <p><strong>Tracking Number:</strong> ${data?.trackingNumber}</p>
          <p><strong>Estimated Delivery:</strong> ${data?.estimatedDelivery}</p>
          <p>Track your shipment <a href="${data?.trackingUrl}">here</a>.</p>
        `;
        break;

      case "return_confirmation":
        subject = `Return Request Received - ${data?.rmaNumber}`;
        html = `
          <h2>Return Request Received</h2>
          <p>Hi ${data?.customerName},</p>
          <p>We have received your return request.</p>
          <p><strong>RMA Number:</strong> ${data?.rmaNumber}</p>
          <p><strong>Order Number:</strong> ${data?.orderNumber}</p>
          <p><strong>Return Reason:</strong> ${data?.returnReason}</p>
          <p>Your vendor will review your request and respond within 24-48 hours.</p>
        `;
        break;

      case "return_approved":
        subject = `Return Approved - ${data?.rmaNumber}`;
        html = `
          <h2>Return Request Approved</h2>
          <p>Hi ${data?.customerName},</p>
          <p>Great news! Your return request has been approved.</p>
          <p><strong>RMA Number:</strong> ${data?.rmaNumber}</p>
          <p><strong>Refund Amount:</strong> $${data?.refundAmount}</p>
          <p><strong>Refund Method:</strong> ${data?.refundMethod}</p>
          <p>Please ship the item(s) back to the vendor. Your refund will be processed upon receipt.</p>
        `;
        break;

      case "return_rejected":
        subject = `Return Request Update - ${data?.rmaNumber}`;
        html = `
          <h2>Return Request Status</h2>
          <p>Hi ${data?.customerName},</p>
          <p>We regret to inform you that your return request has been declined.</p>
          <p><strong>RMA Number:</strong> ${data?.rmaNumber}</p>
          <p><strong>Reason:</strong> ${data?.rejectionReason}</p>
          <p>If you have questions, please contact the vendor directly.</p>
        `;
        break;

      case "refund_processed":
        subject = `Refund Processed - ${data?.rmaNumber}`;
        html = `
          <h2>Refund Processed Successfully</h2>
          <p>Hi ${data?.customerName},</p>
          <p>Your refund has been processed.</p>
          <p><strong>RMA Number:</strong> ${data?.rmaNumber}</p>
          <p><strong>Refund Amount:</strong> $${data?.refundAmount}</p>
          <p>The refund will appear in your account within 3-5 business days.</p>
          <p>Thank you for shopping with us!</p>
        `;
        break;

      case "vendor_new_return":
        subject = `New Return Request - ${data?.rmaNumber}`;
        html = `
          <h2>New Return Request</h2>
          <p>You have received a new return request.</p>
          <p><strong>RMA Number:</strong> ${data?.rmaNumber}</p>
          <p><strong>Order Number:</strong> ${data?.orderNumber}</p>
          <p><strong>Customer:</strong> ${data?.customerName}</p>
          <p><strong>Return Reason:</strong> ${data?.returnReason}</p>
          <p><strong>Reason Details:</strong> ${data?.reasonDetails}</p>
          <p>Please review and respond to this request in your vendor dashboard.</p>
        `;
        break;

      case "review_request":
        subject = `We'd Love Your Feedback - ${data?.orderNumber}`;
        html = `
          <h2>How Was Your Experience?</h2>
          <p>Hi ${data?.customerName},</p>
          <p>Thank you for your recent purchase! We'd love to hear about your experience.</p>
          <p><strong>Order Number:</strong> ${data?.orderNumber}</p>
          <p>Click <a href="${data?.reviewUrl}">here</a> to leave a review and help other customers.</p>
          <p>Your feedback helps us improve and serve you better!</p>
        `;
        break;

      case "abandoned_cart":
        subject = "Don't Forget Your Items!";
        html = `
          <h2>You Left Items in Your Cart</h2>
          <p>Hi ${data?.customerName},</p>
          <p>We noticed you left some items in your cart. They're still waiting for you!</p>
          <h3>Your Cart Items:</h3>
          <ul>
            ${data?.cartItems?.map((item: any) => `
              <li>${item?.productName} - $${item?.price}</li>
            `).join('') || ''}
          </ul>
          <p><strong>Total:</strong> $${data?.cartTotal}</p>
          <p><a href="${data?.checkoutUrl}">Complete your purchase now</a></p>
          <p>These items are popular and may sell out soon!</p>
        `;
        break;

      default:
        throw new Error(`Unknown email type: ${emailType}`);
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [to],
        subject: subject,
        html: html
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify({
      success: true,
      messageId: responseData.id,
      message: "Email sent successfully"
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});