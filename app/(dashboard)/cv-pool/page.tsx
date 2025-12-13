"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { FileText, User, Mail, Search, Filter, X } from "lucide-react";

interface CV {
  id: string;
  data: any;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    profileImage: string | null;
  };
  template: {
    id: string;
    name: string;
  };
}

export default function CVPoolPage() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [technologyFilter, setTechnologyFilter] = useState("");
  const [minScore, setMinScore] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [educationFilter, setEducationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [useAdvanced, setUseAdvanced] = useState(false);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      setLoading(true);
      
      if (useAdvanced && (technologyFilter || minExperience || educationFilter)) {
        // Use advanced search
        const response = await fetch("/api/search/advanced", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "cv",
            filters: {
              skills: technologyFilter ? technologyFilter.split(",").map((s) => s.trim()) : [],
              minExperience: minExperience || undefined,
              education: educationFilter || undefined,
              minScore: minScore || undefined,
            },
          }),
        });
        const data = await response.json();
        setCvs(data.results || []);
      } else {
        // Use basic search
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (technologyFilter) params.append("technology", technologyFilter);
        if (minScore) params.append("minScore", minScore);

        const response = await fetch(`/api/cv-pool?${params.toString()}`);
        const data = await response.json();
        setCvs(data.cvs || []);
      }
    } catch (error) {
      console.error("Error fetching CVs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCVs();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTechnologyFilter("");
    setMinScore("");
    setMinExperience("");
    setEducationFilter("");
    setUseAdvanced(false);
    fetchCVs();
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
          CV Havuzu
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tüm kullanıcıların CV'lerini görüntüleyin ve filtreleyin
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
                  placeholder="İsim veya email ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} variant="gradient">
                <Search className="h-4 w-4 mr-2" />
                Ara
              </Button>
            </div>

            {showFilters && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useAdvanced"
                    checked={useAdvanced}
                    onChange={(e) => setUseAdvanced(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="useAdvanced" className="text-sm text-gray-700 dark:text-gray-300">
                    Gelişmiş Arama Kullan
                  </label>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Teknoloji/Yetenek"
                    placeholder={useAdvanced ? "React, Node.js, Python (virgülle ayırın)" : "Örn: React, Node.js, Python"}
                    value={technologyFilter}
                    onChange={(e) => setTechnologyFilter(e.target.value)}
                  />
                  <Input
                    label="Minimum Skor"
                    type="number"
                    placeholder="0-100"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                  />
                  {useAdvanced && (
                    <>
                      <Input
                        label="Minimum Deneyim (Pozisyon Sayısı)"
                        type="number"
                        placeholder="Örn: 2"
                        value={minExperience}
                        onChange={(e) => setMinExperience(e.target.value)}
                      />
                      <Input
                        label="Eğitim"
                        placeholder="Örn: Bilgisayar Mühendisliği"
                        value={educationFilter}
                        onChange={(e) => setEducationFilter(e.target.value)}
                      />
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSearch} variant="primary">
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
        {cvs.map((cv) => {
          const cvData = cv.data as any;
          const skills = cvData?.skills || [];
          const experience = cvData?.experience || [];

          return (
            <Card key={cv.id} variant="elevated" hover>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    {cv.user.profileImage ? (
                      <img
                        src={cv.user.profileImage}
                        alt={cv.user.name || "User"}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-2">
                      {cv.user.name || "İsimsiz Kullanıcı"}
                    </CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {cv.user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {cv.template.name}
                      </div>
                    </div>
                    {Array.isArray(skills) && skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {skills.slice(0, 5).map((skill: any, idx: number) => {
                          const skillName = typeof skill === "string" ? skill : skill.name || skill.technology || "";
                          return (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-xs font-medium"
                            >
                              {skillName}
                            </span>
                          );
                        })}
                        {skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                            +{skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Link href={`/dashboard/cv-pool/${cv.id}`}>
                    <Button variant="gradient">
                      CV'yi Görüntüle
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              {Array.isArray(experience) && experience.length > 0 && (
                <CardContent>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Deneyim:</strong> {experience.length} pozisyon
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {cvs.length === 0 && (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              CV bulunamadı. Filtreleri değiştirip tekrar deneyin.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
