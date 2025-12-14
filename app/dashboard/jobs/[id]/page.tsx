import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import { Briefcase, MapPin, DollarSign, Calendar, Users, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { MatchedCandidatesSection } from "./_components/MatchedCandidatesSection";

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "employer") {
    redirect("/login");
  }

  const job = await db.job.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      employerId: true,
      title: true,
      description: true,
      requirements: true,
      location: true,
      salary: true,
      status: true,
      createdAt: true,
      matchedCandidatesCache: true,
      matchingStatus: true,
      employer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      applications: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">İlan bulunamadı</p>
      </div>
    );
  }

  if (job.employerId !== session.user?.id) {
    redirect("/dashboard/jobs");
  }

  const requirements = job.requirements as any;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/jobs">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
      </Link>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl mb-2">
                <Briefcase className="h-6 w-6 text-blue-600" />
                {job.title}
              </CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mt-4">
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
                  <Calendar className="h-4 w-4" />
                  {format(new Date(job.createdAt), "dd MMMM yyyy", { locale: tr })}
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
            <Link href={`/dashboard/jobs/${job.id}/edit`}>
              <Button variant="outline">Düzenle</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Açıklama</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {requirements && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Gereksinimler</h3>
              {Array.isArray(requirements) ? (
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {requirements.map((req: string, idx: number) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {JSON.stringify(requirements, null, 2)}
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">
                Başvurular ({job.applications.length})
              </h3>
            </div>
            {job.applications.length > 0 ? (
              <Link href={`/dashboard/jobs/${job.id}/applications`}>
                <Button variant="gradient" className="w-full">
                  Tüm Başvuruları Görüntüle
                </Button>
              </Link>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Henüz başvuru yok.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Otomatik Önerilen Adaylar */}
      {job.status === "published" && (
        <MatchedCandidatesSection
          jobId={job.id}
          initialMatches={(job.matchedCandidatesCache as any) || []}
          initialStatus={job.matchingStatus || "idle"}
        />
      )}
    </div>
  );
}
