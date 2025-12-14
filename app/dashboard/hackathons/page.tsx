"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Trophy, Calendar, Users, Plus, Eye, Edit, Trash2, Rocket } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Hackathon {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  bannerUrl: string | null;
  phase: string;
  applicationOpensAt: string;
  applicationClosesAt: string;
  submissionOpensAt: string;
  submissionClosesAt: string;
  tags: string[];
  prizesSummary: string | null;
  organizer: {
    id: string;
    name: string | null;
    profileImage: string | null;
  };
  _count: {
    applications: number;
    teams: number;
    submissions: number;
  };
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newHackathon, setNewHackathon] = useState({
    slug: "",
    title: "",
    description: "",
    applicationOpensAt: "",
    applicationClosesAt: "",
    submissionOpensAt: "",
    submissionClosesAt: "",
    tags: "",
    prizesSummary: "",
  });
  const [creating, setCreating] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [showMyHackathons, setShowMyHackathons] = useState(false);

  useEffect(() => {
    fetchHackathons();
  }, [phaseFilter, showMyHackathons]);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (phaseFilter !== "all") params.append("phase", phaseFilter);
      if (showMyHackathons) params.append("organizerId", "me");

      const response = await fetch(`/api/hackathons?${params.toString()}`);
      const data = await response.json();
      setHackathons(data.hackathons || []);
    } catch (error) {
      console.error("Error fetching hackathons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch("/api/hackathons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newHackathon,
          tags: newHackathon.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewHackathon({
          slug: "",
          title: "",
          description: "",
          applicationOpensAt: "",
          applicationClosesAt: "",
          submissionOpensAt: "",
          submissionClosesAt: "",
          tags: "",
          prizesSummary: "",
        });
        fetchHackathons();
      }
    } catch (error) {
      console.error("Error creating hackathon:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteHackathon = async (hackathonId: string) => {
    if (!confirm("Bu hackathon'u silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchHackathons();
      }
    } catch (error) {
      console.error("Error deleting hackathon:", error);
    }
  };

  const getPhaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      draft: "Taslak",
      upcoming: "Yaklaşan",
      applications: "Başvurular Açık",
      submission: "Proje Dönemi",
      judging: "Değerlendirme",
      completed: "Tamamlandı",
      archived: "Arşiv",
    };
    return labels[phase] || phase;
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
            Hackathon'lar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Hackathon'ları yönetin ve başvuruları görüntüleyin
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="gradient"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Hackathon
        </Button>
      </div>

      {showCreateForm && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Yeni Hackathon Oluştur</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateHackathon} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Slug (URL için)"
                  placeholder="my-hackathon-2024"
                  value={newHackathon.slug}
                  onChange={(e) => setNewHackathon({ ...newHackathon, slug: e.target.value })}
                  required
                />
                <Input
                  label="Başlık"
                  placeholder="Hackathon Başlığı"
                  value={newHackathon.title}
                  onChange={(e) => setNewHackathon({ ...newHackathon, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  placeholder="Hackathon detayları"
                  value={newHackathon.description}
                  onChange={(e) =>
                    setNewHackathon({ ...newHackathon, description: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Başvuru Başlangıç"
                  type="datetime-local"
                  value={newHackathon.applicationOpensAt}
                  onChange={(e) =>
                    setNewHackathon({ ...newHackathon, applicationOpensAt: e.target.value })
                  }
                  required
                />
                <Input
                  label="Başvuru Bitiş"
                  type="datetime-local"
                  value={newHackathon.applicationClosesAt}
                  onChange={(e) =>
                    setNewHackathon({ ...newHackathon, applicationClosesAt: e.target.value })
                  }
                  required
                />
                <Input
                  label="Teslim Başlangıç"
                  type="datetime-local"
                  value={newHackathon.submissionOpensAt}
                  onChange={(e) =>
                    setNewHackathon({ ...newHackathon, submissionOpensAt: e.target.value })
                  }
                  required
                />
                <Input
                  label="Teslim Bitiş"
                  type="datetime-local"
                  value={newHackathon.submissionClosesAt}
                  onChange={(e) =>
                    setNewHackathon({ ...newHackathon, submissionClosesAt: e.target.value })
                  }
                  required
                />
              </div>
              <Input
                label="Etiketler (virgülle ayrılmış)"
                placeholder="react, nodejs, fullstack"
                value={newHackathon.tags}
                onChange={(e) =>
                  setNewHackathon({ ...newHackathon, tags: e.target.value })
                }
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ödül Özeti
                </label>
                <textarea
                  placeholder="Ödül bilgileri"
                  value={newHackathon.prizesSummary}
                  onChange={(e) =>
                    setNewHackathon({ ...newHackathon, prizesSummary: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="flex gap-4">
        <Button
          variant={phaseFilter === "all" ? "primary" : "outline"}
          onClick={() => setPhaseFilter("all")}
        >
          Tümü
        </Button>
        <Button
          variant={phaseFilter === "upcoming" ? "primary" : "outline"}
          onClick={() => setPhaseFilter("upcoming")}
        >
          Yaklaşan
        </Button>
        <Button
          variant={phaseFilter === "applications" ? "primary" : "outline"}
          onClick={() => setPhaseFilter("applications")}
        >
          Başvurular Açık
        </Button>
        <Button
          variant={phaseFilter === "submission" ? "primary" : "outline"}
          onClick={() => setPhaseFilter("submission")}
        >
          Proje Dönemi
        </Button>
        <Button
          variant={phaseFilter === "completed" ? "primary" : "outline"}
          onClick={() => setPhaseFilter("completed")}
        >
          Tamamlanan
        </Button>
        <Button
          variant={showMyHackathons ? "primary" : "outline"}
          onClick={() => setShowMyHackathons(!showMyHackathons)}
        >
          Sadece Benim Hackathon'larım
        </Button>
      </div>

      <div className="grid gap-6">
        {hackathons.map((hackathon) => (
          <Card key={hackathon.id} variant="elevated" hover>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-xl mb-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    {hackathon.title}
                  </CardTitle>
                  {hackathon.description && (
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {hackathon.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Başvuru: {format(new Date(hackathon.applicationOpensAt), "dd MMM yyyy", { locale: tr })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {hackathon._count?.applications || 0} başvuru
                    </div>
                    <div className="flex items-center gap-1">
                      <Rocket className="h-4 w-4" />
                      {hackathon._count?.submissions || 0} proje
                    </div>
                    {hackathon.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {hackathon.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        hackathon.phase === "completed"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                          : hackathon.phase === "applications"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : hackathon.phase === "submission"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      }`}
                    >
                      {getPhaseLabel(hackathon.phase)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link href={`/dashboard/hackathons/${hackathon.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            {hackathon._count && (hackathon._count.applications > 0 || hackathon._count.submissions > 0) && (
              <CardContent>
                <Link href={`/dashboard/hackathons/${hackathon.id}`}>
                  <Button variant="ghost" className="w-full">
                    Detayları Görüntüle ({hackathon._count.applications} başvuru, {hackathon._count.submissions} proje)
                  </Button>
                </Link>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {hackathons.length === 0 && (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Henüz hackathon yok. Yeni bir hackathon oluşturmak için yukarıdaki butona tıklayın.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
