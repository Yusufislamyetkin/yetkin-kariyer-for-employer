"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Sunucu yapılandırma hatası. NEXTAUTH_SECRET veya AUTH_SECRET environment variable'ı eksik olabilir. Lütfen yöneticiye başvurun.";
      case "AccessDenied":
        return "Erişim reddedildi. Bu hata genellikle şu nedenlerden kaynaklanır:\n\n• Veritabanı migration'ı yapılmamış olabilir (Account tablosu eksik)\n• Google OAuth credentials eksik veya hatalı olabilir\n• Veritabanı bağlantı hatası olabilir\n\nLütfen yöneticiye başvurun veya tekrar deneyin.";
      case "Verification":
        return "Doğrulama hatası. Email doğrulaması başarısız oldu.";
      default:
        return error ? `Hata: ${error}` : "Bir hata oluştu. Lütfen tekrar deneyin.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <Card variant="glass" className="backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-red-600 dark:text-red-400">
              <AlertCircle className="h-6 w-6" />
              Hata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {getErrorMessage(error)}
            </p>
            <Link href="/login">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Giriş Sayfasına Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-600 dark:text-gray-400">Yükleniyor...</div>
          </div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
