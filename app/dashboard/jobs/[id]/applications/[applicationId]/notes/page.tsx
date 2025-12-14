"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { ArrowLeft, Plus, Edit, Trash2, FileText, MessageSquare, Code, User } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Note {
  id: string;
  content: string;
  category: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  employer: {
    id: string;
    name: string | null;
  };
}

export default function ApplicationNotesPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const applicationId = params.applicationId as string;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    content: "",
    category: "general",
    isPrivate: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [applicationId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${jobId}/applications/${applicationId}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingNote
        ? `/api/jobs/${jobId}/applications/${applicationId}/notes/${editingNote.id}`
        : `/api/jobs/${jobId}/applications/${applicationId}/notes`;
      const method = editingNote ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingNote(null);
        setFormData({ content: "", category: "general", isPrivate: false });
        fetchNotes();
      } else {
        const data = await response.json();
        alert(data.error || "Not kaydedilemedi");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      content: note.content,
      category: note.category || "general",
      isPrivate: note.isPrivate,
    });
    setShowForm(true);
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Bu notu silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/jobs/${jobId}/applications/${applicationId}/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case "interview":
        return <User className="h-4 w-4" />;
      case "technical":
        return <Code className="h-4 w-4" />;
      case "communication":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryName = (category: string | null) => {
    switch (category) {
      case "interview":
        return "Mülakat";
      case "technical":
        return "Teknik";
      case "communication":
        return "İletişim";
      default:
        return "Genel";
    }
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
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/jobs/${jobId}/applications`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
            Başvuru Notları
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Başvuru hakkında notlar ekleyin ve yönetin
          </p>
        </div>
        <div className="ml-auto">
          <Button variant="gradient" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Not
          </Button>
        </div>
      </div>

      {showForm && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>
              {editingNote ? "Notu Düzenle" : "Yeni Not Ekle"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="general">Genel</option>
                  <option value="interview">Mülakat</option>
                  <option value="technical">Teknik</option>
                  <option value="communication">İletişim</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Not İçeriği
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Notunuzu buraya yazın..."
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isPrivate" className="text-sm text-gray-700 dark:text-gray-300">
                  Özel Not (sadece benim görebilirim)
                </label>
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="gradient" isLoading={saving}>
                  {editingNote ? "Güncelle" : "Kaydet"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNote(null);
                    setFormData({ content: "", category: "general", isPrivate: false });
                  }}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id} variant="elevated">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    {getCategoryIcon(note.category)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {getCategoryName(note.category)}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(note.createdAt), "dd MMMM yyyy HH:mm", { locale: tr })}
                      {note.isPrivate && (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded text-xs">
                          Özel
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(note)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {note.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {notes.length === 0 && !showForm && (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Henüz not yok. Yeni bir not eklemek için yukarıdaki butona tıklayın.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
