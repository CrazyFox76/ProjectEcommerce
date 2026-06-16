"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Upload, ImageIcon, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("hero_image_url")
        .eq("id", 1)
        .single();
      if (data?.hero_image_url) setHeroImageUrl(data.hero_image_url);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `hero-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("product_images")
      .upload(fileName, file);

    if (error) {
      toast.error(`Gagal mengupload gambar: ${error.message}`);
    } else {
      const { data } = supabase.storage.from("product_images").getPublicUrl(fileName);
      setHeroImageUrl(data.publicUrl);
      toast.success("Gambar berhasil diupload. Jangan lupa klik Simpan.");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("site_settings")
      .update({ hero_image_url: heroImageUrl || null, updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select("id");

    if (error) {
      toast.error(`Gagal menyimpan: ${error.message}`);
    } else if (!data || data.length === 0) {
      toast.error(
        "Tidak tersimpan. Pastikan tabel site_settings sudah dibuat & akun Anda admin."
      );
    } else {
      toast.success("Pengaturan tersimpan. Foto hero diperbarui.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Tampilan</h1>
        <p className="text-sm text-gray-500">Atur foto produk yang tampil di hero homepage.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Foto Hero (disarankan PNG transparan)
          </label>

          {/* Preview di atas latar gelap seperti hero asli */}
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gradient-to-br from-[#0f1f44] via-[#1b3568] to-[#26489a] flex items-center justify-center mb-3">
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt="Preview hero"
                fill
                unoptimized
                className="object-contain p-6 drop-shadow-2xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-blue-100/70">
                <ImageIcon className="h-10 w-10" />
                <span className="text-sm">Belum ada foto — hero memakai visual default</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              ) : (
                <Upload className="h-4 w-4 text-gray-500" />
              )}
              {uploading ? "Mengupload..." : "Upload Gambar"}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {heroImageUrl && (
              <Button
                variant="ghost"
                onClick={() => setHeroImageUrl("")}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Hapus foto
              </Button>
            )}
          </div>

          <Input
            placeholder="Atau tempel URL gambar (https://...)"
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            className="mt-3"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button onClick={handleSave} loading={saving}>
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
