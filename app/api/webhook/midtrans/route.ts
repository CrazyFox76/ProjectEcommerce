import { NextResponse } from "next/server";
import crypto from "crypto";
// Need a supabase client with service role, or just use the RPC we created. 
// Since webhook is unauthenticated, we must use createClient from @supabase/supabase-js with anon key
// because the RPC function is SECURITY DEFINER.
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify Signature Key
    // SHA512(order_id + status_code + gross_amount + server_key)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const signaturePayload = `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`;
    
    const expectedSignature = crypto
      .createHash("sha512")
      .update(signaturePayload)
      .digest("hex");

    if (expectedSignature !== body.signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Determine status
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;
    let orderStatus = "pending";

    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        orderStatus = "pending";
      } else if (fraudStatus === "accept") {
        orderStatus = "paid";
      }
    } else if (transactionStatus === "settlement") {
      orderStatus = "paid";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      orderStatus = "failed";
    } else if (transactionStatus === "pending") {
      orderStatus = "pending";
    }

    // Initialize Supabase Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    let paymentType = body.payment_type || null;
    if (paymentType === "bank_transfer" && body.va_numbers?.[0]?.bank) {
      const bank = body.va_numbers[0].bank.toLowerCase();
      paymentType = `${bank}_va`;
    } else if (paymentType === "permata") {
      paymentType = "permata_va";
    }

    // Update order status using our secure RPC function
    const { error } = await supabase.rpc("update_order_status", {
      p_order_id: body.order_id,
      p_status: orderStatus,
      p_payment_type: paymentType,
      p_transaction_id: body.transaction_id || null,
    });

    if (error) {
      console.error("Failed to update order status:", error);
      return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
