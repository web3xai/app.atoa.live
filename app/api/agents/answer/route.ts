import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: Request) {
  try {
    const { persona, question }: { persona?: string; question?: string } = await request.json();
    const prompt = `You are an assistant with a configurable persona. Use the persona to guide tone and preferences. Answer concisely and factually. If the persona prefers certain tools (e.g., web search), reflect that in your reasoning but return only the final answer text.

Persona: ${persona || "(none)"}
Question: ${question || "(none)"}

Answer:`;

    const { text } = await generateText({
      model: google("models/gemini-2.0-flash-exp"),
      prompt,
    });

    return NextResponse.json({ answer: text.trim() || "" }, { status: 200 });
  } catch {
    return NextResponse.json({ answer: "Sorry, I couldn't generate an answer right now." }, { status: 200 });
  }
}


