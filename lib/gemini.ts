import { GoogleGenAI, ApiError, type CallableTool } from "@google/genai";

export const TOOL_MODEL = "gemini-3.1-flash-lite";

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
    signal?: AbortSignal;
  }): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: TOOL_MODEL,
      contents: options.userPrompt,
      config: {
        systemInstruction: options.systemPrompt,
        temperature: options.temperature,
        abortSignal: options.signal,
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
    signal?: AbortSignal;
  }): Promise<string> {
    const { text } = await this.generateWithToolsDetailed(options);
    return text;
  }

  /**
   * Same call, but also reports how many tool rounds the SDK actually ran —
   * the only round-level detail observable from outside the loop.
   */
  async generateWithToolsDetailed(options: {
    systemPrompt: string;
    temperature: number;
    userPrompt: string;
    tools: CallableTool[];
    maxRounds: number;
    signal?: AbortSignal;
  }): Promise<{ text: string; rounds: number }> {
    const response = await this.ai.models.generateContent({
      model: TOOL_MODEL,
      contents: options.userPrompt,
      config: {
        systemInstruction: options.systemPrompt,
        temperature: options.temperature,
        tools: options.tools,
        automaticFunctionCalling: { maximumRemoteCalls: options.maxRounds },
        abortSignal: options.signal,
      },
    });

    // The AFC history holds one model turn + one function-response turn per
    // round; counting model turns beyond the first gives the rounds executed.
    const history = response.automaticFunctionCallingHistory ?? [];
    const rounds = history.filter((c) => c.role === "model").length;

    return { text: response.text ?? "", rounds };
  }
}
