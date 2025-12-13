import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Award, Video, FileText, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function InterviewDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "employer") {
    redirect("/login");
  }

  const interviewAttempt = await db.interviewAttempt.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
      interview: {
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          difficulty: true,
          questions: true,
        },
      },
    },
  });

  if (!interviewAttempt) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Mülakat sonucu bulunamadı</p>
      </div>
    );
  }

  const questions = interviewAttempt.interview.questions as any;
  const questionScores = interviewAttempt.questionScores as any;
  const questionFeedback = interviewAttempt.questionFeedback as any;
  const aiFeedback = interviewAttempt.aiFeedback as any;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/interviews">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  {interviewAttempt.user.profileImage ? (
                    <img
                      src={interviewAttempt.user.profileImage}
                      alt={interviewAttempt.user.name || "User"}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {interviewAttempt.interview.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {interviewAttempt.user.name || interviewAttempt.user.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(interviewAttempt.completedAt), "dd MMMM yyyy HH:mm", { locale: tr })}
                    </div>
                  </div>
                </div>
                {interviewAttempt.aiScore !== null && (
                  <div className="text-right">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {interviewAttempt.aiScore}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">/100</div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {interviewAttempt.interview.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Açıklama</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {interviewAttempt.interview.description}
                  </p>
                </div>
              )}

              {aiFeedback && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    AI Değerlendirmesi
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    {typeof aiFeedback === "string" ? (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {aiFeedback}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {aiFeedback.strengths && (
                          <div>
                            <strong>Güçlü Yönler:</strong>
                            <ul className="list-disc list-inside ml-4">
                              {Array.isArray(aiFeedback.strengths) ? (
                                aiFeedback.strengths.map((s: string, idx: number) => (
                                  <li key={idx}>{s}</li>
                                ))
                              ) : (
                                <li>{aiFeedback.strengths}</li>
                              )}
                            </ul>
                          </div>
                        )}
                        {aiFeedback.weaknesses && (
                          <div>
                            <strong>Geliştirilmesi Gerekenler:</strong>
                            <ul className="list-disc list-inside ml-4">
                              {Array.isArray(aiFeedback.weaknesses) ? (
                                aiFeedback.weaknesses.map((w: string, idx: number) => (
                                  <li key={idx}>{w}</li>
                                ))
                              ) : (
                                <li>{aiFeedback.weaknesses}</li>
                              )}
                            </ul>
                          </div>
                        )}
                        {aiFeedback.recommendations && (
                          <div>
                            <strong>Öneriler:</strong>
                            <ul className="list-disc list-inside ml-4">
                              {Array.isArray(aiFeedback.recommendations) ? (
                                aiFeedback.recommendations.map((r: string, idx: number) => (
                                  <li key={idx}>{r}</li>
                                ))
                              ) : (
                                <li>{aiFeedback.recommendations}</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {Array.isArray(questions) && questions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Sorular ve Cevaplar</h3>
                  <div className="space-y-4">
                    {questions.map((question: any, idx: number) => {
                      const qId = question.id || idx.toString();
                      const score = questionScores?.[qId];
                      const feedback = questionFeedback?.[qId];
                      
                      return (
                        <div key={idx} className="border-l-2 border-blue-500 pl-4">
                          <h4 className="font-semibold mb-2">{question.question || question}</h4>
                          {score !== undefined && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Skor: {score}/100
                            </div>
                          )}
                          {feedback && (
                            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                              {typeof feedback === "string" ? (
                                feedback
                              ) : (
                                feedback.feedback || feedback.details || JSON.stringify(feedback)
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {interviewAttempt.transcript && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Transcript
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {interviewAttempt.transcript}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Kullanıcı Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">İsim</p>
                <p className="font-medium">{interviewAttempt.user.name || "İsimsiz"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium">{interviewAttempt.user.email}</p>
              </div>
              <Link href={`/dashboard/cv-pool?userId=${interviewAttempt.user.id}`}>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  CV'sini Görüntüle
                </Button>
              </Link>
            </CardContent>
          </Card>

          {interviewAttempt.videoUrl && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Kaydı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={interviewAttempt.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="gradient" className="w-full">
                    <Video className="h-4 w-4 mr-2" />
                    Videoyu İzle
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Mülakat Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {interviewAttempt.interview.type && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Tür: </span>
                  <span className="font-medium">{interviewAttempt.interview.type}</span>
                </div>
              )}
              {interviewAttempt.interview.difficulty && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Zorluk: </span>
                  <span className="font-medium">{interviewAttempt.interview.difficulty}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600 dark:text-gray-400">Tarih: </span>
                <span className="font-medium">
                  {format(new Date(interviewAttempt.completedAt), "dd MMMM yyyy HH:mm", { locale: tr })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
