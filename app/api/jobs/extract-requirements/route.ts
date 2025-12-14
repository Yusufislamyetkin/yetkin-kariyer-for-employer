import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { description } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    // Extract technologies and skills from description using simple pattern matching
    // In production, you would use OpenAI API or similar
    const techKeywords = [
      "React", "Vue", "Angular", "Next.js", "Node.js", "Express", "NestJS",
      "TypeScript", "JavaScript", "Python", "Java", "C#", "C++", "Go", "Rust",
      "Django", "Flask", "FastAPI", "Spring Boot", ".NET", "ASP.NET",
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
      "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD",
      "GraphQL", "REST API", "Microservices", "Serverless",
      "TensorFlow", "PyTorch", "Machine Learning", "AI", "Deep Learning",
      "HTML", "CSS", "SASS", "Tailwind CSS", "Bootstrap",
      "Git", "GitHub", "GitLab", "Bitbucket",
      "Jest", "Cypress", "Selenium", "Testing",
      "Agile", "Scrum", "DevOps", "TDD", "BDD"
    ];

    const foundTechnologies: string[] = [];
    const lowerDescription = description.toLowerCase();

    techKeywords.forEach(tech => {
      if (lowerDescription.includes(tech.toLowerCase())) {
        foundTechnologies.push(tech);
      }
    });

    // Also look for common patterns like "X years of experience with Y"
    const experiencePattern = /(\d+)\+?\s*(?:years?|yıl)\s*(?:of\s*)?(?:experience\s*)?(?:with|in|using)?\s*([A-Za-z\s]+)/gi;
    const matches = description.matchAll(experiencePattern);
    for (const match of matches) {
      const tech = match[2]?.trim();
      if (tech && !foundTechnologies.includes(tech)) {
        foundTechnologies.push(tech);
      }
    }

    // Remove duplicates and return
    const uniqueTechnologies = Array.from(new Set(foundTechnologies));

    return NextResponse.json({ 
      requirements: uniqueTechnologies,
      technologies: uniqueTechnologies 
    });
  } catch (error) {
    console.error("Error extracting requirements:", error);
    return NextResponse.json(
      { error: "Failed to extract requirements" },
      { status: 500 }
    );
  }
}
