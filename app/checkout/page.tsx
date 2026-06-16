"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/context/cart-context";
import { useAuth } from "@/lib/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Image from "next/image";
import Script from "next/script";
import { toast } from "sonner";
import {
  MapPin,
  Package,
  Check,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, loading: cartLoading } = useCart();
  const { isLoggedIn, supabaseUser, displayEmail, displayName, user } = useAuth();
  const router = useRouter();
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Region dropdown state variables
  const [provincesList, setProvincesList] = useState<{ id: string; name: string }[]>([]);
  const [citiesList, setCitiesList] = useState<{ id: string; name: string }[]>([]);
  const [districtsList, setDistrictsList] = useState<{ id: string; name: string }[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Helper to convert UPPERCASE administrative names to beautiful Title Case
  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
        if (res.ok) {
          const data = await res.json();
          setProvincesList(data);
        } else {
          toast.error("Gagal mengambil data provinsi");
        }
      } catch (err) {
        console.error("Gagal mengambil data provinsi", err);
        toast.error("Gangguan koneksi ke data wilayah");
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch cities when province selection changes
  useEffect(() => {
    if (!selectedProvinceId) {
      setCitiesList([]);
      setCity("");
      setSelectedCityId("");
      setDistrictsList([]);
      setDistrict("");
      setSelectedDistrictId("");
      return;
    }

    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvinceId}.json`);
        if (res.ok) {
          const data = await res.json();
          setCitiesList(data);
        } else {
          toast.error("Gagal mengambil data kota/kabupaten");
        }
      } catch (err) {
        console.error("Gagal mengambil data kota", err);
        toast.error("Gangguan koneksi ke data kota/kabupaten");
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedProvinceId, setCity, setDistrict]);

  // Fetch districts when city selection changes
  useEffect(() => {
    if (!selectedCityId) {
      setDistrictsList([]);
      setDistrict("");
      setSelectedDistrictId("");
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedCityId}.json`);
        if (res.ok) {
          const data = await res.json();
          setDistrictsList(data);
        } else {
          toast.error("Gagal mengambil data kecamatan");
        }
      } catch (err) {
        console.error("Gagal mengambil data kecamatan", err);
        toast.error("Gangguan koneksi ke data kecamatan");
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [selectedCityId, setDistrict]);

  const handleProvinceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedProvinceId(id);
    const found = provincesList.find((p) => p.id === id);
    setProvince(found ? toTitleCase(found.name) : "");
    // Reset city and district
    setSelectedCityId("");
    setCity("");
    setDistrictsList([]);
    setDistrict("");
    setSelectedDistrictId("");
  };

  const handleCityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCityId(id);
    const found = citiesList.find((c) => c.id === id);
    setCity(found ? toTitleCase(found.name) : "");
    // Reset district
    setDistrict("");
    setSelectedDistrictId("");
  };

  const handleDistrictChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedDistrictId(id);
    const found = districtsList.find((d) => d.id === id);
    setDistrict(found ? toTitleCase(found.name) : "");
  };

  useEffect(() => {
    if (isLoggedIn) {
      setRecipientName(prev => prev || displayName || "");
    }
  }, [isLoggedIn, displayName]);

  const handleCheckout = async () => {
    if (!isLoggedIn || !supabaseUser) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }

    if (!recipientName.trim()) {
      toast.error("Nama penerima wajib diisi");
      return;
    }

    if (!phone.trim()) {
      toast.error("Nomor telepon wajib diisi");
      return;
    }

    if (!province.trim()) {
      toast.error("Provinsi wajib diisi");
      return;
    }

    if (!city.trim()) {
      toast.error("Kota/Kabupaten wajib diisi");
      return;
    }

    if (!district.trim()) {
      toast.error("Kecamatan wajib diisi");
      return;
    }

    if (!postalCode.trim()) {
      toast.error("Kode pos wajib diisi");
      return;
    }

    if (postalCode.trim().length !== 5 || isNaN(Number(postalCode.trim()))) {
      toast.error("Kode pos harus berupa 5 digit angka");
      return;
    }

    if (!streetAddress.trim()) {
      toast.error("Alamat lengkap wajib diisi");
      return;
    }

    if (items.length === 0) {
      toast.error("Keranjang belanja kosong");
      return;
    }

    const fullAddress = `Penerima: ${recipientName.trim()} (${phone.trim()})
${streetAddress.trim()}
Kec. ${district.trim()}, Kota/Kab. ${city.trim()}
Provinsi ${province.trim()} - Kode Pos ${postalCode.trim()}
${notes.trim() ? `Catatan: ${notes.trim()}` : ""}`.trim();

    setLoading(true);

    try {
      const supabase = createClient();

      // Upsert the user profile just in case it's missing to avoid FK constraint error
      if (!user && supabaseUser) {
        const uniqueEmail = displayEmail ? `${supabaseUser.id}-${displayEmail}` : `${supabaseUser.id}@guest.com`;
        const { error: insertError } = await supabase.from("users").insert({
          id: supabaseUser.id,
          name: displayName || "Pelanggan",
          email: uniqueEmail,
          role: "user"
        });
        if (insertError) {
          console.error("Failed to insert user profile directly, attempting auth trigger fallback:", insertError);
          // Try to update auth.users to trigger any 'ON UPDATE' Postgres trigger
          await supabase.auth.updateUser({
            data: { force_sync: Date.now() }
          });
          // Wait a moment for the trigger to potentially complete
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Create order
      const orderNumber = `TRX-${Date.now()}`;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: supabaseUser.id,
          order_number: orderNumber,
          total_price: totalPrice,
          status: "pending",
          shipping_address: fullAddress,
          payment_method: "Midtrans",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Call API to get Snap Token
      const midtransItems = items.map(item => ({
        id: item.product_id,
        price: item.product.price,
        quantity: item.quantity,
        name: item.product.name.substring(0, 50)
      }));

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: totalPrice,
          customerDetails: {
            first_name: recipientName.trim(),
            email: displayEmail || "guest@tamimsparepart.com",
            phone: phone.trim(),
            billing_address: {
              first_name: recipientName.trim(),
              phone: phone.trim(),
              address: streetAddress.trim(),
              city: city.trim(),
              postal_code: postalCode.trim(),
              country_code: "IDN",
            },
            shipping_address: {
              first_name: recipientName.trim(),
              phone: phone.trim(),
              address: `${streetAddress.trim()}, Kec. ${district.trim()}`,
              city: city.trim(),
              postal_code: postalCode.trim(),
              country_code: "IDN",
            },
          },
          items: midtransItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const snapToken = data.snapToken;

      if (!(window as any).snap) {
        toast.error("Sistem pembayaran sedang bersiap. Mohon tunggu sesaat...");
        setLoading(false);
        return;
      }

      // @ts-ignore
      window.snap.pay(snapToken, {
        onSuccess: async function (result: any) {
          toast.success("Pembayaran berhasil!");
          
          try {
            let paymentType = result?.payment_type || null;
            if (paymentType === "bank_transfer" && result?.va_numbers?.[0]?.bank) {
              const bank = result.va_numbers[0].bank.toLowerCase();
              paymentType = `${bank}_va`;
            } else if (paymentType === "permata") {
              paymentType = "permata_va";
            }

            // Gunakan Promise.race dengan timeout 2 detik agar tidak memblokir redirect jika jaringan lambat
            const updatePromise = supabase.rpc("update_order_status", {
              p_order_id: order.id,
              p_status: "paid",
              p_payment_type: paymentType,
              p_transaction_id: result?.transaction_id || null,
            });
            const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
            await Promise.race([updatePromise, timeoutPromise]);
          } catch (updateErr) {
            console.error("Gagal memperbarui status order di frontend:", updateErr);
          }

          try {
            await clearCart();
          } catch (err) {
            console.error("Failed to clear cart:", err);
          }
          
          router.push(`/checkout/success?order_id=${order.id}&status=success`);
        },
        onPending: async function (result: any) {
          toast.success("Menunggu pembayaran Anda!");

          try {
            let paymentType = result?.payment_type || null;
            if (paymentType === "bank_transfer" && result?.va_numbers?.[0]?.bank) {
              const bank = result.va_numbers[0].bank.toLowerCase();
              paymentType = `${bank}_va`;
            } else if (paymentType === "permata") {
              paymentType = "permata_va";
            }

            // Promise.race agar tidak memblokir redirect
            const updatePromise = supabase.rpc("update_order_status", {
              p_order_id: order.id,
              p_status: "pending",
              p_payment_type: paymentType,
              p_transaction_id: result?.transaction_id || null,
            });
            const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
            await Promise.race([updatePromise, timeoutPromise]);
          } catch (updateErr) {
            console.error("Gagal memperbarui status order di frontend:", updateErr);
          }

          try {
            await clearCart();
          } catch (err) {
            console.error("Failed to clear cart:", err);
          }
          
          router.push(`/checkout/success?order_id=${order.id}&status=pending`);
        },
        onError: function (result: any) {
          toast.error("Pembayaran gagal!");
          setLoading(false);
        },
        onClose: function () {
          toast.info("Anda menutup popup sebelum menyelesaikan pembayaran");
          setLoading(false);
        }
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      let message = error.message || "Gagal membuat pesanan";
      if (message.includes("violates foreign key constraint")) {
        message = "Akun belum sinkron dengan database. Silakan logout dan login kembali untuk menyelesaikan.";
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };




  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-gray-500">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Tidak ada item untuk checkout
          </h2>
          <Button onClick={() => router.push("/catalog")}>
            Belanja Sekarang
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Alamat Pengiriman
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Penerima"
                  placeholder="Nama lengkap penerima"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />
                <Input
                  label="Nomor Telepon"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Provinsi"
                  value={selectedProvinceId}
                  onChange={handleProvinceChange}
                  required
                  disabled={loadingProvinces}
                >
                  <option value="">
                    {loadingProvinces ? "Memuat Provinsi..." : "Pilih Provinsi"}
                  </option>
                  {provincesList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {toTitleCase(p.name)}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Kota / Kabupaten"
                  value={selectedCityId}
                  onChange={handleCityChange}
                  required
                  disabled={loadingCities || !selectedProvinceId}
                >
                  <option value="">
                    {loadingCities
                      ? "Memuat Kota/Kabupaten..."
                      : !selectedProvinceId
                      ? "Pilih Provinsi Terlebih Dahulu"
                      : "Pilih Kota / Kabupaten"}
                  </option>
                  {citiesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {toTitleCase(c.name)}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Kecamatan"
                  value={selectedDistrictId}
                  onChange={handleDistrictChange}
                  required
                  disabled={loadingDistricts || !selectedCityId}
                >
                  <option value="">
                    {loadingDistricts
                      ? "Memuat Kecamatan..."
                      : !selectedCityId
                      ? "Pilih Kota Terlebih Dahulu"
                      : "Pilih Kecamatan"}
                  </option>
                  {districtsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {toTitleCase(d.name)}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Kode Pos"
                  placeholder="Masukkan 5 digit kode pos"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  maxLength={5}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Alamat Lengkap
                </label>
                <textarea
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, gedung, dll."
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              <Input
                label="Catatan Tambahan (Opsional)"
                placeholder="Contoh: pagar hitam, dekat masjid, titip ke satpam"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Ringkasan Pesanan
              </h2>
            </div>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Total Pembayaran
            </h3>

            <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal ({items.length} item)
                </span>
                <span className="font-medium">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ongkos Kirim</span>
                <span className="text-emerald-600 font-medium">Gratis</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Biaya Layanan</span>
                <span className="font-medium">{formatCurrency(0)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              loading={loading}
            >
              <ShieldCheck className="h-5 w-5" />
              Bayar Sekarang
            </Button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Pembayaran aman diproses oleh Midtrans
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
