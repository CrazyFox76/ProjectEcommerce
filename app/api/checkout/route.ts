import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { orderId, amount, customerDetails, items } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    // Tentukan URL Sandbox atau Production (auto-detect berdasarkan prefix Server Key)
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true" || (serverKey !== "" && !serverKey.startsWith("SB-"));
    const midtransUrl = isProduction
      ? "https://app.real.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    // Buat Auth Header (Basic Auth Base64 dari Server Key + ":")
    const authHeader = `Basic ${Buffer.from(serverKey + ":").toString("base64")}`;

    // Tembak langsung ke API Midtrans
    const midtransRes = await fetch(midtransUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        customer_details: customerDetails,
        item_details: items,
      }),
    });

    const midtransData = await midtransRes.json();

    if (!midtransRes.ok) {
      console.error("Midtrans API Error Response:", midtransData);
      const errMsg = midtransData.error_messages
        ? midtransData.error_messages.join(", ")
        : "Failed to create transaction with Midtrans";
      return NextResponse.json({ error: errMsg }, { status: midtransRes.status });
    }

    const snapToken = midtransData.token;

    // Simpan snap token ke database
    const supabase = await createClient();
    const { error: rpcError } = await supabase.rpc("update_order_snap_token", {
      p_order_id: orderId,
      p_snap_token: snapToken,
    });

    if (rpcError) {
      console.error("Gagal menyimpan snap token ke Supabase:", rpcError.message);
      // Tetap lanjutkan karena snap token berhasil didapat dari Midtrans
    }

    return NextResponse.json({ snapToken });
  } catch (error: any) {
    console.error("Midtrans Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 }
    );
  }
}
