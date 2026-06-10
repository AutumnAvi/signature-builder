import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File;
  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mediaType = (file.type || "image/png") as
    | "image/png"
    | "image/jpeg"
    | "image/webp"
    | "image/gif";

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
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
            text: 'This is an email signature screenshot. Extract all text and layout information and return ONLY a raw JSON object with no markdown: {name, title, cell, office, email, website, disclaimer, images: [{id, description, position, bbox: {x, y, w, h}}]}. For images array, identify each distinct image/logo in the signature, describe it plainly (e.g. \'Autumn Lake Healthcare logo with tree\', \'US News Best Nursing Homes Short-Term Rehab badge\'), note its position (e.g. \'top-left\', \'bottom row left\'), and provide bbox as fractional coordinates relative to the full image dimensions (x and y are the top-left corner, w and h are width and height — all values between 0 and 1). If a field has no value leave it empty string.',
          },
        ],
      },
    ],
  });

  const raw =
    message.content[0].type === "text" ? message.content[0].text : "";

  let parsed;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse Claude response", raw },
      { status: 500 }
    );
  }

  return NextResponse.json(parsed);
}
