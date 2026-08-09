/**
 * DevForge AI — Centralized Clerk Error Formatter
 * Converts raw Clerk SDK errors into clean, professional, user-facing error messages.
 */

export function formatClerkError(err: any): string {
  if (!err) return 'An unexpected authentication error occurred. Please try again.';

  if (typeof err === 'string') return err;

  // Network fetch failures
  if (err.name === 'TypeError' && err.message?.includes('Failed to fetch')) {
    return 'Authentication service is temporarily unavailable. Please check your connection and try again.';
  }

  const errorObj = Array.isArray(err?.errors) ? err.errors[0] : err;
  const code = errorObj?.code || '';
  const message = errorObj?.longMessage || errorObj?.message || err?.message || '';

  // 1. Invalid verification strategy
  if (code === 'verification_strategy_not_valid' || message.toLowerCase().includes('verification strategy is not valid')) {
    return "We couldn't verify this account using that method. Please check your email or restart registration.";
  }

  // 2. Account / Identifier exists
  if (code === 'form_identifier_exists' || message.toLowerCase().includes('already exists')) {
    return 'An account with this email address already exists. Try signing in.';
  }

  // 3. Identifier not found / Invalid credentials
  if (code === 'form_identifier_not_found' || message.toLowerCase().includes("couldn't find your account")) {
    return 'Your email or password is incorrect.';
  }

  if (code === 'form_password_incorrect' || message.toLowerCase().includes('incorrect password')) {
    return 'Your email or password is incorrect.';
  }

  // 4. Code verification & Expiration
  if (code === 'form_code_incorrect' || code === 'incorrect_code' || message.toLowerCase().includes('incorrect')) {
    return 'The verification code is incorrect. Please check your email and try again.';
  }

  if (code === 'verification_expired' || code === 'code_expired' || message.toLowerCase().includes('expired')) {
    return 'This verification code has expired. Click "Resend Code" to request a new code.';
  }

  // 5. Password security requirements
  if (
    code === 'form_password_length_too_short' ||
    code === 'form_password_pwned' ||
    code === 'form_password_size' ||
    message.toLowerCase().includes('password')
  ) {
    return `Your password doesn't meet the security requirements. ${message ? `(${message})` : 'Please choose a stronger password.'}`;
  }

  // 6. Already signed in / session exists
  if (code === 'session_exists' || message.toLowerCase().includes('already signed in')) {
    return 'You are already signed in.';
  }

  return message || 'Authentication service error. Please try again.';
}
