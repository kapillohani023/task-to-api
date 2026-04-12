import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from "@google/generative-ai";

export class GeminiService {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: "gemini-2.0-flash" });
      await model.generateContent("ping");
      return true;
    } catch (e) {
      // HTTP 400 means the key itself is rejected by Google
      if (e instanceof GoogleGenerativeAIFetchError && e.status === 400) {
        return false;
      }
      // Any other error (quota, model unavailable, network) means the key exists
      return true;
    }
  }

  async generate(options: {
    systemPrompt: string;
    temperature: number;
    userPrompt: string;
  }): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: options.systemPrompt,
      generationConfig: { temperature: options.temperature },
    });

    const result = await model.generateContent(options.userPrompt);
    return result.response.text();
  }
}
