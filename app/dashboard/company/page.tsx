"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Building2, Save, Upload, Globe, MapPin, Phone, Mail, Linkedin, Twitter, Instagram } from "lucide-react";
import Image from "next/image";

interface CompanyData {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  twitter: string | null;
  instagram: string | null;
}

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    address: "",
    phone: "",
    email: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  });
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/company");
      if (response.ok) {
        const data = await response.json();
        if (data.company) {
          setCompany(data.company);
          setFormData({
            name: data.company.name || "",
            description: data.company.description || "",
            website: data.company.website || "",
            address: data.company.address || "",
            phone: data.company.phone || "",
            email: data.company.email || "",
            linkedin: data.company.linkedin || "",
            twitter: data.company.twitter || "",
            instagram: data.company.instagram || "",
          });
          setLogo(data.company.logo);
        }
      }
    } catch (error) {
      console.error("Error fetching company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Logo boyutu 5MB'dan küçük olmalıdır");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Lütfen geçerli bir resim dosyası seçin");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload logo if there's a new one
      let logoUrl = logo;
      if (logoFile) {
        const formData = new FormData();
        formData.append("image", logoFile);
        const uploadResponse = await fetch("/api/settings/upload-image", {
          method: "POST",
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          logoUrl = uploadData.url;
        } else {
          throw new Error("Logo yüklenemedi");
        }
      }

      // Update company
      const response = await fetch("/api/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          logo: logoUrl,
        }),
      });

      if (response.ok) {
        setSuccess("Şirket bilgileri başarıyla güncellendi");
        setLogoFile(null);
        fetchCompany();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Şirket bilgileri güncellenemedi");
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
        <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
          Şirket Bilgileri
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Şirket profilinizi yönetin ve güncelleyin
        </p>
      </div>

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

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Şirket Profili
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Şirket Logosu
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                  {logo ? (
                    <Image
                      src={logo}
                      alt="Logo"
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <Building2 className="h-12 w-12 text-white" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <span className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 px-4 py-2 text-base border-2 border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300">
                      <Upload className="h-4 w-4 mr-2" />
                      Logo Yükle
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
              label="Şirket Adı"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Şirket Adı"
              required
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Şirket hakkında bilgi..."
              />
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Web Sitesi
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  E-posta
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Telefon
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+90 555 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Adres
                </label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Şirket adresi"
                />
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Sosyal Medya
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Linkedin className="h-4 w-4 inline mr-1" />
                    LinkedIn
                  </label>
                  <Input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Twitter className="h-4 w-4 inline mr-1" />
                    Twitter
                  </label>
                  <Input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Instagram className="h-4 w-4 inline mr-1" />
                    Instagram
                  </label>
                  <Input
                    type="url"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="gradient" isLoading={saving}>
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
