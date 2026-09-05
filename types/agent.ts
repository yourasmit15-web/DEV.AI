export type ModelId = "claude" | "gpt" | "deepseek" | "gemini";
export type AgentMode = "architect" | "code" | "debug";
export type StepState = "pending" | "running" | "done" | "error";
export type FileNode = { id: string; name: string; kind: "file" | "folder"; path: string; language?: string; children?: FileNode[] };
export type AgentStep = { id: string; label: string; detail: string; state: StepState };
export type ChatItem = { id: string; role: "user" | "agent"; text: string; time: string };