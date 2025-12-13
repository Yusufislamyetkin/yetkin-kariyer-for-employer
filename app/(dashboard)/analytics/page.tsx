"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { BarChart3, Users, Briefcase, Trophy, TrendingUp, FileText, Download } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  totalJobs: number;
  totalApplications: number;
  totalCVs: number;
  totalInterviews: number;
  totalHackathons: number;
  totalFreelancerProjects: number;
  applicationsByStatus: Record<string, number>;
  jobsByStatus: Record<string, number>;
  topSkills: Array<{ skill: string; count: number }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics");
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Analitik veriler yüklenemedi</p>
      </div>
    );
  }

  const applicationsChartData = {
    labels: Object.keys(data.applicationsByStatus),
    datasets: [
      {
        label: "Başvurular",
        data: Object.values(data.applicationsByStatus),
        backgroundColor: [
          "rgba(59, 130, 246, 0.5)",
          "rgba(16, 185, 129, 0.5)",
          "rgba(239, 68, 68, 0.5)",
          "rgba(245, 158, 11, 0.5)",
        ],
      },
    ],
  };

  const jobsChartData = {
    labels: Object.keys(data.jobsByStatus),
    datasets: [
      {
        label: "İlanlar",
        data: Object.values(data.jobsByStatus),
        backgroundColor: [
          "rgba(59, 130, 246, 0.5)",
          "rgba(16, 185, 129, 0.5)",
          "rgba(107, 114, 128, 0.5)",
        ],
      },
    ],
  };

  const topSkillsData = {
    labels: data.topSkills.slice(0, 10).map((s) => s.skill),
    datasets: [
      {
        label: "Kullanım Sayısı",
        data: data.topSkills.slice(0, 10).map((s) => s.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.5)",
          "rgba(139, 92, 246, 0.5)",
          "rgba(236, 72, 153, 0.5)",
          "rgba(34, 197, 94, 0.5)",
          "rgba(251, 191, 36, 0.5)",
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Platform istatistikleri ve analitik veriler
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              window.open("/api/export/analytics?format=csv", "_blank");
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV İndir
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.open("/api/export/analytics?format=json", "_blank");
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            JSON İndir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="elevated" hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Toplam İş İlanı</CardTitle>
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.totalJobs}
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Toplam Başvuru</CardTitle>
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.totalApplications}
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">CV Havuzu</CardTitle>
              <FileText className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.totalCVs}
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Mülakat Sonuçları</CardTitle>
              <Users className="h-5 w-5 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.totalInterviews}
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Hackathon'lar</CardTitle>
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.totalHackathons}
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Freelancer Projeler</CardTitle>
              <TrendingUp className="h-5 w-5 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.totalFreelancerProjects}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Başvurular Durum Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={applicationsChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              İlanlar Durum Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut
              data={jobsChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              En Çok Aranan Yetenekler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={topSkillsData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
