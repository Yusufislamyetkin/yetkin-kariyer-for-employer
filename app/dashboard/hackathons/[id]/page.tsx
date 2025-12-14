import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import { Trophy, Calendar, Users, Rocket, ArrowLeft, User, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function HackathonDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "employer") {
    redirect("/login");
  }

  const hackathon = await db.hackathon.findUnique({
    where: { id: params.id },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          profileImage: true,
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
          team: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      },
      teams: {
        include: {
          members: {
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
          },
        },
      },
      submissions: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!hackathon) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Hackathon bulunamadı</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <Link href="/dashboard/hackathons">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
      </Link>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-2xl mb-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                {hackathon.title}
              </CardTitle>
              {hackathon.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {hackathon.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mt-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Başvuru: {format(new Date(hackathon.applicationOpensAt), "dd MMMM yyyy", { locale: tr })}
                </div>
                <div className="flex items-center gap-1">
                  <Rocket className="h-4 w-4" />
                  Teslim: {format(new Date(hackathon.submissionClosesAt), "dd MMMM yyyy", { locale: tr })}
                </div>
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
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {hackathon.prizesSummary && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Ödüller</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {hackathon.prizesSummary}
              </p>
            </div>
          )}

          {hackathon.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Etiketler</h3>
              <div className="flex flex-wrap gap-2">
                {hackathon.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Başvurular ({hackathon.applications.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {hackathon.applications.map((application: any) => (
                  <div
                    key={application.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        {application.user.profileImage ? (
                          <img
                            src={application.user.profileImage}
                            alt={application.user.name || "User"}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {application.user.name || application.user.email}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {format(new Date(application.appliedAt), "dd MMMM yyyy", { locale: tr })}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          application.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : application.status === "rejected"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        }`}
                      >
                        {application.status === "approved"
                          ? "Onaylandı"
                          : application.status === "rejected"
                          ? "Reddedildi"
                          : "Beklemede"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Projeler ({hackathon.submissions.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {hackathon.submissions.map((submission: any) => (
                  <div
                    key={submission.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {submission.title || "İsimsiz Proje"}
                        </p>
                        {submission.repoUrl && (
                          <a
                            href={submission.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Repo'yu Görüntüle
                          </a>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          submission.status === "winner"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : submission.status === "finalist"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {submission.status === "winner"
                          ? "Kazanan"
                          : submission.status === "finalist"
                          ? "Finalist"
                          : "Gönderildi"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
