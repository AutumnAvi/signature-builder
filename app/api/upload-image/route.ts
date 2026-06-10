import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER || "AutumnAvi";
    const repo = process.env.GITHUB_REPO_NAME || "Assets";

    if (!token) {
      return NextResponse.json(
        { error: "GITHUB_TOKEN not configured" },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `signatures/${timestamp}_${safeName}`;

    const githubRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Add signature image ${safeName}`,
          content: base64,
        }),
      }
    );

    if (!githubRes.ok) {
      const errText = await githubRes.text();
      console.error(`GitHub API error ${githubRes.status} for ${filename}:`, errText);
      return NextResponse.json(
        { error: `GitHub API error ${githubRes.status}: ${errText}` },
        { status: 500 }
      );
    }

    const data = await githubRes.json();
    const htmlUrl: string = data.content.html_url;

    const rawUrl = htmlUrl
      .replace("github.com", "raw.githubusercontent.com")
      .replace("/blob/", "/");

    return NextResponse.json({ rawUrl, filename });
  } catch (err) {
    console.error("upload-image unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}
