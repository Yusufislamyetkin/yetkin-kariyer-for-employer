"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Search, User, FileText, Award, TrendingUp, BarChart3, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

interface MatchResult {
  userId: string;
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
  matchScore: number;
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    testScore: number;
    interviewScore: number;
    leaderboardScore: number;
  };
  testStats: {
    averageScore: number;
    totalTests: number;
    highestScore: number;
  };
  interviewStats: {
    averageScore: number;
    totalInterviews: number;
    highestScore: number;
  };
  leaderboardStats: {
    points: number;
    averageScore: number;
    rank: number | null;
  };
}

interface MatchResponse {
  matches: MatchResult[];
  totalCandidates: number;
  matchedCandidates: number;
}

export default function CandidateMatcherPage() {
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async () => {
    if (!jobText.trim() || jobText.trim().length < 10) {
      setError("İş ilanı metni en az 10 karakter olmalıdır");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/candidate-matcher/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Eşleştirme başarısız oldu");
      }

      const data: MatchResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Aday Eşleştirme
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            İş ilanı metnini yapıştırın, sistem en uygun adayları bulacak
          </p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            İş İlanı Metni
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              İş ilanı açıklamasını buraya yapıştırın
            </label>
            <textarea
              value={jobText}
              onChange={(e) => {
                setJobText(e.target.value);
                setError(null);
              }}
              placeholder="Örnek: Senior Frontend Developer arıyoruz. React, TypeScript, Node.js bilgisi gereklidir. 3+ yıl deneyim şarttır..."
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {jobText.length} karakter
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            onClick={handleMatch}
            variant="gradient"
            isLoading={loading}
            disabled={loading || !jobText.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Aranıyor...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Uygun Adayı Bul
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Eşleştirme Sonuçları</CardTitle>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {results.matchedCandidates} / {results.totalCandidates} aday eşleşti
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {results.matches.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Bu iş ilanı için uygun aday bulunamadı
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.matches.map((match) => (
                    <Card key={match.userId} variant="glass" hover>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* User Info */}
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                              {match.user.profileImage ? (
                                <img
                                  src={match.user.profileImage}
                                  alt={match.user.name || "User"}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-8 w-8 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                {match.user.name || match.user.email}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {match.user.email}
                              </p>

                              {/* Match Score */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Uyum Skoru
                                  </span>
                                  <span className={`text-2xl font-bold ${getScoreColor(match.matchScore)}`}>
                                    {match.matchScore}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full transition-all ${getScoreBgColor(match.matchScore)}`}
                                    style={{ width: `${match.matchScore}%` }}
                                  />
                                </div>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      Test
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {Math.round(match.testStats.averageScore)}/100
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {match.testStats.totalTests} test
                                  </p>
                                </div>

                                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <User className="h-4 w-4 text-purple-600" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      Mülakat
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {Math.round(match.interviewStats.averageScore)}/100
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {match.interviewStats.totalInterviews} mülakat
                                  </p>
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      YTK Puanı
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {match.leaderboardStats.points}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Ort: {Math.round(match.leaderboardStats.averageScore)}/100
                                  </p>
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Award className="h-4 w-4 text-yellow-600" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      Sıralama
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {match.leaderboardStats.rank || "N/A"}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Leaderboard
                                  </p>
                                </div>
                              </div>

                              {/* Breakdown */}
                              <div className="mb-4">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Detaylı Skorlar:
                                </p>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Beceriler: </span>
                                    <span className="font-semibold">{match.breakdown.skillsMatch}%</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Deneyim: </span>
                                    <span className="font-semibold">{match.breakdown.experienceMatch}%</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Eğitim: </span>
                                    <span className="font-semibold">{match.breakdown.educationMatch}%</span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2">
                                <Link href={`/dashboard/cv-pool/${match.cv.id}`}>
                                  <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4 mr-2" />
                                    CV'yi Görüntüle
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/interviews?userId=${match.userId}`}>
                                  <Button variant="outline" size="sm">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Mülakat Sonuçları
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/top-users`}>
                                  <Button variant="outline" size="sm">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Profil
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
