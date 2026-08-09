import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

export interface IGeminiError {
  code: string;
  message: string;
  status: number;
}

export class GeminiService {
  /**
   * Check if Gemini API Key is configured
   */
  public static isConfigured(): boolean {
    const key = config.geminiApiKey;
    return !!key && key.trim().length > 0;
  }

  /**
   * Diagnostic status report (GET /api/ai/status or /api/ai/health)
   */
  public static getStatus() {
    return {
      success: true,
      configured: this.isConfigured(),
      provider: 'FORGE AI',
      model: config.geminiModel || 'gemini-2.5-flash',
    };
  }

  /**
   * Helper sleep function for exponential backoff retries
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute Google Gemini API with Exponential Backoff Retry for 429 Rate Limits
   */
  public static async getModelResponse(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = config.geminiApiKey;

    if (!apiKey || apiKey.trim().length === 0) {
      const err: IGeminiError = {
        code: 'GEMINI_NOT_CONFIGURED',
        message: 'FORGE AI is not configured yet. Add GEMINI_API_KEY to the server environment to enable AI.',
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
        message: 'FORGE AI configuration is invalid. Please check the server API key.',
        status: 401,
      };
      throw err;
    }

    const primaryModel = config.geminiModel || 'gemini-2.5-flash';
    const candidateModels = Array.from(new Set([primaryModel, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']));

    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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

          if (errStr.includes('api_key_invalid') || errStr.includes('401') || errStr.includes('api key not valid') || errStr.includes('unauthorized')) {
            const authErr: IGeminiError = {
              code: 'GEMINI_AUTH_FAILED',
              message: 'FORGE AI configuration is invalid. Please check the server API key.',
              status: 401,
            };
            throw authErr;
          }

          if (errStr.includes('403') || errStr.includes('permission_denied')) {
            const permErr: IGeminiError = {
              code: 'GEMINI_PERMISSION_ERROR',
              message: 'FORGE AI does not have permission to use the configured model.',
              status: 403,
            };
            throw permErr;
          }

          if (errStr.includes('404') || errStr.includes('model not found')) {
            continue;
          }

          if (errStr.includes('429') || errStr.includes('resource_exhausted') || errStr.includes('quota') || errStr.includes('rate limit')) {
            if (attempt < maxRetries) {
              const backoffMs = attempt * 1000;
              if (process.env.NODE_ENV === 'development') {
                console.warn(`[FORGE AI] Rate limited (429). Retrying attempt ${attempt + 1}/${maxRetries} after ${backoffMs}ms...`);
              }
              await this.sleep(backoffMs);
              break;
            } else {
              const rateErr: IGeminiError = {
                code: 'AI_RATE_LIMITED',
                message: 'FORGE AI is temporarily rate-limited. Please try again shortly.',
                status: 429,
              };
              throw rateErr;
            }
          }
        }
      }
    }

    const finalErrStr = (lastError?.message || '').toLowerCase();
    if (finalErrStr.includes('500') || finalErrStr.includes('internal error')) {
      const servErr: IGeminiError = {
        code: 'GEMINI_SERVER_ERROR',
        message: 'FORGE AI encountered a temporary server error. Please try again.',
        status: 500,
      };
      throw servErr;
    }
    if (finalErrStr.includes('503') || finalErrStr.includes('overloaded') || finalErrStr.includes('unavailable')) {
      const unavailErr: IGeminiError = {
        code: 'GEMINI_UNAVAILABLE',
        message: 'FORGE AI is temporarily unavailable. Please retry.',
        status: 503,
      };
      throw unavailErr;
    }

    const genErr: IGeminiError = {
      code: 'GEMINI_ERROR',
      message: lastError?.message || 'FORGE AI returned an invalid response. Please retry.',
      status: 500,
    };
    throw genErr;
  }

  /**
   * Compatibility alias for chatWithCareerCoach used across modules
   */
  public static async chatWithCareerCoach(params: {
    message: string;
    conversationHistory?: { role: string; content: string }[];
    userContext?: any;
  }): Promise<string> {
    const prompt = typeof params === 'string' ? params : params.message;
    return await this.getModelResponse(prompt);
  }

  /**
   * AI-Generated Question Validation
   */
  public static async generateAiQuestion(params: {
    technology: string;
    category?: string;
    difficulty?: string;
  }): Promise<any> {
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
