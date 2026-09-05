import { NextResponse } from "next/server";
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true, event: { type: "task.accepted", model: body.model ?? "claude", mode: body.mode ?? "code", task: body.prompt ?? "", message: "Mock orchestration endpoint is ready." } });
}