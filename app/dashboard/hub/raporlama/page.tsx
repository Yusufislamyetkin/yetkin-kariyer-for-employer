"use client";

import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/Card";

const colorClasses = {
  indigo: {
    overlay: "from-indigo-50/50 to-transparent dark:from-indigo-900/10",
    hover: "hover:shadow-indigo-500/20 hover:border-indigo-200 dark:hover:border-indigo-700",
    iconShadow: "shadow-indigo-500/30",
    text: "text-indigo-600 dark:text-indigo-400",
  },
};

const hubItems = [
  {
    title: "Analytics",
    description: "İşe alım süreçlerinizi analiz edin ve raporları görüntüleyin",
    href: "/dashboard/analytics",
    icon: BarChart3,
    color: "from-indigo-500 via-blue-500 to-indigo-600",
    colorKey: "indigo" as keyof typeof colorClasses,
  },
];

export default function RaporlamaHubPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 leading-normal pb-2">
            Raporlama
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            İşe alım süreçlerinizi analiz edin ve detaylı raporları görüntüleyin
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
