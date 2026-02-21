import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }
    const { name, gender } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a mystical, slightly humorous oracle that reveals people's past lives.
Based on the following user inputs (if provided), generate a creative, surprising, and mildly funny story about their past life.
The story should be 3-4 paragraphs long. It should feel premium but entertaining. Include an occupation, a dramatic/funny event, and how they died or lived happily.
If no inputs are provided, invent a random, interesting past life.
Always respond in the language that corresponds to the name or standard Korean if not specified. Format it in plain text with occasional emojis.

User Info:
Name: ${name || "Unknown"}
Gender: ${gender || "Unknown"}

Output Format:
[Title of the Past Life]
[Story]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json({ text });
  } catch (error: unknown) {
    console.error('Generate API Error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
