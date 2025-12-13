"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import {
  User,
  FileText,
  BarChart3,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface MatchCandidate {
  userId: string;
  cvId: string;
  matchScore: number;
  breakdown: {
    aiScore: number;
    keywordScore: number;
    interviewScore: number;
    testScore: number;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    profileImage: string | null;
  };
}

interface MatchedCandidatesSectionProps {
  jobId: string;
  initialMatches?: MatchCandidate[];
  initialStatus?: string;
}

export function MatchedCandidatesSection({
  jobId,
  initialMatches = [],
  initialStatus = "idle",
}: MatchedCandidatesSectionProps) {
  const [matches, setMatches] = useState<MatchCandidate[]>(initialMatches);
  const [status, setStatus] = useState<string>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll for status updates when processing
  useEffect(() => {
    if (status === "processing" || (status === "idle" && initialMatches.length === 0)) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/jobs/${jobId}/match`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === "completed" && data.matches) {
              setMatches(data.matches);
              setStatus("completed");
              clearInterval(interval);
            } else if (data.status === "failed") {
              setStatus("failed");
              clearInterval(interval);
            } else {
              setStatus(data.status || "processing");
            }
          }
        } catch (err) {
          console.error("Error polling match status:", err);
        }
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [status, jobId, initialMatches.length]);

  const startMatching = async () => {
    setLoading(true);
    setError(null);
    setStatus("processing");

    try {
      const response = await fetch(`/api/jobs/${jobId}/match`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Eşleştirme başlatılamadı");
      }

      const data = await response.json();
      setStatus(data.status || "processing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>Otomatik Önerilen Adaylar</CardTitle>
          </div>
          {status === "processing" && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Eşleştirme devam ediyor...</span>
            </div>
          )}
          {status === "completed" && matches.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>{matches.length} aday bulundu</span>
            </div>
          )}
          {status === "failed" && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>Eşleştirme başarısız</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {status === "idle" && matches.length === 0 && (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Bu ilan için henüz otomatik eşleştirme yapılmadı.
            </p>
            <Button onClick={startMatching} variant="gradient" isLoading={loading}>
              <Sparkles className="h-4 w-4 mr-2" />
              Otomatik Eşleştirme Başlat
            </Button>
          </div>
        )}

        {status === "processing" && matches.length === 0 && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              CV havuzu analiz ediliyor ve en uygun adaylar bulunuyor...
            </p>
          </div>
        )}

        {status === "completed" && matches.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Bu ilan için uygun aday bulunamadı.
            </p>
            <Button onClick={startMatching} variant="outline" isLoading={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Yeniden Dene
            </Button>
          </div>
        )}

        {matches.length > 0 && (
          <div className="space-y-4">
            {status === "completed" && (
              <div className="flex justify-end mb-2">
                <Button
                  onClick={startMatching}
                  variant="outline"
                  size="sm"
                  isLoading={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yeniden Eşleştir
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {matches.map((match, index) => (
                <Card key={match.userId} variant="glass" hover>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          {match.user.profileImage ? (
                            <img
                              src={match.user.profileImage}
                              alt={match.user.name || "User"}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            #{index + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {match.user.name || match.user.email}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {match.user.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold ${getScoreColor(match.matchScore)}`}
                            >
                              {match.matchScore}%
                            </div>
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                              <div
                                className={`h-2 rounded-full transition-all ${getScoreBgColor(match.matchScore)}`}
                                style={{ width: `${match.matchScore}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">AI: </span>
                            <span className="font-semibold">{match.breakdown.aiScore}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Keyword: </span>
                            <span className="font-semibold">{match.breakdown.keywordScore}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Mülakat: </span>
                            <span className="font-semibold">{match.breakdown.interviewScore}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Test: </span>
                            <span className="font-semibold">{match.breakdown.testScore}%</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link href={`/dashboard/cv-pool/${match.cvId}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3 mr-1" />
                              CV
                            </Button>
                          </Link>
                          <Link href={`/dashboard/interviews?userId=${match.userId}`}>
                            <Button variant="outline" size="sm">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Mülakat
                            </Button>
                          </Link>
                          <Link href={`/dashboard/top-users`}>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Profil
                            </Button>
                          </Link>
                        </div>
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
  );
}
