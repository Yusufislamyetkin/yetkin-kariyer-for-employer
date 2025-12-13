"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Plus, Briefcase, MapPin, DollarSign, Users, Edit, Trash2, Eye } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  salary: string | null;
  status: string;
  createdAt: string;
  applications: Array<{
    id: string;
    status: string;
    score: number | null;
    appliedAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
    status: "draft",
  });
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const url = statusFilter !== "all" 
        ? `/api/jobs?status=${statusFilter}`
        : "/api/jobs";
      const response = await fetch(url);
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newJob,
          requirements: newJob.requirements ? JSON.parse(newJob.requirements) : {},
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewJob({
          title: "",
          description: "",
          requirements: "",
          location: "",
          salary: "",
          status: "draft",
        });
        fetchJobs();
      }
    } catch (error) {
      console.error("Error creating job:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error("Error deleting job:", error);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
            İş İlanları
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            İlanlarınızı yönetin ve başvuruları görüntüleyin
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="gradient"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni İlan
        </Button>
      </div>

      {showCreateForm && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Yeni İlan Oluştur</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <Input
                label="İlan Başlığı"
                placeholder="Örn: Senior Full Stack Developer"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  placeholder="İş tanımı ve detaylar"
                  value={newJob.description}
                  onChange={(e) =>
                    setNewJob({ ...newJob, description: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gereksinimler (JSON formatında)
                </label>
                <textarea
                  placeholder='["React", "Node.js", "TypeScript"]'
                  value={newJob.requirements}
                  onChange={(e) =>
                    setNewJob({ ...newJob, requirements: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Lokasyon"
                  placeholder="İstanbul, Türkiye"
                  value={newJob.location}
                  onChange={(e) =>
                    setNewJob({ ...newJob, location: e.target.value })
                  }
                />
                <Input
                  label="Maaş"
                  placeholder="50.000 - 80.000 TL"
                  value={newJob.salary}
                  onChange={(e) =>
                    setNewJob({ ...newJob, salary: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="gradient" isLoading={creating}>
                  Oluştur
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 mb-6">
        <Button
          variant={statusFilter === "all" ? "primary" : "outline"}
          onClick={() => setStatusFilter("all")}
        >
          Tümü
        </Button>
        <Button
          variant={statusFilter === "published" ? "primary" : "outline"}
          onClick={() => setStatusFilter("published")}
        >
          Yayında
        </Button>
        <Button
          variant={statusFilter === "draft" ? "primary" : "outline"}
          onClick={() => setStatusFilter("draft")}
        >
          Taslak
        </Button>
        <Button
          variant={statusFilter === "closed" ? "primary" : "outline"}
          onClick={() => setStatusFilter("closed")}
        >
          Kapalı
        </Button>
      </div>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <Card key={job.id} variant="elevated" hover>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    {job.title}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {job.applications.length} başvuru
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : job.status === "closed"
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }`}
                    >
                      {job.status === "published"
                        ? "Yayında"
                        : job.status === "closed"
                        ? "Kapalı"
                        : "Taslak"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link href={`/dashboard/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/jobs/${job.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {job.applications.length > 0 && (
              <CardContent>
                <Link href={`/dashboard/jobs/${job.id}/applications`}>
                  <Button variant="ghost" className="w-full">
                    Başvuruları Görüntüle ({job.applications.length})
                  </Button>
                </Link>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {jobs.length === 0 && (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Henüz ilanınız yok. Yeni bir ilan oluşturmak için yukarıdaki butona tıklayın.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
