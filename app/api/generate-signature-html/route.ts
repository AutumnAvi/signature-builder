import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { screenshotDataUrl, data } = await req.json();

  if (!screenshotDataUrl || !data) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [meta, base64] = (screenshotDataUrl as string).split(",");
  const mediaType = (meta?.split(":")?.[1]?.split(";")?.[0] || "image/png") as
    | "image/png"
    | "image/jpeg"
    | "image/webp"
    | "image/gif";

  const imageCount = Array.isArray(data.images) ? data.images.length : 0;
  const placeholderList = Array.from({ length: imageCount }, (_, i) => `IMAGE_${i + 1}`).join(", ");

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: `You are generating an HTML email signature that will be pasted into Outlook.

Here is the original signature screenshot and the extracted data. Generate a complete, self-contained HTML document that EXACTLY replicates the visual layout from the screenshot.

Requirements:
- Use ONLY email-safe HTML: nested tables with cellpadding="0" cellspacing="0" border="0", inline styles, no external CSS, no JavaScript
- No floats, no flexbox, no CSS grid — tables only
- Maximum width 500px
- Font: Arial, Helvetica, sans-serif
- Match the screenshot exactly: same image positions and relative sizes, same row/column structure, same spacing and alignment
- All text must be actual HTML text nodes, not images
- Preserve font sizes, colors, weights, and link styling from the screenshot
- Wrap the whole signature in <body style="margin:0;padding:24px;background:#ffffff;">

For image src attributes use the placeholder strings in order (left-to-right, top-to-bottom, matching how the images appear in the screenshot):
${imageCount > 0 ? placeholderList : "No images — do not include any <img> tags."}

Extracted data:
${JSON.stringify(data, null, 2)}

Return ONLY the complete HTML document starting with <!DOCTYPE html>. No markdown, no code fences, no explanation.`,
          },
        ],
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const html = raw.replace(/^```html?\n?/i, "").replace(/\n?```$/i, "").trim();

  return NextResponse.json({ html });
}
