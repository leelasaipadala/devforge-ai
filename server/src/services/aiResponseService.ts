export class AiResponseService {
  /**
   * Validate & sanitize Gemini generated response output.
   */
  public static validateAndSanitize(rawText: string): string {
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      throw new Error('FORGE AI returned an empty response. Please retry.');
    }

    let sanitized = rawText.trim();

    // Remove any leaked prompt tags if AI echoed prompt headers
    sanitized = sanitized.replace(/<current_user_question>[\s\S]*?<\/current_user_question>/gi, '');
    sanitized = sanitized.replace(/<system_instruction>[\s\S]*?<\/system_instruction>/gi, '');
    sanitized = sanitized.replace(/<user_career_context>[\s\S]*?<\/user_career_context>/gi, '');
    sanitized = sanitized.replace(/<recent_conversation>[\s\S]*?<\/recent_conversation>/gi, '');

    sanitized = sanitized.trim();

    if (sanitized.length === 0) {
      throw new Error('FORGE AI returned an invalid response. Please retry.');
    }

    return sanitized;
  }
}
