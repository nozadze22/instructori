export type EmailVerificationPendingResponse = {
  needsEmailVerification: true;
  email: string;
};

export function isEmailVerificationPending(
  value: unknown,
): value is EmailVerificationPendingResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "needsEmailVerification" in value &&
    (value as EmailVerificationPendingResponse).needsEmailVerification === true
  );
}
