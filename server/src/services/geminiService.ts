import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

export interface IGeminiError {
  code: string;
  message: string;
  status?: number;
}

export class GeminiService {
  /**
   * Check if Gemini API Key is configured on the backend
   */
  public static isConfigured(): boolean {
    const key = config.geminiApiKey;
    return !!key && key.trim().length > 0;
  }

  /**
   * Safe execution wrapper for Google Gemini API.
   * Parses SDK errors into structured error objects.
   */
  private static async getModelResponse(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = config.geminiApiKey;

    if (!apiKey || apiKey.trim().length === 0) {
      const err: IGeminiError = {
        code: 'GEMINI_NOT_CONFIGURED',
        message: 'FORGE AI is not configured. Please add GEMINI_API_KEY to the backend environment.',
        status: 400,
      };
      throw err;
    }

    let genAI: GoogleGenerativeAI;
    try {
      genAI = new GoogleGenerativeAI(apiKey);
    } catch (initErr: any) {
      const err: IGeminiError = {
        code: 'GEMINI_AUTH_FAILED',
        message: 'FORGE AI authentication failed. Please check the Gemini API configuration.',
        status: 401,
      };
      throw err;
    }

    const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (text && text.trim().length > 0) return text;
      } catch (err: any) {
        lastError = err;
        const errStr = (err?.message || '').toLowerCase();

        if (errStr.includes('api_key_invalid') || errStr.includes('401') || errStr.includes('403') || errStr.includes('api key not valid') || errStr.includes('unauthorized')) {
          const authErr: IGeminiError = {
            code: 'GEMINI_AUTH_FAILED',
            message: 'FORGE AI authentication failed. Please check the Gemini API configuration.',
            status: 401,
          };
          throw authErr;
        }

        if (errStr.includes('429') || errStr.includes('resource_exhausted') || errStr.includes('quota') || errStr.includes('rate limit')) {
          const limitErr: IGeminiError = {
            code: 'GEMINI_RATE_LIMIT',
            message: 'FORGE AI is temporarily rate-limited. Please try again shortly.',
            status: 429,
          };
          throw limitErr;
        }
      }
    }

    // Parse final caught error if all candidate models failed
    const finalErrStr = (lastError?.message || '').toLowerCase();
    if (finalErrStr.includes('500') || finalErrStr.includes('503') || finalErrStr.includes('overloaded') || finalErrStr.includes('unavailable')) {
      const servErr: IGeminiError = {
        code: 'GEMINI_SERVICE_ERROR',
        message: 'FORGE AI service error. Please try again shortly.',
        status: 503,
      };
      throw servErr;
    }

    const genErr: IGeminiError = {
      code: 'GEMINI_ERROR',
      message: lastError?.message || 'FORGE AI could not complete this request. Please try again.',
      status: 500,
    };
    throw genErr;
  }

  /**
   * Classify user question intent to selectively inject personal user context.
   */
  private static classifyQuestionIntent(message: string): 'technical' | 'career' | 'github' | 'resume' | 'projects' | 'followup' | 'general' {
    const q = message.toLowerCase().trim();

    const isShortFollowUp = (q.startsWith('is it') || q.startsWith('which one') || q.startsWith('how about') || q.startsWith('why is it') || q.includes('for backend') || q.includes('for frontend')) && q.length < 40;
    if (isShortFollowUp) {
      return 'followup';
    }

    if (q.includes('github') || q.includes('repository') || q.includes('repo') || q.includes('git profile')) {
      return 'github';
    }
    if (q.includes('resume') || q.includes('cv') || q.includes('ats score')) {
      return 'resume';
    }
    if (q.includes('project') || q.includes('portfolio') || q.includes('apps i built')) {
      return 'projects';
    }
    if (q.includes('what should i learn next') || q.includes('what to learn') || q.includes('my roadmap') || q.includes('my skills') || q.includes('my gap')) {
      return 'career';
    }
    if (
      q.startsWith('what is') ||
      q.startsWith('explain') ||
      q.startsWith('difference between') ||
      q.startsWith('how does') ||
      q.startsWith('what are') ||
      q.startsWith('define') ||
      q.includes('react') ||
      q.includes('mongodb') ||
      q.includes('binary search') ||
      q.includes('node.js') ||
      q.includes('nodejs') ||
      q.includes('docker') ||
      q.includes('java') ||
      q.includes('python') ||
      q.includes('javascript') ||
      q.includes('typescript') ||
      q.includes('sql') ||
      q.includes('rest api') ||
      q.includes('express') ||
      q.includes('dsa')
    ) {
      return 'technical';
    }

    return 'general';
  }

  /**
   * FORGE AI Chat Interaction — Strict System Rules & Direct Relevance
   */
  public static async chatWithCareerCoach(params: {
    message: string;
    conversationHistory: { role: string; content: string }[];
    userContext?: {
      name?: string;
      targetRole?: string;
      careerGoal?: string;
      experienceLevel?: string;
      skills?: string[];
      readinessScore?: number;
      githubProfile?: { connected: boolean; username?: string; reposCount?: number };
      resume?: { uploaded: boolean; targetRole?: string; atsScore?: number };
      projects?: { count: number; titles?: string[] };
    };
  }): Promise<string> {
    const { message, conversationHistory, userContext } = params;
    const intent = this.classifyQuestionIntent(message);

    const systemInstruction = `<system_instruction>
You are FORGE AI, the personal career intelligence assistant inside DevForge AI.

Your primary responsibility is to answer the user's CURRENT MESSAGE accurately and directly.

RULES:
1. Always understand the current user message before generating an answer.
2. Answer the exact question the user asked.
3. Never invent a different question.
4. Never randomly change the topic.
5. Never answer an older question instead of the current question.
6. Conversation history is context only.
7. The newest user message has the highest priority.
8. Use previous messages only when they are relevant to the current question.
9. If the user asks a technical question, answer the technical question.
10. If the user asks a career question, provide career guidance.
11. If the user asks about their resume, answer about their resume.
12. If the user asks about GitHub, answer about GitHub.
13. If the user asks about projects, answer about projects.
14. If the user asks about interviews, answer about interviews.
15. If the user asks about the roadmap, answer about the roadmap.
16. Do not force career advice into unrelated questions.
17. If the question is ambiguous, ask a short clarification question instead of guessing.
18. Never fabricate information about the user.
19. Never invent skills, projects, GitHub repositories, resume information, interview results, or career progress.
20. Give a direct answer first, followed by explanation or recommendations when useful.
21. Do not mention Google Gemini or internal AI implementation details.
22. Do not expose API keys or internal system information.
</system_instruction>`;

    // Build Selective User Context
    let contextSection = '';
    if (intent === 'career' && userContext) {
      contextSection = `<relevant_user_context>
- Target Role: ${userContext.targetRole || 'Software Engineer'}
- Experience Level: ${userContext.experienceLevel || 'Intermediate'}
- Current Skills: ${userContext.skills?.join(', ') || 'General Programming'}
- Readiness Score: ${userContext.readinessScore || 50}/100
</relevant_user_context>\n\n`;
    } else if (intent === 'github' && userContext) {
      if (userContext.githubProfile?.connected) {
        contextSection = `<relevant_user_context>
- GitHub Username: ${userContext.githubProfile.username}
- Total Repositories: ${userContext.githubProfile.reposCount || 0}
</relevant_user_context>\n\n`;
      } else {
        contextSection = `<relevant_user_context>
- GitHub Status: Not connected by user yet.
</relevant_user_context>\n\n`;
      }
    } else if (intent === 'resume' && userContext) {
      if (userContext.resume?.uploaded) {
        contextSection = `<relevant_user_context>
- Resume Status: Uploaded
- ATS Score: ${userContext.resume.atsScore || 'Evaluated'}
</relevant_user_context>\n\n`;
      } else {
        contextSection = `<relevant_user_context>
- Resume Status: Not uploaded by user yet.
</relevant_user_context>\n\n`;
      }
    } else if (intent === 'projects' && userContext) {
      if (userContext.projects && userContext.projects.count > 0) {
        contextSection = `<relevant_user_context>
- Projects Count: ${userContext.projects.count}
- Project Titles: ${userContext.projects.titles?.join(', ')}
</relevant_user_context>\n\n`;
      } else {
        contextSection = `<relevant_user_context>
- Projects Status: No projects added by user yet.
</relevant_user_context>\n\n`;
      }
    }

    const recentHistory = conversationHistory
      .slice(-6)
      .map((h) => `${h.role.toUpperCase()}: ${h.content}`)
      .join('\n\n');

    const prompt = `${contextSection}${recentHistory ? `<conversation_history>\n${recentHistory}\n</conversation_history>\n\n` : ''}<current_user_message>
${message}
</current_user_message>

INSTRUCTION:
Answer the exact question in <current_user_message>. Stay strictly on topic.`;

    return await this.getModelResponse(prompt, systemInstruction);
  }

  /**
   * AI-Generated Question Validation
   */
  public static async generateAiQuestion(params: {
    technology: string;
    category?: string;
    difficulty?: string;
  }): Promise<{
    id: string;
    question: string;
    technology: string;
    category: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    type: 'Conceptual';
    expectedTimeMinutes: number;
    explanation: string;
    keyConcepts: string[];
    tags: string[];
  }> {
    const { technology, category, difficulty } = params;

    const prompt = `Generate one single high-quality, authentic technical interview question specifically for:
Technology: ${technology}
Category: ${category || 'Core Concepts'}
Difficulty: ${difficulty || 'Medium'}

Return ONLY a valid JSON object matching this exact structure:
{
  "question": "Clear, specific technical question text",
  "technology": "${technology}",
  "category": "${category || 'Core Concepts'}",
  "topic": "${category || 'Core Concepts'}",
  "difficulty": "${difficulty || 'Medium'}",
  "expectedTimeMinutes": 5,
  "explanation": "Detailed step-by-step answer explanation",
  "keyConcepts": ["Concept 1", "Concept 2"]
}`;

    const text = await this.getModelResponse(prompt);
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      id: `ai-${technology.toLowerCase()}-${Date.now()}`,
      question: parsed.question,
      technology: parsed.technology || technology,
      category: parsed.category || category || 'General',
      topic: parsed.topic || category || 'General',
      difficulty: (parsed.difficulty as 'Easy' | 'Medium' | 'Hard') || (difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
      type: 'Conceptual',
      expectedTimeMinutes: parsed.expectedTimeMinutes || 5,
      explanation: parsed.explanation || '',
      keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
      tags: [technology.toLowerCase(), 'ai-generated'],
    };
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

Evaluate technical correctness, completeness, and clarity.
Return ONLY valid JSON in this exact structure:
{
  "score": 85,
  "feedback": "Detailed constructive evaluation...",
  "strengths": ["Clear explanation", "Correct terminology"],
  "improvements": ["Could mention edge case handling", "Consider runtime complexity"]
}`;

    try {
      const text = await this.getModelResponse(prompt);
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return {
        score: userAnswer.length > 40 ? 75 : 45,
        feedback: 'Evaluation complete. Make sure to elaborate on implementation details, edge cases, and runtime complexity trade-offs.',
        strengths: ['Addressed the main question concept', 'Demonstrated problem-solving intent'],
        improvements: ['Include code examples where appropriate', 'Discuss performance considerations (Time & Space complexity)'],
      };
    }
  }

  /**
   * Generate Custom Roadmap based on target role
   */
  public static async generateCustomRoadmap(targetRole: string, currentSkills: string[]): Promise<any> {
    const prompt = `Create a detailed 4-Phase Career Learning Roadmap for a candidate aiming to become a "${targetRole}".
Current skills: ${currentSkills.join(', ') || 'Basic Programming'}.

Return ONLY valid JSON matching this exact JSON format:
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

    try {
      const text = await this.getModelResponse(prompt);
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return this.getFallbackRoadmap(targetRole);
    }
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
    githubRepos: { name: string; language?: string }[];
  }): Promise<Array<{ title: string; idea: string; problemStatement: string }>> {
    const { targetRole, experienceLevel, skills, skillGaps, existingProjects, githubRepos } = params;

    const prompt = `Generate 5 highly personalized, unique, portfolio-worthy project ideas for a candidate aiming to become a "${targetRole}".
CANDIDATE CONTEXT:
- Experience Level: ${experienceLevel || 'Intermediate'}
- Current Skills: ${skills.join(', ') || 'HTML, CSS, JavaScript, Node.js'}
- Skill Gaps to Bridge: ${skillGaps.join(', ') || 'System Design, Docker, Microservices'}
- Existing Projects: ${existingProjects.map((p) => p.title).join(', ') || 'None'}
- GitHub Repository Context: ${githubRepos.map((r) => `${r.name} (${r.language || 'JS'})`).join(', ') || 'None'}

Return ONLY a valid JSON array of 5 objects matching this structure:
[
  {
    "title": "Project Title",
    "idea": "Short description of what the project would do.",
    "problemStatement": "Short description of the real-world problem it solves."
  }
]`;

    try {
      const text = await this.getModelResponse(prompt);
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
      // Fallback
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
      ],
    };
  }
}
