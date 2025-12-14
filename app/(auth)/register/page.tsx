"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { UserPlus, Mail, Lock, User, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "employer" }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          setError(data.error);
        } else if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((err: any) => err.message).join(", ");
          setError(errorMessages || "Geçersiz veri");
        } else {
          setError("Kayıt başarısız. Lütfen tekrar deneyin.");
        }
        return;
      }

      router.push("/login?registered=true");
    } catch (error: any) {
      console.error("Register error:", error);
      if (error.message && error.message.includes("fetch")) {
        setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            YTK Career
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
            İşveren Kayıt
          </p>
        </div>

        <Card variant="glass" className="backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              İşveren Hesabı Oluştur
            </CardTitle>
            <CardDescription>
              Zaten hesabınız var mı?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              >
                Giriş yapın
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 z-10" />
                  <Input
                    type="text"
                    placeholder="Adınız Soyadınız"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 z-10" />
                  <Input
                    type="email"
                    placeholder="Email adresi"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 z-10" />
                  <Input
                    type="password"
                    placeholder="En az 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                isLoading={loading}
                disabled={loading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {loading ? "Kayıt yapılıyor..." : "Kayıt ol"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
            >
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
