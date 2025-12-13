"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Calendar, Clock, User, Mail, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ScheduledInterview {
  id: string;
  candidateId: string;
  candidateName: string | null;
  candidateEmail: string;
  jobId: string | null;
  jobTitle: string | null;
  scheduledAt: string;
  notes: string | null;
  status: "scheduled" | "completed" | "cancelled";
}

export default function ScheduleInterviewPage() {
  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [formData, setFormData] = useState({
    candidateEmail: "",
    jobId: "",
    notes: "",
  });
  const [jobs, setJobs] = useState<Array<{ id: string; title: string }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInterviews();
    fetchJobs();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/interviews/schedule");
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`);
      const response = await fetch("/api/interviews/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateEmail: formData.candidateEmail,
          jobId: formData.jobId || null,
          scheduledAt: scheduledAt.toISOString(),
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ candidateEmail: "", jobId: "", notes: "" });
        fetchInterviews();
      } else {
        const data = await response.json();
        alert(data.error || "Mülakat planlanamadı");
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      alert("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (interviewId: string) => {
    if (!confirm("Bu mülakatı iptal etmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/interviews/schedule/${interviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchInterviews();
      }
    } catch (error) {
      console.error("Error cancelling interview:", error);
    }
  };

  const upcomingInterviews = interviews
    .filter((i) => i.status === "scheduled" && new Date(i.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const pastInterviews = interviews
    .filter((i) => i.status === "completed" || new Date(i.scheduledAt) < new Date())
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

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
            Mülakat Takvimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Mülakatları planlayın ve yönetin
          </p>
        </div>
        <Button variant="gradient" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Mülakat Planla
        </Button>
      </div>

      {showForm && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Yeni Mülakat Planla</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchedule} className="space-y-4">
              <Input
                label="Aday E-posta"
                type="email"
                value={formData.candidateEmail}
                onChange={(e) =>
                  setFormData({ ...formData, candidateEmail: e.target.value })
                }
                placeholder="aday@email.com"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İlan (Opsiyonel)
                </label>
                <select
                  value={formData.jobId}
                  onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">İlan seçin</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tarih
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Saat
                  </label>
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Mülakat hakkında notlar..."
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="gradient" isLoading={saving}>
                  Planla
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Interviews */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Yaklaşan Mülakatlar
        </h2>
        <div className="grid gap-4">
          {upcomingInterviews.map((interview) => (
            <Card key={interview.id} variant="elevated" hover>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">
                        {interview.candidateName || "İsimsiz Aday"}
                      </h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {interview.candidateEmail}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(interview.scheduledAt), "dd MMMM yyyy", { locale: tr })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {format(new Date(interview.scheduledAt), "HH:mm", { locale: tr })}
                      </div>
                      {interview.jobTitle && (
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          İlan: {interview.jobTitle}
                        </div>
                      )}
                      {interview.notes && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          {interview.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(interview.id)}
                  >
                    İptal Et
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {upcomingInterviews.length === 0 && (
            <Card variant="glass">
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Yaklaşan mülakat bulunmuyor
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Geçmiş Mülakatlar
          </h2>
          <div className="grid gap-4">
            {pastInterviews.slice(0, 10).map((interview) => (
              <Card key={interview.id} variant="elevated">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold">
                      {interview.candidateName || "İsimsiz Aday"}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        interview.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {interview.status === "completed" ? "Tamamlandı" : "İptal Edildi"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(interview.scheduledAt), "dd MMMM yyyy HH:mm", {
                      locale: tr,
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
