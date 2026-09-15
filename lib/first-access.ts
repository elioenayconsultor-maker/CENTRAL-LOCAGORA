export const MIN_PERMANENT_PASSWORD_LENGTH = 8;

export type PermanentPasswordCheck = {
  valid: boolean;
  length: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  differsFromActivation: boolean;
  score: number;
};

export function checkPermanentPassword(password: string, activationPassword: string): PermanentPasswordCheck {
  const length = password.length >= MIN_PERMANENT_PASSWORD_LENGTH;
  const hasLetter = /[A-Za-zÀ-ÿ]/.test(password);
  const hasNumber = /\d/.test(password);
  const differsFromActivation = password !== activationPassword;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9À-ÿ]/.test(password);
  const score = [length, hasLetter, hasNumber, hasUpper, hasLower, hasSpecial].filter(Boolean).length;
  return { valid: length && hasLetter && hasNumber && differsFromActivation, length, hasLetter, hasNumber, differsFromActivation, score };
}

export function permanentPasswordStrengthLabel(score: number) {
  if (score >= 6) return "Muito forte";
  if (score >= 5) return "Forte";
  if (score >= 4) return "Média";
  return "Fraca";
}
