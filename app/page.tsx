import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import {
  ArrowRight,
  CheckCircle2,
  Code,
  Users,
  Target,
  Award,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  FileCheck,
  Brain,
  Rocket,
  Star,
  BarChart3,
  Clock,
  DollarSign,
  Search,
  Building2,
  Sparkles,
  Lock,
  Globe,
  Layers,
  Cpu,
  Database,
  GitBranch,
  TestTube,
  Circle,
  Square,
  Hexagon,
  Triangle,
  CircleDot,
  Box,
  Package,
  Container,
  Server,
  Cloud,
  Network,
  Webhook,
  FileCode,
  Terminal,
  Settings,
  Wrench,
  Hammer,
  Cog,
  Bug,
  Book,
  MessageSquare,
  GraduationCap,
} from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="text-2xl font-display font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              YTK Career
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="gradient" size="sm">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              <span>Yapay Zeka Destekli Doğrulama Sistemi</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
              Yanlış işe alımın{" "}
              <span className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 bg-clip-text text-transparent font-extrabold drop-shadow-lg animate-pulse opacity-90">
                350.000 TL'lik
              </span>{" "}
              sessiz faturasını ödemeyin
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed font-medium">
              CV'ler geçmişi anlatır.{" "}
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                YTK Career'ın Teknik ve Mühendislik Doğrulama süreçleri
              </span>
              , şirketinizin geleceğini garanti altına alır.
            </p>
            
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
              Gelecekte binlerce şirket, doğru mühendisi bulmak için bizim kapsamlı doğrulama sistemimize güvenecek. 
              Siz de aradığınız yeteneği burada bulacaksınız.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/login">
                <Button variant="gradient" size="lg" className="text-lg px-10 py-7 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  Ücretsiz Başlayın
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="text-lg px-10 py-7 border-2">
                  Hemen Kayıt Ol
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold">1.426+ Doğrulanmış Aday</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold">%100 Teknik Doğrulama</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold">27 Başarılı Yerleştirme</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Optimistic */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4" />
              <span>Faydalar</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-gray-900 dark:text-gray-100">
              İşe Alım Sürecinizi{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Optimize Edin
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-12">
              YTK Career ile doğru mühendisi bulun, yanlış işe alımın maliyetlerinden kaçının. 
              İşe alım sürecinizi optimize edin ve şirketinizin büyümesine katkı sağlayın.
            </p>
          </div>

          {/* Benefits breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Sıfır Oryantasyon Süresi",
                benefit: "İlk günden üretkenlik",
                description: "Doğrulanmış mühendisler, işe başladıkları ilk günden itibaren projelerinize değer katmaya başlar",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Shield,
                title: "Risk Minimizasyonu",
                benefit: "%100 güvenilir",
                description: "Kapsamlı doğrulama süreci ile yanlış işe alım riskini minimize edin, doğru kararlar verin",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: TrendingUp,
                title: "Hızlı Büyüme",
                benefit: "10x daha hızlı",
                description: "YTK Career ile kurulmuş ekipler, şirketlerin büyümesine 10x daha hızlı katkı sağlar",
                color: "from-purple-500 to-pink-500",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} variant="elevated" hover className="border-2 border-green-100 dark:border-green-900/30">
                  <CardContent className="p-6 pt-8">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{benefit.title}</h3>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">{benefit.benefit}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution - What YTK Career Does */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Rocket className="h-4 w-4" />
              <span>Çözümümüz</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-gray-900 dark:text-gray-100">
              Biz{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CV değil, hazır mühendis
              </span>{" "}
              sunarız
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Her aday, kapsamlı bir mühendislik doğrulama sürecinden geçer. 
              Siz sadece doğrulanmış yetenekleri görürsünüz. Standart bir CV değil, gerçek yetenekleri sunuyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Code,
                title: "Canlı Kodlama",
                subtitle: "Live Coding",
                description: "Baskı altında gerçek zamanlı kodlama yapmış, gerçek senaryolarda test edilmiş mühendisler",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Bug,
                title: "BUGFİX",
                description: "Gerçek projelerdeki bug'ları çözme yeteneği test edilmiş mühendisler",
                color: "from-red-500 to-red-600",
              },
              {
                icon: GraduationCap,
                title: "DERS",
                description: "Teknik konularda eğitim verme ve mentorluk yapabilecek seviyede adaylar",
                color: "from-indigo-500 to-indigo-600",
              },
              {
                icon: TestTube,
                title: "TEST",
                description: "Kapsamlı test yazma ve test stratejileri geliştirme yeteneği doğrulanmış, kalite odaklı mühendisler",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Sparkles,
                title: "AI MÜLAKATI",
                description: "Yapay zeka destekli, kopya önleyici sınavlardan geçmiş, gerçek yetenekleri ölçülmüş adaylar",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: MessageSquare,
                title: "ADAYLA BİRE BİR GÖRÜŞME",
                description: "Ekip dinamikleri, sorumluluk bilinci ve şirket vizyonu ile uyumu doğrulanmış adaylar",
                color: "from-cyan-500 to-cyan-600",
              },
              {
                icon: FileCheck,
                title: "Gerçek Proje Senaryoları",
                description: "Gerçek bug-fix senaryolarında test edilmiş, üretim ortamına hazır mühendisler",
                color: "from-pink-500 to-pink-600",
              },
              {
                icon: Brain,
                title: "Zihinsel Dayanıklılık",
                description: "Teknik ve zihinsel dayanıklılığı ölçülmüş, stres altında performans gösterebilen profesyoneller",
                color: "from-yellow-500 to-yellow-600",
              },
              {
                icon: Target,
                title: "Kurumsal Uyum",
                description: "Kurumsal ölçekteki işlerde başarılı olabilecek, şirket kültürüne hızla uyum sağlayabilecek adaylar",
                color: "from-teal-500 to-teal-600",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} variant="elevated" hover className="h-full group">
                  <CardContent className="p-6 pt-8">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 italic">
                        {item.subtitle}
                      </p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Card variant="elevated" className="max-w-3xl mx-auto p-8 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-900/50 shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                Aday değerlendirme sürecinde, kurumsal yapılara uyum sağlayabilecek nitelikler ön planda tutulur. 
                Teknik yeterliliklerin yanı sıra ekip çalışmasına uygunluk da temel kriterler arasındadır.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories - Enhanced */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              <span>Başarı Hikayeleri</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-gray-900 dark:text-gray-100">
              Teknoloji İşe Alımında{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Güvenilen Çözüm Ortağı
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              YTK Career ile işe alım süreçlerini dönüştüren şirketler, rekabet avantajı kazanıyor ve büyümelerini hızlandırıyor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Award,
                title: "Teknoloji Devlerinin Tercihi",
                description: "Büyük ölçekli teknoloji şirketleri, ekibimize güvenerek başarılı yerleştirmeler gerçekleştiriyor. Her yerleştirme, şirketlerin büyümesine katkı sağlıyor.",
                color: "from-yellow-500 to-orange-500",
                stat: "27+",
                statLabel: "Başarılı yerleştirme",
              },
              {
                icon: Building2,
                title: "Startup'lardan Kurumsallara",
                description: "Küçük startup'lardan büyük kurumsal şirketlere kadar her ölçekte şirket, doğru mühendisi bulmak için platformumuzu kullanıyor.",
                color: "from-green-500 to-emerald-500",
                stat: "50+",
                statLabel: "Mutlu şirket",
              },
              {
                icon: TrendingUp,
                title: "Sürekli Büyüyen Ağ",
                description: "Her geçen gün daha fazla şirket, YTK Career'ın doğrulama sistemine güveniyor ve ekibimize katılıyor.",
                color: "from-blue-500 to-cyan-500",
                stat: "%95",
                statLabel: "Memnuniyet oranı",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} variant="elevated" hover className="h-full group border-2 border-transparent hover:border-green-200 dark:hover:border-green-800 transition-all">
                  <CardContent className="p-8 pt-10">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="mb-4">
                      <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">{benefit.stat}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{benefit.statLabel}</div>
                    </div>
                    <h3 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-gray-900 dark:text-gray-100">
              Sayılarla{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                YTK Career
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Rakamlarla başarımızı görün. Her sayı, bir başarı hikayesidir.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {[
              { 
                value: "1.426", 
                label: "Kayıtlı Doğrulanmış Aday",
                icon: Users,
                color: "from-blue-500 to-blue-600",
                description: "Teknik sınavlardan geçmiş, doğrulanmış mühendisler",
              },
              { 
                value: "27", 
                label: "Başarılı Yerleştirme",
                icon: Award,
                color: "from-purple-500 to-purple-600",
                description: "Tüm aşamaları başarıyla geçen mühendisler",
              },
              { 
                value: "%100", 
                label: "Teknik Doğrulama Oranı",
                icon: Shield,
                color: "from-green-500 to-green-600",
                description: "Doğrulanmış, raporlanabilir teknik çıktı",
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} variant="elevated" className="text-center border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                  <CardContent className="p-8 pt-10">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-5xl md:text-6xl font-display font-bold text-gray-900 dark:text-gray-100 mb-3">
                      {stat.value}
                    </div>
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{stat.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.description}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center">
            <Card variant="glass" className="max-w-3xl mx-auto p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                Adaylar, şirket taleplerine göre detaylı teknik raporlarla sunulur. 
                Her aday için kapsamlı bir performans analizi sağlanır.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* What Employers Can Do - Enhanced */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
              <Building2 className="h-4 w-4" />
              <span>İşverenler İçin</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-gray-900 dark:text-gray-100">
              İşverenler Bu Platformda{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Ne Yapabilir?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              YTK Career ile işe alım sürecinizi optimize edin ve doğru yetenekleri bulun.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {[
              {
                icon: Search,
                title: "Doğrulanmış Mühendis Havuzuna Erişim",
                description: "Teknik sınavlardan geçmiş, doğrulanmış mühendislerin bulunduğu kapsamlı havuz",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: FileCheck,
                title: "Teknik Rapor ve Performans Çıktıları",
                description: "Her aday için detaylı teknik rapor ve performans analizi inceleme imkanı",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: Target,
                title: "Özel Aday Filtreleme",
                description: "Kendi ihtiyaçlarınıza özel aday filtreleme ve eşleştirme sistemi",
                color: "from-pink-500 to-pink-600",
              },
              {
                icon: Rocket,
                title: "Uzun Vadeli Yetenek Pipeline'ı",
                description: "Akademi–Career iş birliğiyle sürekli yetenek akışı ve pipeline yönetimi",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Shield,
                title: "Yanlış İşe Alım Riski Minimizasyonu",
                description: "Kapsamlı doğrulama süreci ile yanlış işe alım riskini minimize edin",
                color: "from-yellow-500 to-yellow-600",
              },
              {
                icon: BarChart3,
                title: "Detaylı Analytics ve Raporlama",
                description: "İşe alım süreçlerinizi analiz edin ve optimize edin",
                color: "from-cyan-500 to-cyan-600",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} variant="elevated" hover className="h-full">
                  <CardContent className="p-6 pt-8">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-gray-900 dark:text-gray-100 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Section - New */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              <span>Personel Tipleri</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-gray-900 dark:text-gray-100">
              Burada Hangi{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Personelleri Bulabilirsiniz?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Geniş yelpazede doğrulanmış mühendis ve yazılım profesyonelleri
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            {[
              {
                title: "Frontend Developer",
                description: "React, Vue, Angular uzmanları",
                icon: Code,
                color: "from-blue-500 to-blue-600",
                technologies: ["React", "Vue.js", "Angular", "Next.js"],
              },
              {
                title: "Backend Developer",
                description: "Server-side ve API geliştiricileri",
                icon: Cpu,
                color: "from-purple-500 to-purple-600",
                technologies: ["Node.js", "Python", "Java", ".NET"],
              },
              {
                title: "Full Stack Developer",
                description: "Hem frontend hem backend uzmanları",
                icon: Layers,
                color: "from-pink-500 to-pink-600",
                technologies: ["React + Node.js", "TypeScript", "MERN", "MEAN"],
              },
              {
                title: "DevOps Engineer",
                description: "CI/CD ve altyapı uzmanları",
                icon: Rocket,
                color: "from-green-500 to-green-600",
                technologies: ["Docker", "Kubernetes", "AWS", "CI/CD"],
              },
              {
                title: "Mobile Developer",
                description: "iOS ve Android geliştiricileri",
                icon: Globe,
                color: "from-yellow-500 to-yellow-600",
                technologies: ["React Native", "Flutter", "Swift", "Kotlin"],
              },
              {
                title: "Data Engineer",
                description: "Veri işleme ve analiz uzmanları",
                icon: Database,
                color: "from-cyan-500 to-cyan-600",
                technologies: ["Python", "SQL", "Big Data", "ETL"],
              },
              {
                title: "QA Engineer",
                description: "Test ve kalite güvence uzmanları",
                icon: TestTube,
                color: "from-orange-500 to-orange-600",
                technologies: ["Automation", "Selenium", "Cypress", "Jest"],
              },
              {
                title: "Cloud Architect",
                description: "Bulut mimarisi ve çözüm uzmanları",
                icon: Globe,
                color: "from-indigo-500 to-indigo-600",
                technologies: ["AWS", "Azure", "GCP", "Serverless"],
              },
            ].map((role, index) => {
              const Icon = role.icon;
              return (
                <Card key={index} variant="elevated" hover className="h-full">
                  <CardContent className="p-6 pt-8">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {role.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {role.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {role.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Stack - New Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Code className="h-4 w-4" />
              <span>Teknolojiler</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-gray-900 dark:text-gray-100">
              Hangi Teknolojilerde{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Uzman Adaylar Bulabilirsiniz?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Geniş teknoloji yelpazesinde doğrulanmış mühendisler
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {[
              { name: "React", icon: Code },
              { name: "Vue.js", icon: Circle },
              { name: "Angular", icon: Hexagon },
              { name: "Next.js", icon: ArrowRight },
              { name: "Node.js", icon: Cpu },
              { name: "Express", icon: Rocket },
              { name: "NestJS", icon: Box },
              { name: "Python", icon: CircleDot },
              { name: "Django", icon: Package },
              { name: "Flask", icon: Container },
              { name: "FastAPI", icon: Zap },
              { name: "TypeScript", icon: FileCode },
              { name: "JavaScript", icon: Code },
              { name: "Java", icon: Square },
              { name: "Spring Boot", icon: Rocket },
              { name: "C#", icon: Square },
              { name: ".NET", icon: Network },
              { name: "Go", icon: Terminal },
              { name: "Rust", icon: Shield },
              { name: "PostgreSQL", icon: Database },
              { name: "MySQL", icon: Database },
              { name: "MongoDB", icon: Database },
              { name: "Redis", icon: Circle },
              { name: "Docker", icon: Container },
              { name: "Kubernetes", icon: Layers },
              { name: "AWS", icon: Cloud },
              { name: "Azure", icon: Cloud },
              { name: "GCP", icon: Cloud },
              { name: "Git", icon: GitBranch },
              { name: "GitHub", icon: GitBranch },
              { name: "CI/CD", icon: Settings },
              { name: "GraphQL", icon: Webhook },
              { name: "REST API", icon: Globe },
              { name: "Microservices", icon: Server },
              { name: "Serverless", icon: Cloud },
              { name: "Testing", icon: TestTube },
            ].map((tech, index) => {
              const Icon = tech.icon;
              return (
                <Card key={index} variant="outlined" className="text-center hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                  <CardContent className="p-4 pt-6">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{tech.name}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA - Enhanced */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Lock className="h-16 w-16 mx-auto mb-6 text-white/90" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Eleme yapmak bir İK süreci değil,{" "}
              <span className="text-yellow-300">kârlılık stratejisidir</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              YTK Career, bu stratejiyi sizin adınıza yönetir. 
              Doğru mühendisi bulmak artık çok daha kolay.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-7 bg-white text-blue-600 hover:bg-gray-100 border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                Ücretsiz Başlayın
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-7 bg-transparent text-white border-2 border-white hover:bg-white/10 shadow-xl transition-all"
              >
                Hemen Kayıt Ol
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white/90">
            <div>
              <div className="text-3xl font-bold mb-2">1.426+</div>
              <div className="text-sm">Doğrulanmış Aday</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">%100</div>
              <div className="text-sm">Teknik Doğrulama</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">27+</div>
              <div className="text-sm">Başarılı Yerleştirme</div>
            </div>
          </div>
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
              <Link href="/register" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Kayıt Ol
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
