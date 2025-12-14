"use client";

import { useEffect, useState } from "react";
import { Briefcase, MessageSquare, Clock, Trophy, FileText, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import Image from "next/image";
import Link from "next/link";

interface Activity {
  id: string;
  type: "application" | "interview" | "ai_interview" | "job_created" | "hackathon_created" | "freelancer_project_created";
  title: string;
  score?: number;
  date: Date | string;
  icon: string;
  timeAgo: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    profileImage?: string | null;
  } | null;
  link?: string;
}

interface ActivityTimelineProps {
  title?: string;
  limit?: number;
}

const activityIcons = {
  application: Briefcase,
  interview: MessageSquare,
  ai_interview: Sparkles,
  job_created: FileText,
  hackathon_created: Trophy,
  freelancer_project_created: FileText,
};

const activityColors = {
  application: "from-blue-500 to-indigo-500",
  interview: "from-purple-500 to-pink-500",
  ai_interview: "from-cyan-500 to-blue-500",
  job_created: "from-green-500 to-emerald-500",
  hackathon_created: "from-yellow-500 to-orange-500",
  freelancer_project_created: "from-indigo-500 to-purple-500",
};

export function ActivityTimeline({ title = "Son Aktiviteler", limit = 10 }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [limit]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/activities?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card variant="elevated" className="h-full">
        <CardHeader className="pt-8">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card variant="elevated" className="h-full">
        <CardHeader className="pt-8">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Henüz aktivite bulunmuyor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="h-full">
      <CardHeader className="pt-8">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Clock className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Son {activities.length} aktivite
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-30" />

          <div className="space-y-4 pt-2">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type] || "from-gray-500 to-gray-600";
              const isEmoji = activity.icon && /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(activity.icon);
              const profileUrl = activity.userId ? `/dashboard/top-users` : null;

              const content = (
                <div className="relative flex gap-4">
                  {/* Timeline dot - Profile Image or Icon */}
                  <div className="relative z-10 flex-shrink-0 pt-2">
                    {activity.user?.profileImage ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-lg ring-2 ring-gray-200 dark:ring-gray-700">
                        <Image
                          src={activity.user.profileImage}
                          alt={activity.user.name || "User"}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900`}
                      >
                        {isEmoji ? (
                          <span className="text-2xl">{activity.icon}</span>
                        ) : (
                          Icon && <Icon className="w-6 h-6 text-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 pb-4">
                    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {activity.user ? (
                              <>
                                <span className="font-bold">{activity.user.name}</span>
                                <span className="text-gray-500 dark:text-gray-400"> - </span>
                                <span>{activity.title}</span>
                              </>
                            ) : (
                              <>
                                {isEmoji && <span className="mr-2">{activity.icon}</span>}
                                {activity.title}
                              </>
                            )}
                          </p>
                          {activity.score !== undefined && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Skor: {activity.score}%
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{activity.timeAgo}</span>
                        </div>
                      </div>
                      {activity.link && (
                        <Link href={activity.link}>
                          <button className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                            Detayları Gör →
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );

              return profileUrl ? (
                <Link key={activity.id} href={profileUrl}>
                  {content}
                </Link>
              ) : (
                <div key={activity.id}>{content}</div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
