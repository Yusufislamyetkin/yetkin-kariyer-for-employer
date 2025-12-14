"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Trophy, User, Award, TrendingUp, Medal, Star } from "lucide-react";

interface TopUser {
  rank: number;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    profileImage: string | null;
  };
  points: number;
  averageScore: number;
  highestScore: number;
  quizCount: number;
  displayedBadges: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    rarity: string;
  }>;
}

export default function TopUsersPage() {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>("monthly");
  const [minScore, setMinScore] = useState<string>("");

  useEffect(() => {
    fetchTopUsers();
  }, [period, minScore]);

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("period", period);
      if (minScore) params.append("minScore", minScore);

      const response = await fetch(`/api/top-users?${params.toString()}`);
      const data = await response.json();
      setTopUsers(data.topUsers || []);
    } catch (error) {
      console.error("Error fetching top users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
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
          Başarılı Kullanıcılar
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Puan sıralamasına göre en başarılı kullanıcılar
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtreler</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={period === "daily" ? "primary" : "outline"}
                size="sm"
                onClick={() => setPeriod("daily")}
              >
                Günlük
              </Button>
              <Button
                variant={period === "weekly" ? "primary" : "outline"}
                size="sm"
                onClick={() => setPeriod("weekly")}
              >
                Haftalık
              </Button>
              <Button
                variant={period === "monthly" ? "primary" : "outline"}
                size="sm"
                onClick={() => setPeriod("monthly")}
              >
                Aylık
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Minimum skor (0-100)"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {topUsers.map((user) => (
          <Card key={user.userId} variant="elevated" hover>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12">
                  {getRankIcon(user.rank)}
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  {user.user.profileImage ? (
                    <img
                      src={user.user.profileImage}
                      alt={user.user.name || "User"}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl mb-2">
                    {user.user.name || user.user.email}
                  </CardTitle>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">{user.points} puan</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Ortalama: {Math.round(user.averageScore)}/100
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      En Yüksek: {user.highestScore}/100
                    </div>
                    <div>
                      {user.quizCount} test
                    </div>
                  </div>
                  {user.displayedBadges.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {user.displayedBadges.map((badge) => (
                        <div
                          key={badge.id}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                          title={badge.name}
                        >
                          <span>{badge.icon}</span>
                          <span className="hidden sm:inline">{badge.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/cv-pool?userId=${user.userId}`}>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      CV
                    </Button>
                  </Link>
                  <Link href={`/dashboard/interviews?userId=${user.userId}`}>
                    <Button variant="outline" size="sm">
                      Mülakatlar
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {topUsers.length === 0 && (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Başarılı kullanıcı bulunamadı.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
