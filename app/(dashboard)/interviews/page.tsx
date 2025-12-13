"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Users, User, Calendar, Award, Search, Filter, X, Video, FileText } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface InterviewAttempt {
  id: string;
  aiScore: number | null;
  aiFeedback: any;
  questionScores: any;
  questionFeedback: any;
  completedAt: string;
  videoUrl: string | null;
  transcript: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    profileImage: string | null;
  };
  interview: {
    id: string;
    title: string;
    type: string | null;
    difficulty: string | null;
  };
}

export default function InterviewsPage() {
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId");
  
  const [interviews, setInterviews] = useState<InterviewAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(userIdParam || "");
  const [minScore, setMinScore] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      if (minScore) params.append("minScore", minScore);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const response = await fetch(`/api/interviews?${params.toString()}`);
      const data = await response.json();
      setInterviews(data.interviewAttempts || []);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setUserId("");
    setMinScore("");
    setDateFrom("");
    setDateTo("");
    fetchInterviews();
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
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
          Mülakat Sonuçları
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tüm kullanıcıların mülakat sonuçlarını görüntüleyin
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Arama ve Filtreleme
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Filtreleri Gizle" : "Filtreleri Göster"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Kullanıcı ID veya email ile ara..."
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && fetchInterviews()}
                />
              </div>
              <Button onClick={fetchInterviews} variant="gradient">
                <Search className="h-4 w-4 mr-2" />
                Ara
              </Button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Input
                  label="Minimum Skor"
                  type="number"
                  placeholder="0-100"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                />
                <Input
                  label="Başlangıç Tarihi"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <Input
                  label="Bitiş Tarihi"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={fetchInterviews} variant="primary">
                    Filtrele
                  </Button>
                  <Button onClick={clearFilters} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Temizle
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {interviews.map((interview) => (
          <Card key={interview.id} variant="elevated" hover>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    {interview.user.profileImage ? (
                      <img
                        src={interview.user.profileImage}
                        alt={interview.user.name || "User"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">
                      {interview.interview.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {interview.user.name || interview.user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(interview.completedAt), "dd MMMM yyyy HH:mm", { locale: tr })}
                      </div>
                      {interview.interview.type && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                          {interview.interview.type}
                        </span>
                      )}
                      {interview.interview.difficulty && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded text-xs">
                          {interview.interview.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  {interview.aiScore !== null && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {interview.aiScore}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">/100</div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link href={`/dashboard/interviews/${interview.id}`}>
                  <Button variant="gradient">
                    Detayları Görüntüle
                  </Button>
                </Link>
                <Link href={`/dashboard/cv-pool?userId=${interview.user.id}`}>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    CV'sini Gör
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {interviews.length === 0 && (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Mülakat sonucu bulunamadı. Filtreleri değiştirip tekrar deneyin.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
