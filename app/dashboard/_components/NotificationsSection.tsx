"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Bell, Check, CheckCheck, Trash2, Briefcase, Calendar, MessageSquare, X } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export function NotificationsSection() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "application":
        return <Briefcase className="h-4 w-4" />;
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "interview":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);
  const unreadCount = unreadNotifications.length;

  return (
    <Card variant="elevated" className="h-full">
      <CardHeader className="pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl">Bildirimler</CardTitle>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Yükleniyor...</p>
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Henüz bildirim yok</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 pt-5 rounded-xl border-2 transition-all duration-200 ${
                  notification.read
                    ? "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
                    : "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      notification.read
                        ? "bg-gray-200 dark:bg-gray-700"
                        : "bg-blue-100 dark:bg-blue-900/30"
                    }`}
                  >
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-sm font-semibold mb-1 ${
                        notification.read
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {format(new Date(notification.createdAt), "dd MMM yyyy HH:mm", {
                          locale: tr,
                        })}
                      </p>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            title="Okundu işaretle"
                          >
                            <Check className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                          title="Sil"
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                    {notification.link && (
                      <Link href={notification.link}>
                        <Button variant="ghost" size="sm" className="mt-2 text-xs h-7">
                          Detayları Gör
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {notifications.length > 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-2"
              >
                {showAll ? "Daha Az Göster" : `${notifications.length - 5} Daha Fazla Göster`}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
