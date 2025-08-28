import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

export async function GET() {
  console.log('Test API - Environment check:', {
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length,
    keyPrefix: apiKey?.substring(0, 10),
    nodeEnv: process.env.NODE_ENV
  });

  if (!apiKey) {
    return NextResponse.json({ 
      error: "API key not found", 
      env: process.env.NODE_ENV,
      availableVars: Object.keys(process.env).filter(k => k.includes('GEMINI'))
    });
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [{ text: "Hello! Please respond with a simple JSON object containing your name." }] 
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const responseText = result.response.text();
    console.log('Gemini response:', responseText);

    return NextResponse.json({ 
      success: true,
      response: responseText,
      apiKeyLength: apiKey.length
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      apiKeyLength: apiKey.length
    });
  }
}