import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Briefcase, FileText, Users, Trophy, TrendingUp, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "employer") {
    redirect("/login");
  }

  const employerId = session.user?.id as string;

  // Get statistics
  const [jobsCount, applicationsCount, cvsCount, interviewsCount, hackathonsCount, freelancerProjectsCount] = await Promise.all([
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

  const stats = [
    {
      title: "Toplam İş İlanı",
      value: jobsCount,
      icon: Briefcase,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Toplam Başvuru",
      value: applicationsCount,
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "CV Havuzu",
      value: cvsCount,
      icon: FileText,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Mülakat Sonuçları",
      value: interviewsCount,
      icon: Users,
      color: "from-pink-500 to-pink-600",
    },
    {
      title: "Hackathon'lar",
      value: hackathonsCount,
      icon: Trophy,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      title: "Freelancer Projeler",
      value: freelancerProjectsCount,
      icon: TrendingUp,
      color: "from-cyan-500 to-cyan-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          İşveren kariyer platformuna hoş geldiniz
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} variant="elevated" hover>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{stat.title}</CardTitle>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Hızlı Erişim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/dashboard/jobs"
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Briefcase className="h-5 w-5 mb-2 text-blue-600" />
              <h3 className="font-semibold">İş İlanları</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">İlanları yönetin</p>
            </a>
            <a
              href="/dashboard/cv-pool"
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText className="h-5 w-5 mb-2 text-green-600" />
              <h3 className="font-semibold">CV Havuzu</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">CV'leri görüntüleyin</p>
            </a>
            <a
              href="/dashboard/interviews"
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Users className="h-5 w-5 mb-2 text-pink-600" />
              <h3 className="font-semibold">Mülakat Sonuçları</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sonuçları inceleyin</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
