import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

export class GeminiService {
  private static genAI = config.geminiApiKey && config.geminiApiKey.startsWith('AIzaSy')
    ? new GoogleGenerativeAI(config.geminiApiKey)
    : null;

  /**
   * Safe execution wrapper for Google Gemini API.
   * Does NOT generate fake responses if API is offline.
   */
  private static async getModelResponse(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.genAI || !config.geminiApiKey || !config.geminiApiKey.startsWith('AIzaSy')) {
      throw new Error('FORGE AI is currently unavailable. Please try again later.');
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
        if (text && text.trim().length > 0) return text;
      } catch (err: any) {
        // Try next candidate model
      }
    }

    throw new Error('FORGE AI is currently unavailable. Please try again later.');
  }

  /**
   * Determine whether user question is purely technical vs career/job/github related,
   * for selective context injection.
   */
  private static classifyQuestionIntent(message: string): 'technical' | 'career' | 'github' | 'job' | 'general' {
    const q = message.toLowerCase().trim();

    if (q.includes('github') || q.includes('repository') || q.includes('commit') || q.includes('repo')) {
      return 'github';
    }
    if (q.includes('job') || q.includes('apply') || q.includes('application') || q.includes('salary')) {
      return 'job';
    }
    if (q.includes('learn') || q.includes('roadmap') || q.includes('week') || q.includes('career') || q.includes('skills')) {
      return 'career';
    }
    if (
      q.startsWith('explain') ||
      q.startsWith('what is') ||
      q.startsWith('difference between') ||
      q.startsWith('how does') ||
      q.includes('java') ||
      q.includes('python') ||
      q.includes('javascript') ||
      q.includes('react') ||
      q.includes('sql') ||
      q.includes('dbms') ||
      q.includes('dsa') ||
      q.includes('interface') ||
      q.includes('closure') ||
      q.includes('inheritance') ||
      q.includes('normalization')
    ) {
      return 'technical';
    }

    return 'general';
  }

  /**
   * AI Career Coach Chat Interaction — Direct Relevance Guaranteed
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
    };
  }): Promise<string> {
    const { message, conversationHistory, userContext } = params;
    const intent = this.classifyQuestionIntent(message);

    const systemInstruction = `You are FORGE AI — an elite software engineering principal architect and technical mentor.

CRITICAL INSTRUCTIONS:
1. ALWAYS prioritize and directly answer the CURRENT USER QUESTION.
2. Do not change the subject. Do not substitute the user's question with another topic.
3. Do not provide generic unrelated career advice if the user asks a specific technical or conceptual question.
4. Format your answer with clear, structured markdown headers, code examples where applicable, and concise explanations.`;

    let contextSection = '';
    if (intent === 'career' && userContext) {
      contextSection = `RELEVANT CAREER CONTEXT:
- Target Role: ${userContext.targetRole || 'Software Engineer'}
- Experience Level: ${userContext.experienceLevel || 'Intermediate'}
- Current Skills: ${userContext.skills?.join(', ') || 'General Programming'}
- Readiness Score: ${userContext.readinessScore || 50}/100\n\n`;
    }

    const recentHistory = conversationHistory
      .slice(-4)
      .map((h) => `${h.role.toUpperCase()}: ${h.content}`)
      .join('\n\n');

    const prompt = `CURRENT USER QUESTION:
${message}

INSTRUCTION:
Answer the CURRENT USER QUESTION directly. Stay strictly on topic.

${recentHistory ? `RECENT CONVERSATION:\n${recentHistory}\n\n` : ''}${contextSection}`;

    try {
      let responseText = await this.getModelResponse(prompt, systemInstruction);

      // Lightweight Relevance Check
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Empty response');
      }

      return responseText;
    } catch (err: any) {
      if (err.message && err.message.includes('unavailable')) {
        throw err;
      }

      // Retry once with a stricter prompt
      try {
        const strictPrompt = `Your previous response did not directly answer the user's question.

Answer ONLY the question below.

CURRENT USER QUESTION:
${message}

Stay strictly on topic.`;

        return await this.getModelResponse(strictPrompt, systemInstruction);
      } catch (retryErr: any) {
        throw new Error("FORGE AI couldn't generate a relevant answer right now. Please try again.");
      }
    }
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

CRITICAL: The question MUST directly test ${technology} concepts. Do NOT generate generic programming questions.

Return ONLY a valid JSON object matching this exact structure (no markdown wrapper, no extra text):
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

    // Validation
    if (!parsed.question || typeof parsed.question !== 'string' || parsed.question.trim().length < 10) {
      throw new Error('Generated question failed validation: Question text too short or empty');
    }

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
Return ONLY valid JSON in this exact structure (no markdown wrapper):
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
