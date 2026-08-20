import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

export interface IGeminiError {
  code: string;
  message: string;
  status: number;
}

export class GeminiService {
  /**
   * Check if Gemini API Key is configured with a valid format (starts with AIzaSy)
   */
  public static isConfigured(): boolean {
    const key = config.geminiApiKey;
    return !!key && key.trim().length > 0 && (key.startsWith('AIzaSy') || key.startsWith('AQ.'));
  }

  /**
   * Diagnostic status report (GET /api/ai/status or /api/ai/health)
   */
  public static getStatus() {
    return {
      success: true,
      configured: this.isConfigured(),
      provider: 'FORGE AI',
      status: this.isConfigured() ? 'ready' : 'unconfigured',
      model: config.geminiModel || 'gemini-1.5-flash',
    };
  }

  /**
   * Helper sleep function for exponential backoff retries
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Smart fallback response generator for development mode or when GEMINI_API_KEY is unconfigured/invalid
   */
  private static generateFallbackResponse(prompt: string): string {
    const query = prompt.toLowerCase();
    let answer = '';

    if (query.includes('react') || query.includes('hook') || query.includes('component')) {
      answer = `### ⚛️ React & Modern Frontend Engineering\n\nReact is a component-based JavaScript library for building interactive user interfaces.\n\n**Key Core Concepts:**\n- **JSX Syntax**: Declarative syntax combining HTML structures with JavaScript logic.\n- **State & Props**: Use \`useState\` for local component state and \`useMemo\`/\`useCallback\` for optimizing re-render pipelines.\n- **Effect Lifecycle**: \`useEffect\` manages side effects like data fetching and event listeners.\n\n*Tip for interview prep:* Focus on state management patterns, custom hooks, and virtual DOM reconciliation principles.`;
    } else if (query.includes('binary search') || query.includes('algorithm') || query.includes('ds') || query.includes('leetcode')) {
      answer = `### 🔍 Binary Search Algorithm\n\nBinary search is an efficient $O(\\log N)$ search algorithm for sorted arrays.\n\n\`\`\`typescript\nfunction binarySearch(arr: number[], target: number): number {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\`\`\`\n\n**Time Complexity:** $O(\\log N)$ | **Space Complexity:** $O(1)$`;
    } else if (query.includes('system design') || query.includes('node') || query.includes('backend') || query.includes('api')) {
      answer = `### 🚀 Backend & System Architecture\n\nFor scalable web services:\n1. **REST & GraphQL Endpoints**: Design clean API contracts with clear status codes.\n2. **Database Optimization**: Use MongoDB indexes, Redis caching layer, and transaction pooling.\n3. **Authentication**: Implement JWT Bearer token authentication and session state control.`;
    } else {
      answer = `### 💡 FORGE AI Engineering Intelligence\n\nThanks for your query! Here are targeted technical insights for your engineering path:\n\n1. **Code Foundations**: Clean code principles, modern framework patterns, and modular architecture.\n2. **System Design**: Database indexing, caching strategies, and RESTful API standards.\n3. **Portfolio Strategy**: Ensure full-stack projects include live demo links, architecture diagrams, and test suites.\n\n*Would you like specific interview practice questions or project recommendations for your target role?*`;
    }

    return `${answer}\n\n---\n> ℹ️ *Note: To connect live Google Gemini AI capabilities, set a free \`GEMINI_API_KEY=AIzaSy...\` in your server \`.env\` file.*`;
  }

  /**
   * Execute Google Gemini API with Timeout & Exponential Backoff Retry
   */
  public static async getModelResponse(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = config.geminiApiKey;

    // Fall back gracefully if API Key is missing or invalid format (not starting with AIzaSy)
    if (!apiKey || apiKey.trim().length === 0 || !(apiKey.startsWith('AIzaSy') || apiKey.startsWith('AQ.'))) {
      console.warn('[FORGE AI Notice] GEMINI_API_KEY missing or invalid format (must start with AIzaSy or AQ.). Serving smart fallback response.');
      return this.generateFallbackResponse(prompt);
    }

    let genAI: GoogleGenerativeAI;
    try {
      genAI = new GoogleGenerativeAI(apiKey);
    } catch (initErr: any) {
      const err: IGeminiError = {
        code: 'GEMINI_AUTH_FAILED',
        message: 'FORGE AI authentication failed. Check the server Gemini configuration.',
        status: 401,
      };
      throw err;
    }

    const primaryModel = config.geminiModel || 'gemini-3.5-flash';
    const candidateModels = Array.from(new Set([primaryModel, 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']));

    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction,
          });

          // Timeout Promise wrapper (15 seconds timeout)
          const timeoutMs = 15000;
          const generatePromise = model.generateContent(prompt);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => {
              const timeoutErr: IGeminiError = {
                code: 'GEMINI_TIMEOUT',
                message: 'FORGE AI took too long to respond. Please try again.',
                status: 408,
              };
              reject(timeoutErr);
            }, timeoutMs)
          );

          const result: any = await Promise.race([generatePromise, timeoutPromise]);
          const response = await result.response;
          const text = response.text();
          if (text && text.trim().length > 0) return text;
        } catch (err: any) {
          lastError = err;
          if (process.env.NODE_ENV === 'development') {
            console.error(`[GEMINI DEBUG] API Error:`, err);
          }
          if (err?.code === 'GEMINI_TIMEOUT') throw err;

          const errStr = (err?.message || '').toLowerCase();

          // 401 / Authentication failure with live key -> Fall back gracefully
          if (errStr.includes('api_key_invalid') || errStr.includes('401') || errStr.includes('api key not valid') || errStr.includes('unauthorized')) {
            console.warn('[FORGE AI Notice] Live Gemini API Key rejected. Serving fallback response.');
            return this.generateFallbackResponse(prompt);
          }

          // 403 / Permission
          if (errStr.includes('403') || errStr.includes('permission_denied')) {
            const permErr: IGeminiError = {
              code: 'GEMINI_PERMISSION_ERROR',
              message: 'FORGE AI does not have permission to use the configured model.',
              status: 403,
            };
            throw permErr;
          }

          // 404 / Model Not Found
          if (errStr.includes('404') || errStr.includes('model not found')) {
            continue;
          }

          // 429 / Rate limit / Quota Exceeded
          if (errStr.includes('429') || errStr.includes('resource_exhausted') || errStr.includes('quota') || errStr.includes('rate limit')) {
            if (attempt < maxRetries) {
              const backoffMs = attempt * 1000;
              if (process.env.NODE_ENV === 'development') {
                console.warn(`[FORGE AI] 429 Quota Exceeded. Attempt ${attempt}/${maxRetries}. Retrying in ${backoffMs}ms...`);
              }
              await this.sleep(backoffMs);
              break;
            } else {
              const rateErr: IGeminiError = {
                code: 'AI_RATE_LIMITED',
                message: 'FORGE AI has reached its Gemini API quota. Please try again later.',
                status: 429,
              };
              throw rateErr;
            }
          }
        }
      }
    }

    const finalErrStr = (lastError?.message || '').toLowerCase();
    if (finalErrStr.includes('429') || finalErrStr.includes('quota')) {
      const rateErr: IGeminiError = {
        code: 'AI_RATE_LIMITED',
        message: 'FORGE AI has reached its Gemini API quota. Please try again later.',
        status: 429,
      };
      throw rateErr;
    }

    if (finalErrStr.includes('500') || finalErrStr.includes('502') || finalErrStr.includes('503') || finalErrStr.includes('overloaded')) {
      const servErr: IGeminiError = {
        code: 'GEMINI_SERVER_ERROR',
        message: 'FORGE AI is temporarily unavailable. Please try again.',
        status: 503,
      };
      throw servErr;
    }

    return this.generateFallbackResponse(prompt);
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
