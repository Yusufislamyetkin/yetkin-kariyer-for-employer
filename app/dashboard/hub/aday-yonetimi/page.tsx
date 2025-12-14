"use client";

import Link from "next/link";
import { FileText, Search, Users, Calendar, Code, MessageSquare, Bell, ArrowRight, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/Card";

const colorClasses = {
  blue: {
    overlay: "from-blue-50/50 to-transparent dark:from-blue-900/10",
    hover: "hover:shadow-blue-500/20 hover:border-blue-200 dark:hover:border-blue-700",
    iconShadow: "shadow-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
  },
  purple: {
    overlay: "from-purple-50/50 to-transparent dark:from-purple-900/10",
    hover: "hover:shadow-purple-500/20 hover:border-purple-200 dark:hover:border-purple-700",
    iconShadow: "shadow-purple-500/30",
    text: "text-purple-600 dark:text-purple-400",
  },
  green: {
    overlay: "from-green-50/50 to-transparent dark:from-green-900/10",
    hover: "hover:shadow-green-500/20 hover:border-green-200 dark:hover:border-green-700",
    iconShadow: "shadow-green-500/30",
    text: "text-green-600 dark:text-green-400",
  },
  amber: {
    overlay: "from-amber-50/50 to-transparent dark:from-amber-900/10",
    hover: "hover:shadow-amber-500/20 hover:border-amber-200 dark:hover:border-amber-700",
    iconShadow: "shadow-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
  },
  indigo: {
    overlay: "from-indigo-50/50 to-transparent dark:from-indigo-900/10",
    hover: "hover:shadow-indigo-500/20 hover:border-indigo-200 dark:hover:border-indigo-700",
    iconShadow: "shadow-indigo-500/30",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  pink: {
    overlay: "from-pink-50/50 to-transparent dark:from-pink-900/10",
    hover: "hover:shadow-pink-500/20 hover:border-pink-200 dark:hover:border-pink-700",
    iconShadow: "shadow-pink-500/30",
    text: "text-pink-600 dark:text-pink-400",
  },
  teal: {
    overlay: "from-teal-50/50 to-transparent dark:from-teal-900/10",
    hover: "hover:shadow-teal-500/20 hover:border-teal-200 dark:hover:border-teal-700",
    iconShadow: "shadow-teal-500/30",
    text: "text-teal-600 dark:text-teal-400",
  },
};

const hubItems = [
  {
    title: "CV Havuzu",
    description: "Doğrulanmış adayların CV'lerini görüntüleyin ve inceleyin",
    href: "/dashboard/cv-pool",
    icon: FileText,
    color: "from-blue-500 via-cyan-500 to-blue-600",
    colorKey: "blue" as keyof typeof colorClasses,
  },
  {
    title: "Aday Eşleştirme",
    description: "İş ilanlarınıza uygun adayları otomatik olarak bulun",
    href: "/dashboard/candidate-matcher",
    icon: Search,
    color: "from-purple-500 via-pink-500 to-purple-600",
    colorKey: "purple" as keyof typeof colorClasses,
  },
  {
    title: "Mülakat Sonuçları",
    description: "Mülakat sonuçlarını görüntüleyin ve değerlendirin",
    href: "/dashboard/interviews",
    icon: Users,
    color: "from-green-500 via-emerald-500 to-green-600",
    colorKey: "green" as keyof typeof colorClasses,
  },
  {
    title: "Mülakat Takvimi",
    description: "Mülakat takviminizi yönetin ve planlayın",
    href: "/dashboard/interviews/schedule",
    icon: Calendar,
    color: "from-amber-500 via-yellow-500 to-amber-600",
    colorKey: "amber" as keyof typeof colorClasses,
  },
  {
    title: "Başarılı Kullanıcılar",
    description: "En başarılı adayları görüntüleyin ve keşfedin",
    href: "/dashboard/top-users",
    icon: Code,
    color: "from-indigo-500 via-blue-500 to-indigo-600",
    colorKey: "indigo" as keyof typeof colorClasses,
  },
  {
    title: "Mesajlar",
    description: "Adaylarla mesajlaşın ve iletişim kurun",
    href: "/dashboard/messages",
    icon: MessageSquare,
    color: "from-pink-500 via-rose-500 to-pink-600",
    colorKey: "pink" as keyof typeof colorClasses,
  },
  {
    title: "Analytics",
    description: "İşe alım süreçlerinizi analiz edin ve raporları görüntüleyin",
    href: "/dashboard/analytics",
    icon: BarChart3,
    color: "from-indigo-500 via-blue-500 to-indigo-600",
    colorKey: "indigo" as keyof typeof colorClasses,
  },
];

export default function AdayYonetimiHubPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 leading-normal pb-2">
            Aday Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            Adayları keşfedin, mülakatları yönetin ve iletişim kurun
          </p>
        </div>
      </div>

      {/* Hub Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-full overflow-x-hidden">
        {hubItems.map((item, index) => {
          const Icon = item.icon;
          const colorClass = colorClasses[item.colorKey];
          return (
            <Link key={index} href={item.href}>
              <Card 
                variant="elevated" 
                hover 
                className={`h-full relative overflow-hidden ${colorClass.hover} transition-all duration-300`}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClass.overlay} pointer-events-none`} />
                
                <CardContent className="pt-10 px-8 pb-8 relative z-10">
                  <div className="flex items-start gap-6">
                    <div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl ${colorClass.iconShadow} flex-shrink-0`}
                    >
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400 mb-5">
                        {item.description}
                      </p>
                      <div className={`flex items-center ${colorClass.text} font-medium text-base`}>
                        <span>Keşfet</span>
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
