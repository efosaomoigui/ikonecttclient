import { ResetPasswordRequest } from "./generated/contracts.js";

const codeSchema = ResetPasswordRequest.shape.token;
export const setupCodeLimits = Object.freeze({
  min: codeSchema.minLength,
  max: codeSchema.maxLength,
});

export function setupCodeError(value, mode = "live") {
  const code = String(value ?? "").trim();
  if (!code)
    return "Enter the one-time setup or recovery code issued by Ikonectt.";
  // The mock adapter checks its own documented demo code and single-use state.
  if (mode === "mock") return "";
  if (code.length < setupCodeLimits.min)
    return "The setup code is incomplete. Copy the full one-time code from Ikonectt, not your account number.";
  if (code.length > setupCodeLimits.max)
    return "The setup code is too long. Paste only the one-time code, without surrounding text.";
  return codeSchema.safeParse(code).success
    ? ""
    : "Check the one-time setup or recovery code supplied by Ikonectt.";
}
