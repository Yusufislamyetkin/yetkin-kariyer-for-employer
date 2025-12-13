import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import {
  Briefcase,
  Users,
  FileText,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  TrendingUp,
  Search,
  MessageSquare,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Search,
      title: "Akıllı Aday Eşleştirme",
      description: "Yapay zeka destekli sistem ile iş ilanınıza en uygun adayları otomatik bulun.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: FileText,
      title: "CV Havuzu",
      description: "Binlerce kalifiye adayın CV'sine erişin ve doğru kişiyi hızlıca bulun.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: BarChart3,
      title: "Detaylı Analitik",
      description: "İlan performansınızı ve başvuru istatistiklerinizi gerçek zamanlı takip edin.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: MessageSquare,
      title: "Doğrudan İletişim",
      description: "Adaylarla mesajlaşarak hızlı ve etkili iletişim kurun.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Briefcase,
      title: "İlan Şablonları",
      description: "Hazır şablonlarla dakikalar içinde profesyonel iş ilanları oluşturun.",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Shield,
      title: "Güvenli Platform",
      description: "Verileriniz SSL şifreleme ile korunur, güvenli bir şekilde çalışın.",
      color: "from-cyan-500 to-cyan-600",
    },
  ];

  const benefits = [
    "Ücretsiz deneme süresi",
    "Sınırsız iş ilanı yayınlama",
    "7/24 müşteri desteği",
    "Mobil uyumlu platform",
    "Otomatik aday filtreleme",
    "Toplu başvuru yönetimi",
  ];

  const stats = [
    { value: "10,000+", label: "Aktif İşveren" },
    { value: "500,000+", label: "CV Havuzu" },
    { value: "95%", label: "Memnuniyet Oranı" },
    { value: "24/7", label: "Destek Hizmeti" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Doğru Adayı Bulun,
              <br />
              İşinizi Büyütün
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              YTK Career ile iş ilanlarınızı yayınlayın, binlerce kalifiye adaya ulaşın ve
              yapay zeka destekli eşleştirme sistemi ile en uygun çalışanları bulun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <Button variant="gradient" size="lg" className="text-lg px-8 py-6">
                  İşveren Girişi Yap
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Ücretsiz Dene
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
              Neden YTK Career?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              İşe alım sürecinizi kolaylaştıran güçlü özelliklerle donatılmış platformumuz
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} variant="elevated" hover className="h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6">
                Size Özel Avantajlar
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                YTK Career ile işe alım sürecinizi optimize edin ve en iyi adayları bulun.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card variant="glass" className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">Hızlı ve Etkili</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Dakikalar içinde ilan yayınlayın</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">Sürekli Gelişim</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Yeni özelliklerle sürekli güncelleniyor</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">Kolay Kullanım</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sezgisel arayüz ile kolay yönetim</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card variant="gradient" className="p-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6">
              Hemen Başlayın
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              Binlerce işveren gibi siz de YTK Career ile doğru adayları bulun ve işinizi büyütün.
            </p>
            <Link href="/login">
              <Button variant="gradient" size="lg" className="text-lg px-10 py-6">
                Ücretsiz Hesap Oluştur
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-display font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              YTK Career
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              İşverenler için profesyonel işe alım platformu
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/login" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Giriş Yap
              </Link>
              <span>•</span>
              <span>© 2025 YTK Career. Tüm hakları saklıdır.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
