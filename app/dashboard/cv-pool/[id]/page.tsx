import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import { FileText, User, Mail, ArrowLeft, Download, Calendar, Award, Briefcase, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function CVDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "employer") {
    redirect("/login");
  }

  const cv = await db.cV.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          createdAt: true,
        },
      },
      template: {
        select: {
          id: true,
          name: true,
        },
      },
      uploads: {
        select: {
          id: true,
          url: true,
          name: true,
          mimeType: true,
        },
      },
    },
  });

  if (!cv) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">CV bulunamadı</p>
      </div>
    );
  }

  const cvData = cv.data as any;
  const personalInfo = cvData?.personalInfo || {};
  const summary = cvData?.summary || "";
  const experience = cvData?.experience || [];
  const education = cvData?.education || [];
  const skills = cvData?.skills || [];
  const certifications = cvData?.certifications || [];

  // Get user's test scores
  const testAttempts = await db.testAttempt.findMany({
    where: { userId: cv.userId },
    select: {
      metrics: true,
      completedAt: true,
      quiz: {
        select: {
          title: true,
          topic: true,
          level: true,
        },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 10,
  });

  // Calculate average score
  const scores = testAttempts
    .map((attempt: any) => {
      const metrics = attempt.metrics as any;
      return metrics?.score || 0;
    })
    .filter((score: number) => score > 0);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
    : 0;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/cv-pool">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main CV Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  {cv.user.profileImage ? (
                    <img
                      src={cv.user.profileImage}
                      alt={cv.user.name || "User"}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {personalInfo.name || cv.user.name || "İsimsiz Kullanıcı"}
                  </CardTitle>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {personalInfo.email || cv.user.email}
                    </div>
                    {personalInfo.phone && (
                      <div className="flex items-center gap-1">
                        <span>{personalInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                {cv.uploads.length > 0 && (
                  <a href={cv.uploads[0].url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      PDF İndir
                    </Button>
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {summary && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Özet</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {summary}
                  </p>
                </div>
              )}

              {Array.isArray(experience) && experience.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Deneyim
                  </h3>
                  <div className="space-y-4">
                    {experience.map((exp: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-blue-500 pl-4">
                        <h4 className="font-semibold">{exp.title || exp.position}</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {exp.company || exp.employer}
                        </p>
                        {exp.period && (
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {exp.period}
                          </p>
                        )}
                        {exp.description && (
                          <p className="text-gray-700 dark:text-gray-300 mt-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(education) && education.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Eğitim
                  </h3>
                  <div className="space-y-3">
                    {education.map((edu: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-green-500 pl-4">
                        <h4 className="font-semibold">{edu.degree || edu.school}</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {edu.school || edu.university}
                        </p>
                        {edu.year && (
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {edu.year}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(skills) && skills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Yetenekler</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: any, idx: number) => {
                      const skillName = typeof skill === "string" ? skill : skill.name || skill.technology || "";
                      return (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm font-medium"
                        >
                          {skillName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {Array.isArray(certifications) && certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Sertifikalar
                  </h3>
                  <div className="space-y-2">
                    {certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span>{cert.name || cert.title}</span>
                        {cert.issuer && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            - {cert.issuer}
                          </span>
                        )}
                      </div>
                    ))}
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium">{cv.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Üyelik Tarihi</p>
                <p className="font-medium">
                  {format(new Date(cv.user.createdAt), "dd MMMM yyyy", { locale: tr })}
                </p>
              </div>
              <Link href={`/dashboard/interviews?userId=${cv.user.id}`}>
                <Button variant="outline" className="w-full">
                  Mülakat Sonuçlarını Gör
                </Button>
              </Link>
            </CardContent>
          </Card>

          {testAttempts.length > 0 && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Test Skorları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ortalama Skor</p>
                  <p className="text-2xl font-bold text-blue-600">{avgScore}/100</p>
                </div>
                <div className="space-y-2">
                  {testAttempts.slice(0, 5).map((attempt: any, idx: number) => {
                    const metrics = attempt.metrics as any;
                    const score = metrics?.score || 0;
                    return (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400 truncate">
                          {attempt.quiz?.title || "Test"}
                        </span>
                        <span className="font-semibold">{score}/100</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
