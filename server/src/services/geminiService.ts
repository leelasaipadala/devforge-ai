import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

export class GeminiService {
  private static genAI = config.geminiApiKey ? new GoogleGenerativeAI(config.geminiApiKey) : null;

  /**
   * Safe execution wrapper with configuration state notice if API key is not configured or fails
   */
  private static async getModelResponse(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.genAI || !config.geminiApiKey) {
      return `FORGE AI is temporarily unavailable. Please check the AI configuration or try again.`;
    }

    const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

    for (const modelName of candidateModels) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (text) return text;
      } catch (err: any) {
        // Try next model candidate
      }
    }

    return `FORGE AI is temporarily unavailable. Please check the AI configuration or try again.`;
  }

  /**
   * AI Career Coach Chat Interaction
   */
  public static async chatWithCareerCoach(params: {
    message: string;
    conversationHistory: { role: string; content: string }[];
    userContext: {
      name: string;
      targetRole: string;
      careerGoal: string;
      experienceLevel: string;
      skills: string[];
      readinessScore: number;
    };
  }): Promise<string> {
    const { message, conversationHistory, userContext } = params;

    const systemInstruction = `You are DevForge AI Career Coach — an elite, highly encouraging, pragmatic software engineering career mentor and principal architect.
You assist developers, CSE students, fresh graduates, and job seekers in advancing their software engineering careers.

USER CONTEXT:
- Name: ${userContext.name || 'Developer'}
- Target Role: ${userContext.targetRole || 'Full Stack Developer'}
- Career Goal: ${userContext.careerGoal || 'Land a Software Engineer position'}
- Experience Level: ${userContext.experienceLevel || 'Beginner'}
- Current Skills: ${userContext.skills.join(', ') || 'HTML, CSS, JavaScript'}
- DevForge Career Readiness Score: ${userContext.readinessScore || 45}/100

GUIDELINES:
1. Be concise, actionable, and structured (use markdown headers, bullet points, and code snippets where relevant).
2. Answer career questions directly with practical steps.
3. Keep advice focused on realistic developer paths, portfolio projects, ATS resume optimization, system design, and technical interview mastery.
4. Encourage continuous learning and code output.`;

    const formattedHistory = conversationHistory
      .slice(-6)
      .map((h) => `${h.role.toUpperCase()}: ${h.content}`)
      .join('\n\n');

    const prompt = `${formattedHistory ? `PAST CONVERSATION:\n${formattedHistory}\n\n` : ''}USER QUESTION: ${message}`;

    return await this.getModelResponse(prompt, systemInstruction);
  }

  /**
   * Generate Custom Roadmap based on target role
   */
  public static async generateCustomRoadmap(targetRole: string, currentSkills: string[]): Promise<any> {
    const prompt = `Create a detailed 4-Phase Career Learning Roadmap for a candidate aiming to become a "${targetRole}".
Current skills: ${currentSkills.join(', ') || 'Basic Programming'}.

Return ONLY valid JSON matching this exact JSON format (no extra text or markdown wrappers):
{
  "title": "Mastering ${targetRole}",
  "description": "A comprehensive step-by-step career path tailored to your goal.",
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase 1: Core Fundamentals & Tooling",
      "description": "Master foundational concepts and modern workflows.",
      "skills": ["Skill 1", "Skill 2"],
      "topics": ["Topic 1", "Topic 2"],
      "projects": ["Mini Project Title"],
      "estimatedEffort": "3-4 weeks",
      "status": "In Progress",
      "completion": 0,
      "items": [
        { "id": "p1-item-1", "title": "Learn essential fundamentals", "completed": false, "type": "topic", "estimatedHours": 10 }
      ]
    }
  ]
}`;

    const text = await this.getModelResponse(prompt);
    try {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return this.getFallbackRoadmap(targetRole);
    }
  }

  /**
   * Evaluate Technical Interview Answer
   */
  public static async evaluateInterviewAnswer(params: {
    question: string;
    category: string;
    userAnswer: string;
  }): Promise<{ score: number; feedback: string; strengths: string[]; improvements: string[] }> {
    const { question, category, userAnswer } = params;

    const prompt = `You are a Senior Technical Interviewer evaluating a candidate's response.
CATEGORY: ${category}
QUESTION: ${question}
CANDIDATE ANSWER: "${userAnswer}"

Evaluate the technical correctness, completeness, clarity, and best practices.
Return ONLY valid JSON in this exact structure (no markdown fences):
{
  "score": 85,
  "feedback": "Detailed constructive evaluation...",
  "strengths": ["Clear explanation of time complexity", "Correct syntax"],
  "improvements": ["Could mention edge case handling", "Consider memory allocation"]
}`;

    const text = await this.getModelResponse(prompt);
    try {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return {
        score: userAnswer.length > 50 ? 75 : 45,
        feedback: 'Good attempt! Make sure to elaborate on implementation details, edge cases, and runtime complexity trade-offs.',
        strengths: ['Addressed the main question concept', 'Demonstrated problem-solving intent'],
        improvements: ['Include code examples where appropriate', 'Discuss performance considerations (Time & Space complexity)'],
      };
    }
  }

  /**
   * Fallback mock responses when API key is missing
   */
  private static generateMockFallbackResponse(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('ready') || lower.includes('internship') || lower.includes('job')) {
      return `### Sample Career Readiness Guidance

To be fully competitive for a **Backend / Full Stack** role:

1. **Core Proficiency**: Focus on mastering REST APIs, Database Design (SQL & NoSQL), and Clean Architecture.
2. **Portfolio Quality**: Ensure you have at least 2 deployed full-stack applications with live URLs and clear README documentation on GitHub.
3. **Interview Prep**: Practice 1-2 Data Structure & Algorithm (DSA) problems daily alongside system design basics.`;
    }

    return `### DevForge AI Career Coach Guidance

In modern software development, progression relies on three pillars:

- **Targeted Skill Mastery**: Building deep hands-on expertise rather than shallow tutorial exposure.
- **Proof of Capability**: Deployed applications with clear source code on GitHub.
- **Interview Readiness**: Articulating technical trade-offs clearly in DSA and system design discussions.`;
  }

  /**
   * Generate 5 Personalized Project Recommendations
   */
  public static async generateProjectRecommendations(params: {
    targetRole: string;
    experienceLevel: string;
    skills: string[];
    skillGaps: string[];
    existingProjects: { title: string }[];
    githubRepos: { name: string; language: string }[];
  }): Promise<Array<{ title: string; idea: string; problemStatement: string }>> {
    const { targetRole, experienceLevel, skills, skillGaps, existingProjects, githubRepos } = params;

    const prompt = `Generate 5 highly personalized, unique, portfolio-worthy project ideas for a candidate aiming to become a "${targetRole}".
CANDIDATE CONTEXT:
- Experience Level: ${experienceLevel || 'Intermediate'}
- Current Skills: ${skills.join(', ') || 'HTML, CSS, JavaScript, Node.js'}
- Skill Gaps to Bridge: ${skillGaps.join(', ') || 'System Design, Docker, Microservices'}
- Existing Projects: ${existingProjects.map((p) => p.title).join(', ') || 'None'}
- GitHub Repository Context: ${githubRepos.map((r) => `${r.name} (${r.language})`).join(', ') || 'None'}

CRITICAL RULES:
1. Avoid duplicates or variations of existing projects.
2. Avoid generic/trivial projects like "Todo App", "Calculator", "Basic Weather App", "Basic Blog".
3. Each recommendation MUST contain ONLY these three fields:
   - "title": Project Title
   - "idea": Short description of what the project does (2-3 sentences max).
   - "problemStatement": Short description of the real-world problem it solves (2-3 sentences max).
4. DO NOT include tech stack, architecture, database schemas, code snippets, or implementation steps.

Return ONLY a valid JSON array of 5 objects matching this structure:
[
  {
    "title": "Project Title",
    "idea": "Short description of what the project would do.",
    "problemStatement": "Short description of the real-world problem it solves."
  }
]`;

    const text = await this.getModelResponse(prompt);
    try {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 5).map((item) => ({
          title: item.title || 'Innovative Software Application',
          idea: item.idea || item.description || 'A comprehensive developer application addressing targeted software workflow requirements.',
          problemStatement: item.problemStatement || item.problem || 'Addresses developer productivity gaps and system efficiency bottlenecks.',
        }));
      }
    } catch {
      // Fallback structured recommendations
    }

    return this.getFallbackProjectRecommendations(targetRole);
  }

  private static getFallbackProjectRecommendations(targetRole: string): Array<{ title: string; idea: string; problemStatement: string }> {
    return [
      {
        title: `Automated Pull Request Code Review Assistant`,
        idea: `A developer productivity platform that automatically inspects pull requests, flags potential security vulnerabilities, and provides clean code style suggestions.`,
        problemStatement: `Engineering teams spend hundreds of hours manually conducting repetitive code reviews, creating pull request bottlenecks and allowing subtle bugs into production.`,
      },
      {
        title: `Real-Time Distributed Telemetry & Alerting Engine`,
        idea: `A lightweight microservices monitoring system that aggregates application logs, tracks latency percentiles, and triggers instant alerts when error rates spike.`,
        problemStatement: `DevOps and backend teams lack unified visibility into microservice health during traffic surges, delaying incident response times.`,
      },
      {
        title: `Collaborative API Endpoint & Mock Server Portal`,
        idea: `A developer workspace enabling frontend and backend engineers to prototype REST API schemas, generate instant mock servers, and run automated integration tests.`,
        problemStatement: `Frontend development is frequently blocked waiting for backend API endpoints to be implemented and deployed to staging environments.`,
      },
      {
        title: `Smart Campus & Co-Working Resource Allocation Platform`,
        idea: `A real-time resource reservation system that allows users to discover available study spaces, book laboratory equipment, and view occupancy metrics.`,
        problemStatement: `Users struggle to find available working spaces and equipment because availability data is scattered across disconnected legacy systems.`,
      },
      {
        title: `Intelligent Document Parsing & Knowledge Extraction SaaS`,
        idea: `A full-stack workflow application that ingests unstructured technical documents, extracts key metrics into structured database tables, and offers semantic search.`,
        problemStatement: `Organizations waste valuable manual effort transcribing data from PDFs and technical specs into databases for analytical processing.`,
      },
    ];
  }

  private static getFallbackRoadmap(targetRole: string) {
    return {
      title: `Mastering ${targetRole}`,
      description: `Structured career roadmap tailored for ${targetRole}.`,
      phases: [
        {
          id: 'phase-1',
          title: 'Phase 1: Language & Core Tooling',
          description: 'Establish foundational software engineering skills.',
          skills: ['Git', 'TypeScript', 'Data Structures'],
          topics: ['Version Control Best Practices', 'Asynchronous Programming', 'Object-Oriented & Functional Design'],
          projects: ['CLI Developer Utility Tool'],
          estimatedEffort: '3 weeks',
          status: 'In Progress',
          completion: 25,
          items: [
            { id: 'p1-1', title: 'Master Git branching and pull request workflows', completed: true, type: 'topic', estimatedHours: 5 },
            { id: 'p1-2', title: 'Implement core Data Structures (Linked Lists, Trees, HashMaps)', completed: false, type: 'topic', estimatedHours: 12 },
          ],
        },
        {
          id: 'phase-2',
          title: 'Phase 2: Framework Mastery & API Architecture',
          description: 'Build production-ready backend and frontend services.',
          skills: ['React', 'Node.js', 'Express', 'MongoDB'],
          topics: ['RESTful API Design', 'Database Indexing', 'Authentication & JWT'],
          projects: ['Full-Stack E-Commerce or SaaS Dashboard'],
          estimatedEffort: '4 weeks',
          status: 'Not Started',
          completion: 0,
          items: [
            { id: 'p2-1', title: 'Build REST APIs with Node.js, Express, and Mongoose', completed: false, type: 'topic', estimatedHours: 15 },
            { id: 'p2-2', title: 'Implement secure JWT / Clerk user authentication', completed: false, type: 'topic', estimatedHours: 8 },
          ],
        },
        {
          id: 'phase-3',
          title: 'Phase 3: System Design, Testing & DevOps',
          description: 'Prepare your applications for cloud deployment and scalability.',
          skills: ['Docker', 'CI/CD', 'Jest', 'System Design'],
          topics: ['Microservices Fundamentals', 'Caching Strategies', 'Containerization'],
          projects: ['Deployed Multi-Container Microservice Application'],
          estimatedEffort: '4 weeks',
          status: 'Not Started',
          completion: 0,
          items: [
            { id: 'p3-1', title: 'Containerize backend and database with Docker Compose', completed: false, type: 'topic', estimatedHours: 10 },
            { id: 'p3-2', title: 'Setup GitHub Actions CI/CD pipeline for automated testing', completed: false, type: 'topic', estimatedHours: 8 },
          ],
        },
        {
          id: 'phase-4',
          title: 'Phase 4: Technical Interview Preparation & Portfolio Polish',
          description: 'Final polishing for technical interviews and job applications.',
          skills: ['Mock Interviews', 'ATS Resume Optimization', 'Portfolio Deployments'],
          topics: ['System Design Mock Interviews', 'Behavioral STAR Method', 'DSA Problem Solving'],
          projects: ['Production-Grade Portfolio Project'],
          estimatedEffort: '3 weeks',
          status: 'Not Started',
          completion: 0,
          items: [
            { id: 'p4-1', title: 'Complete 15 medium LeetCode/DSA problems', completed: false, type: 'topic', estimatedHours: 20 },
            { id: 'p4-2', title: 'Refine ATS resume and portfolio GitHub repository links', completed: false, type: 'topic', estimatedHours: 6 },
          ],
        },
      ],
    };
  }
}
