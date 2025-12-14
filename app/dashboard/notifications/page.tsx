"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Bell, Check, CheckCheck, Trash2, Mail, Briefcase, Calendar, MessageSquare } from "lucide-react";
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

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
    if (!confirm("Bu bildirimi silmek istediğinize emin misiniz?")) {
      return;
    }

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
        return <Briefcase className="h-5 w-5" />;
      case "message":
        return <MessageSquare className="h-5 w-5" />;
      case "interview":
        return <Calendar className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : !n.read
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
            Bildirimler
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : "Tüm bildirimler okundu"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setFilter(filter === "all" ? "unread" : "all")}
          >
            {filter === "all" ? "Sadece Okunmamışlar" : "Tümü"}
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card variant="glass">
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {filter === "all" ? "Henüz bildirim yok" : "Okunmamış bildirim yok"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              variant={notification.read ? "elevated" : "elevated"}
              className={!notification.read ? "border-blue-500 dark:border-blue-400" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      notification.read
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "bg-blue-100 dark:bg-blue-900/20"
                    }`}
                  >
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-1 ${
                            notification.read
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {format(new Date(notification.createdAt), "dd MMMM yyyy HH:mm", {
                            locale: tr,
                          })}
                        </p>
                        {notification.link && (
                          <Link href={notification.link}>
                            <Button variant="ghost" size="sm" className="mt-2">
                              Detayları Gör
                            </Button>
                          </Link>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(notification.id)}
                            title="Okundu işaretle"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
