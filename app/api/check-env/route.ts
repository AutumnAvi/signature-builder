import { NextResponse } from "next/server";

export async function GET() {
  const missing: string[] = [];

  if (!process.env.ANTHROPIC_API_KEY) missing.push("ANTHROPIC_API_KEY");
  if (!process.env.GITHUB_TOKEN) missing.push("GITHUB_TOKEN");
  if (!process.env.GITHUB_REPO_OWNER) missing.push("GITHUB_REPO_OWNER");
  if (!process.env.GITHUB_REPO_NAME) missing.push("GITHUB_REPO_NAME");

  return NextResponse.json({ missing, ok: missing.length === 0 });
}
