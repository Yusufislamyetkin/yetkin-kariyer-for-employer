"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { FileText, Plus, Edit, Trash2, Copy, Loader2 } from "lucide-react";
import Link from "next/link";

interface JobTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  requirements: any;
  location: string | null;
  salary: string | null;
}

export default function JobTemplatesPage() {
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<JobTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jobs/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let requirements = {};
      if (formData.requirements.trim()) {
        try {
          requirements = JSON.parse(formData.requirements);
        } catch {
          // If not valid JSON, treat as array
          requirements = formData.requirements.split(",").map((s) => s.trim());
        }
      }

      const url = editingTemplate
        ? `/api/jobs/templates/${editingTemplate.id}`
        : "/api/jobs/templates";
      const method = editingTemplate ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          requirements,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingTemplate(null);
        setFormData({
          name: "",
          title: "",
          description: "",
          requirements: "",
          location: "",
          salary: "",
        });
        fetchTemplates();
      } else {
        const data = await response.json();
        alert(data.error || "Şablon kaydedilemedi");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (template: JobTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      title: template.title,
      description: template.description,
      requirements:
        typeof template.requirements === "string"
          ? template.requirements
          : JSON.stringify(template.requirements, null, 2),
      location: template.location || "",
      salary: template.salary || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu şablonu silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/templates/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleUseTemplate = (template: JobTemplate) => {
    // Redirect to job creation with template data
    const params = new URLSearchParams({
      template: template.id,
    });
    window.location.href = `/dashboard/jobs?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
            İlan Şablonları
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sık kullandığınız ilanları şablon olarak kaydedin
          </p>
        </div>
        <Button variant="gradient" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Şablon
        </Button>
      </div>

      {showForm && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>
              {editingTemplate ? "Şablonu Düzenle" : "Yeni Şablon Oluştur"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Şablon Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Senior Developer Şablonu"
                required
              />
              <Input
                label="İlan Başlığı"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: Senior Full Stack Developer"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="İş tanımı ve detaylar"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gereksinimler (JSON veya virgülle ayrılmış)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm"
                  placeholder='["React", "Node.js", "TypeScript"] veya React, Node.js, TypeScript'
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Lokasyon"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="İstanbul, Türkiye"
                />
                <Input
                  label="Maaş"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="50.000 - 80.000 TL"
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="gradient" isLoading={saving}>
                  {editingTemplate ? "Güncelle" : "Oluştur"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTemplate(null);
                    setFormData({
                      name: "",
                      title: "",
                      description: "",
                      requirements: "",
                      location: "",
                      salary: "",
                    });
                  }}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} variant="elevated" hover>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {template.name}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 font-semibold mb-2">
                    {template.title}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {template.description}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Kullan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !showForm && (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Henüz şablon yok. Yeni bir şablon oluşturmak için yukarıdaki butona tıklayın.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
