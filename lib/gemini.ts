import { GoogleGenAI, ApiError, type CallableTool } from "@google/genai";

const TOOL_MODEL = "gemini-3.1-flash-lite";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "ping",
      });
      return true;
    } catch (e) {
      // HTTP 400 means the key itself is rejected by Google.
      if (e instanceof ApiError && e.status === 400) return false;
      // Any other error (quota, model unavailable, network) means the key exists.
      return true;
    }
  }

  async generate(options: {
    systemPrompt: string;
    temperature: number;
    userPrompt: string;
  }): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: TOOL_MODEL,
      contents: options.userPrompt,
      config: {
        systemInstruction: options.systemPrompt,
        temperature: options.temperature,
      },
    });
    return response.text ?? "";
  }

  /**
   * Run the model with MCP-backed tools. The SDK performs the full
   * function-calling loop (schema conversion, tool execution, feeding results
   * back), bounded by `maxRounds` remote calls, and returns the final text.
   */
  async generateWithTools(options: {
    systemPrompt: string;
    temperature: number;
    userPrompt: string;
    tools: CallableTool[];
    maxRounds: number;
  }): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: TOOL_MODEL,
      contents: options.userPrompt,
      config: {
        systemInstruction: options.systemPrompt,
        temperature: options.temperature,
        tools: options.tools,
        automaticFunctionCalling: { maximumRemoteCalls: options.maxRounds },
      },
    });
    return response.text ?? "";
  }
}
