"use server";

import { auth } from "@/app/auth";
import { GeminiService } from "@/lib/gemini";
import { updateUser } from "@/lib/user";
import { refresh } from "next/cache";

export type GeminiKeyState = { error: string | null; success: boolean };

export async function saveGeminiApiKey(
  _prevState: GeminiKeyState,
  formData: FormData
): Promise<GeminiKeyState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated.", success: false };

  const key = formData.get("geminiApiKey");
  if (!key || typeof key !== "string" || key.trim() === "") {
    return { error: "API key is required.", success: false };
  }

  const trimmed = key.trim();
  const service = new GeminiService(trimmed);
  const isValid = await service.validateApiKey();
  if (!isValid) {
    return { error: "Invalid API key. Please check your key and try again.", success: false };
  }

  await updateUser(session.user.id, { geminiApiKey: trimmed });
  refresh();
  return { error: null, success: true };
}
