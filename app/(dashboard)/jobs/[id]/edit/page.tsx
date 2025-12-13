"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { ArrowLeft, Save } from "lucide-react";

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
    status: "draft",
  });

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();
      if (data.job) {
        const requirements = data.job.requirements as any;
        setJob({
          title: data.job.title,
          description: data.job.description,
          requirements: Array.isArray(requirements)
            ? JSON.stringify(requirements, null, 2)
            : JSON.stringify(requirements || {}, null, 2),
          location: data.job.location || "",
          salary: data.job.salary || "",
          status: data.job.status,
        });
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...job,
          requirements: job.requirements ? JSON.parse(job.requirements) : {},
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/jobs/${jobId}`);
      }
    } catch (error) {
      console.error("Error updating job:", error);
    } finally {
      setSaving(false);
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
      <Link href={`/dashboard/jobs/${jobId}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
      </Link>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>İlanı Düzenle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="İlan Başlığı"
              value={job.title}
              onChange={(e) => setJob({ ...job, title: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama
              </label>
              <textarea
                value={job.description}
                onChange={(e) =>
                  setJob({ ...job, description: e.target.value })
                }
                required
                rows={6}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gereksinimler (JSON formatında)
              </label>
              <textarea
                value={job.requirements}
                onChange={(e) =>
                  setJob({ ...job, requirements: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Lokasyon"
                value={job.location}
                onChange={(e) =>
                  setJob({ ...job, location: e.target.value })
                }
              />
              <Input
                label="Maaş"
                value={job.salary}
                onChange={(e) =>
                  setJob({ ...job, salary: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durum
              </label>
              <select
                value={job.status}
                onChange={(e) =>
                  setJob({ ...job, status: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayında</option>
                <option value="closed">Kapalı</option>
              </select>
            </div>
            <div className="flex gap-4">
              <Button type="submit" variant="gradient" isLoading={saving}>
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </Button>
              <Link href={`/dashboard/jobs/${jobId}`}>
                <Button type="button" variant="outline">
                  İptal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
