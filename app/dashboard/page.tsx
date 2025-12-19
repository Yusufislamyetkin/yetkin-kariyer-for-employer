import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Briefcase, FileText, Users, Trophy, TrendingUp, BarChart3, Search, MessageSquare, Bell, Settings, FolderKanban, Calendar, Code, ArrowRight } from "lucide-react";
import { NotificationsSection } from "./_components/NotificationsSection";
import { ActivityTimeline } from "./_components/ActivityTimeline";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  let session;
  try {
    session = await auth();
  } catch (error: any) {
    console.error("Auth error in dashboard page:", error);
    redirect("/login?error=auth_failed");
  }

  if (!session || (session.user as any)?.role !== "employer") {
    redirect("/login");
  }

  const employerId = session.user?.id as string;

  // Get statistics
  let jobsCount, applicationsCount, cvsCount, interviewsCount, hackathonsCount, freelancerProjectsCount;
  try {
    [jobsCount, applicationsCount, cvsCount, interviewsCount, hackathonsCount, freelancerProjectsCount] = await Promise.all([
    db.job.count({ where: { employerId } }),
    db.jobApplication.count({
      where: {
        job: {
          employerId,
        },
      },
    }),
      db.cV.count(),
      db.interviewAttempt.count(),
      db.hackathon.count({ where: { organizerId: employerId } }),
      db.freelancerProject.count({ where: { createdBy: employerId } }),
    ]);
  } catch (error: any) {
    console.error("Database error in dashboard page:", error);
    // Set default values on error
    jobsCount = 0;
    applicationsCount = 0;
    cvsCount = 0;
    interviewsCount = 0;
    hackathonsCount = 0;
    freelancerProjectsCount = 0;
  }

  const stats = [
    {
      title: "Toplam İş İlanı",
      value: jobsCount,
      icon: Briefcase,
      color: "from-blue-500 to-blue-600",
      href: "/dashboard/jobs",
    },
    {
      title: "Toplam Başvuru",
      value: applicationsCount,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      href: "/dashboard/jobs",
    },
    {
      title: "CV Havuzu",
      value: cvsCount,
      icon: FileText,
      color: "from-green-500 to-green-600",
      href: "/dashboard/cv-pool",
    },
    {
      title: "Mülakat Sonuçları",
      value: interviewsCount,
      icon: Users,
      color: "from-pink-500 to-pink-600",
      href: "/dashboard/interviews",
    },
    {
      title: "Hackathon'lar",
      value: hackathonsCount,
      icon: Trophy,
      color: "from-yellow-500 to-yellow-600",
      href: "/dashboard/hackathons",
    },
    {
      title: "Freelancer Projeler",
      value: freelancerProjectsCount,
      icon: TrendingUp,
      color: "from-cyan-500 to-cyan-600",
      href: "/dashboard/freelancer/projects",
    },
  ];

  const quickAccessItems = [
    {
      title: "İş İlanları",
      description: "İlanları yönetin",
      href: "/dashboard/jobs",
      icon: Briefcase,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "CV Havuzu",
      description: "CV'leri görüntüleyin",
      href: "/dashboard/cv-pool",
      icon: FileText,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Aday Eşleştirme",
      description: "Adayları bulun",
      href: "/dashboard/candidate-matcher",
      icon: Search,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Mülakat Sonuçları",
      description: "Sonuçları inceleyin",
      href: "/dashboard/interviews",
      icon: Users,
      color: "from-pink-500 to-pink-600",
    },
    {
      title: "Mülakat Takvimi",
      description: "Takvimi yönetin",
      href: "/dashboard/interviews/schedule",
      icon: Calendar,
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Freelancer Projeler",
      description: "Projeleri yönetin",
      href: "/dashboard/freelancer/projects",
      icon: FolderKanban,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Hackathon'lar",
      description: "Hackathon'ları yönetin",
      href: "/dashboard/hackathons",
      icon: Trophy,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      title: "Başarılı Kullanıcılar",
      description: "En iyi adayları görün",
      href: "/dashboard/top-users",
      icon: Code,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      title: "Mesajlar",
      description: "Mesajlarınızı görün",
      href: "/dashboard/messages",
      icon: MessageSquare,
      color: "from-teal-500 to-teal-600",
    },
    {
      title: "Analytics",
      description: "İstatistikleri görün",
      href: "/dashboard/analytics",
      icon: BarChart3,
      color: "from-violet-500 to-violet-600",
    },
    {
      title: "Ayarlar",
      description: "Hesap ayarları",
      href: "/dashboard/settings",
      icon: Settings,
      color: "from-gray-500 to-gray-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            İşveren kariyer platformuna hoş geldiniz
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card variant="elevated" hover className="h-full group transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card variant="elevated" className="h-full">
            <CardHeader className="pt-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Hızlı Erişim
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Tüm özelliklere hızlıca erişin
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickAccessItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group p-4 pt-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications - Takes 1 column */}
        <div className="lg:col-span-1">
          <NotificationsSection />
        </div>
      </div>

      {/* Son Aktiviteler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <ActivityTimeline title="Son Aktiviteler" limit={15} />
        </div>
      </div>
    </div>
  );
}
