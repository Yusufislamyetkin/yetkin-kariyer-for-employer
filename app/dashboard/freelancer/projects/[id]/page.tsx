import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import { FolderKanban, DollarSign, Calendar, Users, ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import AcceptBidButtonClient from "./_components/AcceptBidButtonClient";

export default async function FreelancerProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "employer") {
    redirect("/login");
  }

  const project = await db.freelancerProject.findUnique({
    where: { id: params.id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
      bids: {
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
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Proje bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/freelancer/projects">
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
                <FolderKanban className="h-6 w-6 text-blue-600" />
                {project.title}
              </CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mt-4">
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
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Açıklama</h3>
            <div 
              className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          </div>

          {project.bids.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teklifler ({project.bids.length})
              </h3>
              <div className="space-y-4">
                {project.bids.map((bid: any) => (
                  <Card key={bid.id} variant="outlined">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            {bid.user.profileImage ? (
                              <img
                                src={bid.user.profileImage}
                                alt={bid.user.name || "User"}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">
                              {bid.user.name || bid.user.email}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {bid.message}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {bid.amount.toLocaleString("tr-TR")} TL
                              </span>
                              <span className="text-gray-500">
                                {format(new Date(bid.createdAt), "dd MMMM yyyy", { locale: tr })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                          {project.status === "open" && bid.status === "pending" && (
                            <AcceptBidButtonClient
                              projectId={project.id}
                              bidId={bid.id}
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
