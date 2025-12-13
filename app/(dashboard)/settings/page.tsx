"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { User, Lock, CreditCard, Upload, Save, Loader2 } from "lucide-react";
import Image from "next/image";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  profileImage: string | null;
  iban: string | null;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "payment">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [iban, setIban] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setIban(data.iban || "");
        setProfileImage(data.profileImage);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Profil bilgileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Resim boyutu 5MB'dan küçük olmalıdır");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Lütfen geçerli bir resim dosyası seçin");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // First upload image if there's a new one
      let imageUrl = profileImage;
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploadResponse = await fetch("/api/settings/upload-image", {
          method: "POST",
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        } else {
          throw new Error("Resim yüklenemedi");
        }
      }

      // Then update profile
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          iban,
          profileImage: imageUrl,
        }),
      });

      if (response.ok) {
        setSuccess("Profil bilgileri başarıyla güncellendi");
        setImageFile(null);
        fetchProfile();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Profil güncellenemedi");
      }
    } catch (error: any) {
      setError(error.message || "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler eşleşmiyor");
      setSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setSuccess("Şifre başarıyla değiştirildi");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Şifre değiştirilemedi");
      }
    } catch (error: any) {
      setError(error.message || "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
          Ayarlar
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Profil bilgilerinizi ve hesap ayarlarınızı yönetin
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "profile"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          <User className="h-4 w-4 inline mr-2" />
          Profil
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "password"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          <Lock className="h-4 w-4 inline mr-2" />
          Şifre
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "payment"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          <CreditCard className="h-4 w-4 inline mr-2" />
          Ödeme Bilgileri
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Profil Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profil Fotoğrafı
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt="Profil"
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <User className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <span className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 px-4 py-2 text-base border-2 border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300">
                        <Upload className="h-4 w-4 mr-2" />
                        Fotoğraf Yükle
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Maksimum 5MB, JPG, PNG veya GIF
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <Input
                label="İsim"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınız ve soyadınız"
                required
              />

              {/* Email */}
              <Input
                label="E-posta"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
              />

              <div className="flex gap-4">
                <Button type="submit" variant="gradient" isLoading={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setName(profile?.name || "");
                    setEmail(profile?.email || "");
                    setIban(profile?.iban || "");
                    setProfileImage(profile?.profileImage || null);
                    setImageFile(null);
                  }}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Şifre Değiştir</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Mevcut Şifre"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="Yeni Şifre"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                helperText="En az 6 karakter olmalıdır"
              />
              <Input
                label="Yeni Şifre (Tekrar)"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <div className="flex gap-4">
                <Button type="submit" variant="gradient" isLoading={saving}>
                  <Lock className="h-4 w-4 mr-2" />
                  Şifreyi Değiştir
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payment Tab */}
      {activeTab === "payment" && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Ödeme Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="IBAN"
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                helperText="Ödemeler için IBAN bilginizi girin"
              />

              <div className="flex gap-4">
                <Button type="submit" variant="gradient" isLoading={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
