"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Workspace } from "./workspace";
import { CodeEditor } from "./editor";
import { Topbar } from "./topbar";
import type { AgentMode, AgentStep, ChatItem, FileNode, ModelId } from "@/types/agent";
import { initialCode, initialFiles, createSteps } from "@/lib/mock-agent";
import { MODELS } from "@/lib/models";

export function CodingAgent() {
  const [model, setModel] = useState<ModelId>("gpt");
  const [mode, setMode] = useState<AgentMode>("code");
  const [files] = useState<FileNode[]>(initialFiles);
  const [selected, setSelected] = useState("src/app/route.ts");
  const [code, setCode] = useState<Record<string, string>>(initialCode);
  const [chat, setChat] = useState<ChatItem[]>([
    { id: "welcome", role: "agent", text: "DEV.AI is connected to the server agent. Describe a coding task and the selected model will generate a real response and optional file changes.", time: "now" },
  ]);
  const [steps, setSteps] = useState<AgentStep[]>(createSteps("code"));
  const [terminal, setTerminal] = useState<string[]>(["$ dev.ai agent --status", "workspace indexed: 6 files", "provider adapter: ready", "awaiting task..."]);
  const [running, setRunning] = useState(false);
  const [tokens, setTokens] = useState({ input: 0, output: 0 });
  const [cost, setCost] = useState(0);

  const runAgent = async (prompt: string) => {
    if (running) return;
    setRunning(true);
    const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChat((p) => [...p, { id: crypto.randomUUID(), role: "user", text: prompt, time: now() }]);
    setSteps(createSteps(mode));
    setTerminal([`$ dev.ai run --model ${MODELS[model].name}`, `> mode: ${mode}`, `> task: ${prompt}`, "> contacting provider..."]);
    setTokens((t) => ({ ...t, input: t.input + Math.max(12, prompt.length * 2) }));

    try {
      setSteps((p) => p.map((s, i) => i === 0 ? { ...s, state: "running" } : s));
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
          mode,
          filePath: selected,
          fileContent: code[selected] ?? "",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error ?? "Agent request failed");

      setSteps((p) => p.map((s, i) => i <= 1 ? { ...s, state: "done" } : i === 2 ? { ...s, state: "running" } : s));
      setTerminal((p) => [...p, "✓ provider response received", `✓ generated changes: ${data.files?.length ?? 0}`]);

      if (Array.isArray(data.files)) {
        for (const file of data.files) {
          if (file?.path && typeof file.content === "string") {
            setCode((p) => ({ ...p, [file.path]: file.content }));
            setSelected(file.path);
          }
        }
      }

      const outputText = data.message || data.raw || "Task completed.";
      setChat((p) => [...p, { id: crypto.randomUUID(), role: "agent", text: outputText, time: now() }]);
      setSteps((p) => p.map((s) => ({ ...s, state: "done" })));
      setTerminal((p) => [...p, "✓ validation: response parsed successfully", "✓ task completed"]);
      const outputEstimate = Math.max(40, Math.ceil(outputText.length / 3));
      setTokens((t) => ({ ...t, output: t.output + outputEstimate }));
      setCost((c) => c + (prompt.length * MODELS[model].rate) / 1000 + (outputEstimate * MODELS[model].rate) / 1000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown agent error";
      setSteps((p) => p.map((s) => s.state === "running" ? { ...s, state: "error" } : s));
      setTerminal((p) => [...p, `ERROR: ${message}`]);
      setChat((p) => [...p, { id: crypto.randomUUID(), role: "agent", text: `Agent error: ${message}`, time: now() }]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="grid-bg flex h-screen min-h-[720px] flex-col overflow-hidden">
      <Topbar model={model} tokens={tokens} cost={cost} running={running} />
      <div className="flex min-h-0 flex-1">
        <Sidebar model={model} setModel={setModel} mode={mode} setMode={(m) => { setMode(m); setSteps(createSteps(m)); }} files={files} selected={selected} onSelect={setSelected} />
        <Workspace chat={chat} steps={steps} terminal={terminal} running={running} onSubmit={runAgent} selectedFile={selected} />
        <CodeEditor file={selected} code={code[selected] ?? "// Select a file from the workspace tree."} />
      </div>
      <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden h-7 shrink-0 items-center justify-between border-t border-line bg-panel px-3 text-[9px] text-muted md:flex">
        <span>DEV.AI v2.0 · Real provider adapter · Server-side API keys</span>
        <span>Input {tokens.input.toLocaleString()} · Output {tokens.output.toLocaleString()} · ${cost.toFixed(4)}</span>
      </motion.footer>
    </main>
  );
}
