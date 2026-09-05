import type { ModelId } from "@/types/agent";
export const MODELS: Record<ModelId, { name: string; provider: string; badge: string; color: string; rate: number }> = {
  claude: { name: "Claude 3.5 Sonnet", provider: "Anthropic", badge: "Best for Refactoring", color: "text-orange-300", rate: 0.003 },
  gpt: { name: "GPT-4o", provider: "OpenAI", badge: "Best Generalist", color: "text-emerald-300", rate: 0.005 },
  deepseek: { name: "DeepSeek-V3", provider: "DeepSeek", badge: "Best for Algorithms", color: "text-cyan-300", rate: 0.001 },
  gemini: { name: "Gemini 1.5 Pro", provider: "Google", badge: "Best for Large Context", color: "text-blue-300", rate: 0.004 }
};