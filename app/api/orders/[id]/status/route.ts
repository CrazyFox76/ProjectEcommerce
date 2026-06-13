import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Support both Next.js 15+ (where params is a Promise) and older versions
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    // Determine Sandbox or Production URL (auto-detect berdasarkan prefix Server Key)
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true" || (serverKey !== "" && !serverKey.startsWith("SB-"));
    
    const midtransStatusUrl = isProduction
      ? `https://api.real.midtrans.com/v2/${orderId}/status`
      : `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

    const authHeader = `Basic ${Buffer.from(serverKey + ":").toString("base64")}`;

    // Query Midtrans API directly for status
    const midtransRes = await fetch(midtransStatusUrl, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    if (!midtransRes.ok) {
      // If transaction is not found on Midtrans yet, it's safe to return pending
      return NextResponse.json({ status: "pending", message: "Transaction not found on Midtrans" });
    }

    const midtransData = await midtransRes.json();
    const transactionStatus = midtransData.transaction_status;
    const fraudStatus = midtransData.fraud_status;
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

    // Resolve specific payment type
    let paymentType = midtransData.payment_type || null;
    if (paymentType === "bank_transfer" && midtransData.va_numbers?.[0]?.bank) {
      const bank = midtransData.va_numbers[0].bank.toLowerCase();
      paymentType = `${bank}_va`;
    } else if (paymentType === "permata") {
      paymentType = "permata_va";
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update database using secure RPC function
    const { error } = await supabase.rpc("update_order_status", {
      p_order_id: orderId,
      p_status: orderStatus,
      p_payment_type: paymentType,
      p_transaction_id: midtransData.transaction_id || null,
    });

    if (error) {
      console.error("Gagal memperbarui status order di API status:", error);
      return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
    }

    return NextResponse.json({
      status: orderStatus,
      paymentType,
      transactionId: midtransData.transaction_id,
    });
  } catch (error: any) {
    console.error("Midtrans Status Check Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check transaction status" },
      { status: 500 }
    );
  }
}
