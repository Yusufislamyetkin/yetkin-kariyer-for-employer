// Candidate matching algorithm for job postings

interface CVData {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  summary?: string;
  experience?: Array<{
    company?: string;
    position?: string;
    title?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    current?: boolean;
  }>;
  education?: Array<{
    school?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }>;
  skills?: Array<string | { name?: string; technology?: string; level?: string }>;
  languages?: Array<{
    name?: string;
    level?: string;
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
  }>;
}

interface MatchResult {
  matchScore: number; // 0-100
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    testScore: number;
    interviewScore: number;
    leaderboardScore: number;
  };
}

/**
 * Extract keywords from job posting text
 */
export function extractKeywords(jobText: string): {
  technologies: string[];
  skills: string[];
  positions: string[];
  education: string[];
} {
  const text = jobText.toLowerCase();
  
  // Common technologies
  const techKeywords = [
    "react", "vue", "angular", "javascript", "typescript", "node.js", "nodejs",
    "python", "java", "c#", "c++", "php", "ruby", "go", "rust", "swift", "kotlin",
    "html", "css", "sass", "less", "tailwind", "bootstrap",
    "express", "nestjs", "django", "flask", "spring", "laravel", "rails",
    "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
    "git", "github", "gitlab", "jenkins", "ci/cd",
    "agile", "scrum", "kanban",
    "rest", "graphql", "api", "microservices",
    "machine learning", "ml", "ai", "deep learning", "data science",
    "frontend", "backend", "fullstack", "full stack",
  ];

  // Common skills
  const skillKeywords = [
    "problem solving", "team work", "communication", "leadership",
    "project management", "analytical thinking", "creativity",
    "time management", "adaptability", "collaboration",
  ];

  // Position titles
  const positionKeywords = [
    "developer", "engineer", "programmer", "architect",
    "senior", "junior", "mid", "lead", "principal",
    "frontend", "backend", "fullstack", "full stack",
    "devops", "sre", "qa", "tester", "analyst",
    "manager", "director", "specialist", "consultant",
  ];

  // Education keywords
  const educationKeywords = [
    "bachelor", "master", "phd", "doctorate",
    "computer science", "software engineering", "engineering",
    "mathematics", "physics", "information technology",
  ];

  const foundTechnologies: string[] = [];
  const foundSkills: string[] = [];
  const foundPositions: string[] = [];
  const foundEducation: string[] = [];

  // Extract technologies
  techKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      foundTechnologies.push(keyword);
    }
  });

  // Extract skills
  skillKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      foundSkills.push(keyword);
    }
  });

  // Extract positions
  positionKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      foundPositions.push(keyword);
    }
  });

  // Extract education
  educationKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      foundEducation.push(keyword);
    }
  });

  return {
    technologies: [...new Set(foundTechnologies)],
    skills: [...new Set(foundSkills)],
    positions: [...new Set(foundPositions)],
    education: [...new Set(foundEducation)],
  };
}

/**
 * Normalize skill name for comparison
 */
function normalizeSkill(skill: string | { name?: string; technology?: string }): string {
  if (typeof skill === "string") {
    return skill.toLowerCase().trim();
  }
  return (skill.name || skill.technology || "").toLowerCase().trim();
}

/**
 * Calculate skills match score (0-100)
 */
export function calculateSkillsMatch(
  jobKeywords: { technologies: string[]; skills: string[] },
  cvData: CVData
): number {
  const cvSkills = (cvData.skills || []).map(normalizeSkill);
  const cvProjects = (cvData.projects || []).map((p) => 
    (p.technologies || "").toLowerCase()
  ).join(" ");
  const cvSummary = (cvData.summary || "").toLowerCase();
  const cvExperience = (cvData.experience || [])
    .map((exp) => (exp.description || "").toLowerCase())
    .join(" ");

  const allCVText = [
    ...cvSkills,
    cvProjects,
    cvSummary,
    cvExperience,
  ].join(" ");

  let matchCount = 0;
  let totalKeywords = 0;

  // Match technologies
  jobKeywords.technologies.forEach((tech) => {
    totalKeywords++;
    if (allCVText.includes(tech.toLowerCase())) {
      matchCount++;
    }
  });

  // Match skills
  jobKeywords.skills.forEach((skill) => {
    totalKeywords++;
    if (allCVText.includes(skill.toLowerCase())) {
      matchCount++;
    }
  });

  if (totalKeywords === 0) return 50; // Default score if no keywords

  return Math.min(100, (matchCount / totalKeywords) * 100);
}

/**
 * Calculate experience match score (0-100)
 */
export function calculateExperienceMatch(
  jobKeywords: { positions: string[] },
  cvData: CVData
): number {
  const experiences = cvData.experience || [];
  
  if (experiences.length === 0) return 0;
  if (jobKeywords.positions.length === 0) return 50;

  let matchCount = 0;
  const allPositions = jobKeywords.positions.map((p) => p.toLowerCase());

  experiences.forEach((exp) => {
    const position = (exp.position || exp.title || "").toLowerCase();
    const description = (exp.description || "").toLowerCase();
    const combined = `${position} ${description}`;

    allPositions.forEach((jobPos) => {
      if (combined.includes(jobPos)) {
        matchCount++;
      }
    });
  });

  // Also consider years of experience
  const totalYears = experiences.reduce((years, exp) => {
    if (exp.startDate && exp.endDate) {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : new Date(exp.endDate);
      const diffYears = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return years + Math.max(0, diffYears);
    }
    return years;
  }, 0);

  const positionMatch = jobKeywords.positions.length > 0
    ? Math.min(100, (matchCount / jobKeywords.positions.length) * 100)
    : 50;
  
  const experienceBonus = Math.min(30, totalYears * 5); // Max 30 points for experience

  return Math.min(100, positionMatch + experienceBonus);
}

/**
 * Calculate education match score (0-100)
 */
export function calculateEducationMatch(
  jobKeywords: { education: string[] },
  cvData: CVData
): number {
  const educations = cvData.education || [];
  
  if (educations.length === 0) return 0;
  if (jobKeywords.education.length === 0) return 50;

  let matchCount = 0;
  const allEducation = jobKeywords.education.map((e) => e.toLowerCase());

  educations.forEach((edu) => {
    const degree = (edu.degree || "").toLowerCase();
    const field = (edu.field || "").toLowerCase();
    const combined = `${degree} ${field}`;

    allEducation.forEach((jobEdu) => {
      if (combined.includes(jobEdu)) {
        matchCount++;
      }
    });
  });

  return jobKeywords.education.length > 0
    ? Math.min(100, (matchCount / jobKeywords.education.length) * 100)
    : 50;
}

/**
 * Normalize test score to 0-100
 */
function normalizeTestScore(avgScore: number): number {
  return Math.min(100, Math.max(0, avgScore));
}

/**
 * Normalize interview score to 0-100
 */
function normalizeInterviewScore(avgScore: number): number {
  return Math.min(100, Math.max(0, avgScore));
}

/**
 * Normalize leaderboard score to 0-100
 */
function normalizeLeaderboardScore(
  points: number,
  averageScore: number
): number {
  // Combine points and average score
  const pointsScore = Math.min(50, (points / 1000) * 50); // Max 50 from points
  const avgScore = Math.min(50, (averageScore / 100) * 50); // Max 50 from avg score
  return Math.min(100, pointsScore + avgScore);
}

/**
 * Calculate overall match score for a candidate
 */
export function calculateMatchScore(
  jobText: string,
  cvData: CVData,
  testStats: {
    averageScore: number;
    totalTests: number;
    highestScore: number;
  },
  interviewStats: {
    averageScore: number;
    totalInterviews: number;
    highestScore: number;
  },
  leaderboardStats: {
    points: number;
    averageScore: number;
    rank: number | null;
  }
): MatchResult {
  const keywords = extractKeywords(jobText);

  const skillsMatch = calculateSkillsMatch(keywords, cvData);
  const experienceMatch = calculateExperienceMatch(keywords, cvData);
  const educationMatch = calculateEducationMatch(keywords, cvData);
  
  const testScore = normalizeTestScore(testStats.averageScore);
  const interviewScore = normalizeInterviewScore(interviewStats.averageScore);
  const leaderboardScore = normalizeLeaderboardScore(
    leaderboardStats.points,
    leaderboardStats.averageScore
  );

  // Weighted score calculation
  const matchScore = Math.round(
    skillsMatch * 0.40 +      // 40% - Technical skills
    experienceMatch * 0.25 +   // 25% - Work experience
    educationMatch * 0.10 +     // 10% - Education
    testScore * 0.15 +         // 15% - Test scores
    interviewScore * 0.10      // 10% - Interview scores
  );

  return {
    matchScore: Math.min(100, Math.max(0, matchScore)),
    breakdown: {
      skillsMatch: Math.round(skillsMatch),
      experienceMatch: Math.round(experienceMatch),
      educationMatch: Math.round(educationMatch),
      testScore: Math.round(testScore),
      interviewScore: Math.round(interviewScore),
      leaderboardScore: Math.round(leaderboardScore),
    },
  };
}
