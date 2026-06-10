import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

async function extractImageFromMultipart(
  req: NextRequest
): Promise<{ buffer: Buffer; name: string; type: string } | null> {
  const contentType = req.headers.get("content-type") || "";
  const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
  if (!boundaryMatch) return null;

  const boundary = boundaryMatch[1];
  const buf = Buffer.from(await req.arrayBuffer());

  // Find the start of the first part
  const firstPartMarker = Buffer.from(`--${boundary}\r\n`);
  const firstPartStart = buf.indexOf(firstPartMarker);
  if (firstPartStart === -1) return null;
  let pos = firstPartStart + firstPartMarker.length;

  const partSep = Buffer.from(`\r\n--${boundary}`);
  const headerTerminator = Buffer.from("\r\n\r\n");

  while (pos < buf.length) {
    const headerEnd = buf.indexOf(headerTerminator, pos);
    if (headerEnd === -1) break;

    const headers = buf.slice(pos, headerEnd).toString("utf8");
    const bodyStart = headerEnd + 4;
    const nextSep = buf.indexOf(partSep, bodyStart);
    if (nextSep === -1) break;

    if (/name="image"/i.test(headers)) {
      const typeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
      const nameMatch = headers.match(/filename="([^"]+)"/i);
      return {
        buffer: buf.slice(bodyStart, nextSep),
        name: nameMatch?.[1] ?? "image.png",
        type: typeMatch?.[1]?.trim() ?? "image/png",
      };
    }

    // Advance past this part's separator; stop if we hit the closing boundary (--)
    const afterSep = nextSep + partSep.length;
    if (buf.slice(afterSep, afterSep + 2).toString() === "--") break;
    pos = afterSep + 2; // skip the \r\n that follows the boundary line
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const parsed = await extractImageFromMultipart(req);
    if (!parsed) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    const { buffer, name, type } = parsed;

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER || "AutumnAvi";
    const repo = process.env.GITHUB_REPO_NAME || "Assets";

    if (!token) {
      return NextResponse.json(
        { error: "GITHUB_TOKEN not configured" },
        { status: 500 }
      );
    }

    const base64 = buffer.toString("base64");
    const timestamp = Date.now();
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
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
