import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }
    const { name, birthDate } = await req.json();
    if (!name || !birthDate) {
      return NextResponse.json({ error: 'Name and Birthdate are required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `당신은 '전생왕AI'라는 신비롭고 영험한 전생 분석 AI입니다.
사용자의 이름과 생년월일을 바탕으로 흥미롭고 매혹적인 전생 이야기를 만들어주세요.
문체는 약간 예스럽고 신비로우며, 타로카드 리더가 말해주는 듯한 느낌으로 작성하세요.
반드시 아래 JSON 형식으로만 응답해야 합니다. 마크다운 백틱 없이 순수 JSON만 반환하세요.

{
  "identity": "전생의 신분/직업 (예: 18세기 베네치아의 가면 제작자)",
  "era": "시대 및 배경 (예: 르네상스 쇠퇴기, 이탈리아)",
  "characteristics": "전생의 성향 3가지 (예: 은밀함, 예술적 혼, 고독)",
  "story": "전생에 어떤 삶을 살았는지에 대한 짧고 강렬한 이야기 (3~4문장)"
}

사용자 정보:
- 이름: ${name}
- 생년월일: ${birthDate}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanedText);
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Generate API Error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
