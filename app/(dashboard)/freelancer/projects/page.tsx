"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Plus, FolderKanban, DollarSign, Calendar, Users, Search, Edit, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface FreelancerProject {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  deadline: string | null;
  status: string;
  createdAt: string;
  creator: {
    id: string;
    name: string | null;
    email: string;
    profileImage: string | null;
  };
  bids: Array<{
    id: string;
    amount: number;
    message: string;
    status: string;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      profileImage: string | null;
    };
  }>;
}

export default function FreelancerProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<FreelancerProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  });
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showMyProjects, setShowMyProjects] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, showMyProjects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (showMyProjects) params.append("createdBy", "me");

      const response = await fetch(`/api/freelancer/projects?${params.toString()}`);
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch("/api/freelancer/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProject,
          budget: newProject.budget ? parseFloat(newProject.budget) : null,
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewProject({
          title: "",
          description: "",
          budget: "",
          deadline: "",
        });
        fetchProjects();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Bu projeyi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/freelancer/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
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
            Freelancer Projeler
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Projeleri yönetin ve teklifleri görüntüleyin
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="gradient"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Proje
        </Button>
      </div>

      {showCreateForm && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Yeni Freelancer Projesi Oluştur</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <Input
                label="Proje Başlığı"
                placeholder="Örn: E-ticaret Web Sitesi Geliştirme"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  placeholder="Proje detayları ve gereksinimler"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  required
                  rows={6}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Bütçe (TL)"
                  type="number"
                  placeholder="50000"
                  value={newProject.budget}
                  onChange={(e) =>
                    setNewProject({ ...newProject, budget: e.target.value })
                  }
                />
                <Input
                  label="Son Tarih"
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) =>
                    setNewProject({ ...newProject, deadline: e.target.value })
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

      <div className="flex gap-4">
        <Button
          variant={statusFilter === "all" ? "primary" : "outline"}
          onClick={() => setStatusFilter("all")}
        >
          Tümü
        </Button>
        <Button
          variant={statusFilter === "open" ? "primary" : "outline"}
          onClick={() => setStatusFilter("open")}
        >
          Açık
        </Button>
        <Button
          variant={statusFilter === "in_progress" ? "primary" : "outline"}
          onClick={() => setStatusFilter("in_progress")}
        >
          Devam Ediyor
        </Button>
        <Button
          variant={statusFilter === "completed" ? "primary" : "outline"}
          onClick={() => setStatusFilter("completed")}
        >
          Tamamlanan
        </Button>
        <Button
          variant={showMyProjects ? "primary" : "outline"}
          onClick={() => setShowMyProjects(!showMyProjects)}
        >
          Sadece Benim Projelerim
        </Button>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id} variant="elevated" hover>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-xl mb-2">
                    <FolderKanban className="h-5 w-5 text-blue-600" />
                    {project.title}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {project.budget && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {project.budget.toLocaleString("tr-TR")} TL
                      </div>
                    )}
                    {project.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(project.deadline), "dd MMMM yyyy", { locale: tr })}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {project.bids.length} teklif
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === "open"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : project.status === "completed"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          : project.status === "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }`}
                    >
                      {project.status === "open"
                        ? "Açık"
                        : project.status === "completed"
                        ? "Tamamlandı"
                        : project.status === "cancelled"
                        ? "İptal"
                        : "Devam Ediyor"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link href={`/dashboard/freelancer/projects/${project.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {session?.user?.id && project.creator.id === session.user.id && (
                    <>
                      <Link href={`/dashboard/freelancer/projects/${project.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            {project.bids.length > 0 && (
              <CardContent>
                <div className="mb-3">
                  <h4 className="font-semibold mb-2">Teklifler ({project.bids.length})</h4>
                  <div className="space-y-2">
                    {project.bids.slice(0, 3).map((bid) => (
                      <div
                        key={bid.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            {bid.user.profileImage ? (
                              <img
                                src={bid.user.profileImage}
                                alt={bid.user.name || "User"}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {bid.user.name || bid.user.email}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {bid.amount.toLocaleString("tr-TR")} TL
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            bid.status === "accepted"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : bid.status === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }`}
                        >
                          {bid.status === "accepted"
                            ? "Kabul"
                            : bid.status === "rejected"
                            ? "Reddedildi"
                            : "Beklemede"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link href={`/dashboard/freelancer/projects/${project.id}`}>
                  <Button variant="ghost" className="w-full">
                    Tüm Teklifleri Görüntüle
                  </Button>
                </Link>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Henüz proje yok. Yeni bir proje oluşturmak için yukarıdaki butona tıklayın.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
