import { createChatCompletion, isAIEnabled } from "./ai/client";
import { z } from "zod";

interface CVData {
  personalInfo?: {
    name?: string;
    email?: string;
  };
  summary?: string;
  experience?: Array<{
    company?: string;
    position?: string;
    title?: string;
    description?: string;
  }>;
  education?: Array<{
    school?: string;
    degree?: string;
    field?: string;
  }>;
  skills?: Array<string | { name?: string; technology?: string }>;
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string;
  }>;
}

/**
 * CV'yi kısa özet formatına çevir (AI için optimize edilmiş)
 */
function createCVSummary(cv: { id: string; data: CVData }): string {
  const data = cv.data;
  const parts: string[] = [];

  if (data.personalInfo?.name) {
    parts.push(`İsim: ${data.personalInfo.name}`);
  }

  if (data.summary) {
    parts.push(`Özet: ${data.summary.substring(0, 200)}`);
  }

  if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
    const expList = data.experience
      .slice(0, 3)
      .map((exp) => `${exp.position || exp.title || ""} - ${exp.company || ""}`)
      .filter((s) => s.trim())
      .join(", ");
    if (expList) {
      parts.push(`Deneyim: ${expList}`);
    }
  }

  if (data.education && Array.isArray(data.education) && data.education.length > 0) {
    const eduList = data.education
      .slice(0, 2)
      .map((edu) => `${edu.degree || ""} - ${edu.field || ""} - ${edu.school || ""}`)
      .filter((s) => s.trim())
      .join(", ");
    if (eduList) {
      parts.push(`Eğitim: ${eduList}`);
    }
  }

  if (data.skills && Array.isArray(data.skills)) {
    const skillsList = data.skills
      .slice(0, 10)
      .map((skill) => (typeof skill === "string" ? skill : skill.name || skill.technology || ""))
      .filter((s) => s.trim())
      .join(", ");
    if (skillsList) {
      parts.push(`Yetenekler: ${skillsList}`);
    }
  }

  if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
    const projectTechs = data.projects
      .slice(0, 3)
      .map((p) => p.technologies || "")
      .filter((s) => s.trim())
      .join(", ");
    if (projectTechs) {
      parts.push(`Projeler: ${projectTechs}`);
    }
  }

  return parts.join("\n");
}

/**
 * Batch AI semantic matching - Tüm CV'leri tek bir AI çağrısında değerlendir
 */
export async function batchAISemanticMatch(
  jobDescription: string,
  cvs: Array<{ id: string; data: CVData }>
): Promise<Record<string, number>> {
  if (!isAIEnabled() || cvs.length === 0) {
    // AI aktif değilse veya CV yoksa, her CV için 50 skor döndür
    const defaultScores: Record<string, number> = {};
    cvs.forEach((cv) => {
      defaultScores[cv.id] = 50;
    });
    return defaultScores;
  }

  try {
    // CV özetlerini oluştur
    const cvSummaries = cvs.map((cv, index) => ({
      id: cv.id,
      index: index + 1,
      summary: createCVSummary(cv),
    }));

    const prompt = `
Sen bir işe alım uzmanısın. Aşağıdaki iş ilanı ile ${cvs.length} adayın CV özetlerini karşılaştır ve her aday için 0-100 arası bir uyum skoru ver.

Değerlendirme kriterleri:
- Teknik beceriler uyumu (en önemli)
- İş deneyimi uyumu
- Eğitim uyumu
- Genel kültür fit

İş İlanı:
${jobDescription}

CV Özetleri:
${cvSummaries.map((cv) => `[${cv.index}] CV ID: ${cv.id}\n${cv.summary}`).join("\n\n")}

Sadece JSON formatında döndür. Her CV ID için skor:
{
  "${cvs[0].id}": 85,
  "${cvs[1].id}": 72,
  ...
}

Sadece JSON objesi döndür, başka açıklama yapma.
`;

    const scoreSchema = z.record(z.string(), z.number().min(0).max(100));

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "Sen bir işe alım uzmanısın. Sadece JSON formatında skor döndür. Her CV ID için 0-100 arası bir sayı.",
        },
        { role: "user", content: prompt },
      ],
      schema: scoreSchema,
      temperature: 0.3,
      timeoutMs: 30000, // 30 saniye timeout
    });

    const scores = response.parsed || {};

    // Eksik CV'ler için default skor ekle
    cvs.forEach((cv) => {
      if (!(cv.id in scores)) {
        scores[cv.id] = 50;
      }
    });

    return scores;
  } catch (error) {
    console.error("[BATCH_AI_MATCH] AI matching failed:", error);
    // Hata durumunda her CV için 50 skor döndür
    const defaultScores: Record<string, number> = {};
    cvs.forEach((cv) => {
      defaultScores[cv.id] = 50;
    });
    return defaultScores;
  }
}
