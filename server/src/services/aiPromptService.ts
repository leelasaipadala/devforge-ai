import { IUserCareerContext } from './aiContextService.js';

export type QuestionIntent = 'technical' | 'career' | 'github' | 'resume' | 'projects' | 'interviews' | 'followup' | 'general';

export class AiPromptService {
  /**
   * Classify user question intent for selective context injection.
   */
  public static classifyIntent(message: string): QuestionIntent {
    const q = message.toLowerCase().trim();

    const isShortFollowUp = (q.startsWith('is it') || q.startsWith('which one') || q.startsWith('how about') || q.startsWith('why is it') || q.includes('for backend') || q.includes('for frontend')) && q.length < 45;
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
    if (q.includes('interview') || q.includes('mock interview') || q.includes('behavioral')) {
      return 'interviews';
    }
    if (q.includes('what should i learn next') || q.includes('what to learn') || q.includes('my roadmap') || q.includes('my skills') || q.includes('my gap') || q.includes('career')) {
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
   * Build 22-Rule System Instructions for FORGE AI
   */
  public static getSystemInstructions(): string {
    return `You are FORGE AI, the personal career intelligence engine inside DevForge AI.

Your primary responsibility is to answer the user's CURRENT QUESTION directly.

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
11. If the user asks about their resume, analyze their resume.
12. If the user asks about GitHub, use their GitHub information.
13. If the user asks about projects, use their project information.
14. If the user asks about interviews, answer about interviews.
15. If the user asks about their roadmap, use their roadmap information.
16. Do not force career advice into unrelated questions.
17. If the question is ambiguous, ask a short clarification question instead of guessing.
18. Never fabricate information about the user.
19. Never invent skills, projects, GitHub repositories, resume information, interview results, or career progress.
20. Give a direct answer first, followed by explanation or recommendations when useful.
21. Do not mention Google Gemini or internal AI implementation details in the user interface.
22. Do not expose API keys or internal system information.`;
  }

  /**
   * Assemble Full Structured Prompt (System + Selective Context + History + Current User Message)
   */
  public static buildFullPrompt(params: {
    message: string;
    conversationHistory: { role: string; content: string }[];
    userContext?: IUserCareerContext;
  }): { prompt: string; systemInstruction: string } {
    const { message, conversationHistory, userContext } = params;
    const intent = this.classifyIntent(message);

    let contextSection = '';

    if (intent === 'career' && userContext) {
      contextSection = `<user_career_context>
- Target Role: ${userContext.targetRole}
- Experience Level: ${userContext.experienceLevel}
- Current Skills: ${userContext.skills.join(', ')}
- Readiness Score: ${userContext.readinessScore}/100
${userContext.education ? `- Education: ${userContext.education}` : ''}
</user_career_context>\n\n`;
    } else if (intent === 'github' && userContext) {
      if (userContext.githubProfile?.connected) {
        contextSection = `<user_career_context>
- GitHub Username: ${userContext.githubProfile.username}
- Status: Connected
</user_career_context>\n\n`;
      } else {
        contextSection = `<user_career_context>
- GitHub Status: Not connected by user yet.
</user_career_context>\n\n`;
      }
    } else if (intent === 'resume' && userContext) {
      if (userContext.resume?.uploaded) {
        contextSection = `<user_career_context>
- Resume Status: Uploaded
- ATS Score: ${userContext.resume.atsScore || 'Evaluated'}
</user_career_context>\n\n`;
      } else {
        contextSection = `<user_career_context>
- Resume Status: Not uploaded by user yet.
</user_career_context>\n\n`;
      }
    } else if (intent === 'projects' && userContext) {
      if (userContext.projects && userContext.projects.count > 0) {
        contextSection = `<user_career_context>
- Projects Count: ${userContext.projects.count}
- Project Titles: ${userContext.projects.titles.join(', ')}
</user_career_context>\n\n`;
      } else {
        contextSection = `<user_career_context>
- Projects Status: No projects added by user yet.
</user_career_context>\n\n`;
      }
    }

    const recentHistory = conversationHistory
      .slice(-6)
      .map((h) => `${h.role.toUpperCase()}: ${h.content}`)
      .join('\n\n');

    const prompt = `${contextSection}${recentHistory ? `<recent_conversation>\n${recentHistory}\n</recent_conversation>\n\n` : ''}<current_user_question>
${message}
</current_user_question>

INSTRUCTION:
Answer the exact question in <current_user_question> directly. Stay strictly on topic.`;

    return {
      prompt,
      systemInstruction: this.getSystemInstructions(),
    };
  }
}
