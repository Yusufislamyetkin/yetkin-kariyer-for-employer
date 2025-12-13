"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Users, User, Mail, FileText, CheckCircle, XCircle, Clock, ArrowLeft, CheckSquare, Square, Download } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Application {
  id: string;
  status: string;
  score: number | null;
  notes: string | null;
  appliedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    profileImage: string | null;
  };
  cv: {
    id: string;
    data: any;
  };
}

export default function JobApplicationsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${jobId}/applications`);
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchApplications();
        setSelectedApplications(new Set());
      }
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(filteredApplications.map((app) => app.id)));
    }
  };

  const handleSelectApplication = (applicationId: string) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      newSelected.add(applicationId);
    }
    setSelectedApplications(newSelected);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedApplications.size === 0) {
      return;
    }

    setBulkProcessing(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: Array.from(selectedApplications),
          status: bulkAction,
        }),
      });

      if (response.ok) {
        fetchApplications();
        setSelectedApplications(new Set());
        setBulkAction("");
      } else {
        const data = await response.json();
        alert(data.error || "Toplu işlem başarısız oldu");
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
      alert("Bir hata oluştu");
    } finally {
      setBulkProcessing(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (statusFilter === "all") return true;
    return app.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/jobs/${jobId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
            İş Başvuruları
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Toplam {applications.length} başvuru
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedApplications.size === filteredApplications.length && filteredApplications.length > 0
              ? "Seçimi Kaldır"
              : "Tümünü Seç"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.open(`/api/export/applications?jobId=${jobId}&format=csv`, "_blank");
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV İndir
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedApplications.size > 0 && (
        <Card variant="elevated" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedApplications.size} başvuru seçildi
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">İşlem Seçin</option>
                  <option value="accepted">Kabul Et</option>
                  <option value="rejected">Reddet</option>
                  <option value="reviewing">İncele</option>
                  <option value="pending">Beklemede</option>
                </select>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleBulkAction}
                  disabled={!bulkAction || bulkProcessing}
                  isLoading={bulkProcessing}
                >
                  Uygula
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedApplications(new Set());
                    setBulkAction("");
                  }}
                >
                  İptal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button
          variant={statusFilter === "all" ? "primary" : "outline"}
          onClick={() => setStatusFilter("all")}
        >
          Tümü ({applications.length})
        </Button>
        <Button
          variant={statusFilter === "pending" ? "primary" : "outline"}
          onClick={() => setStatusFilter("pending")}
        >
          Beklemede ({applications.filter((a) => a.status === "pending").length})
        </Button>
        <Button
          variant={statusFilter === "reviewing" ? "primary" : "outline"}
          onClick={() => setStatusFilter("reviewing")}
        >
          İnceleniyor ({applications.filter((a) => a.status === "reviewing").length})
        </Button>
        <Button
          variant={statusFilter === "accepted" ? "primary" : "outline"}
          onClick={() => setStatusFilter("accepted")}
        >
          Kabul ({applications.filter((a) => a.status === "accepted").length})
        </Button>
        <Button
          variant={statusFilter === "rejected" ? "primary" : "outline"}
          onClick={() => setStatusFilter("rejected")}
        >
          Reddedildi ({applications.filter((a) => a.status === "rejected").length})
        </Button>
      </div>

      <div className="grid gap-6">
        {filteredApplications.map((application) => (
          <Card key={application.id} variant="elevated" hover>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => handleSelectApplication(application.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    {selectedApplications.has(application.id) ? (
                      <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    {application.user.profileImage ? (
                      <img
                        src={application.user.profileImage}
                        alt={application.user.name || "User"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {application.user.name || "İsimsiz Kullanıcı"}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {application.user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(application.appliedAt), "dd MMMM yyyy", { locale: tr })}
                      </div>
                      {application.score !== null && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">Skor: {application.score}/100</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      application.status === "accepted"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : application.status === "rejected"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : application.status === "reviewing"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    }`}
                  >
                    {application.status === "accepted"
                      ? "Kabul"
                      : application.status === "rejected"
                      ? "Reddedildi"
                      : application.status === "reviewing"
                      ? "İnceleniyor"
                      : "Beklemede"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Link href={`/dashboard/cv-pool/${application.cv.id}`}>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    CV'yi Görüntüle
                  </Button>
                </Link>
                <Link href={`/dashboard/interviews?userId=${application.user.id}`}>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Mülakat Sonuçları
                  </Button>
                </Link>
                <Link href={`/dashboard/jobs/${jobId}/applications/${application.id}/notes`}>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Notlar
                  </Button>
                </Link>
              </div>
              <div className="flex gap-2">
                {application.status !== "accepted" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(application.id, "accepted")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Kabul Et
                  </Button>
                )}
                {application.status !== "rejected" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(application.id, "rejected")}
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                    Reddet
                  </Button>
                )}
                {application.status !== "reviewing" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(application.id, "reviewing")}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    İncele
                  </Button>
                )}
              </div>
              {application.notes && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Notlar:</strong> {application.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter === "all"
                ? "Henüz başvuru yok."
                : "Bu filtreye uygun başvuru bulunamadı."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
