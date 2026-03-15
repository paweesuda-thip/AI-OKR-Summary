import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, dashboardData } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Missing messages' }, { status: 400 });
    }

    // Check if API key is provided
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    
    // Using a mocked response if no API key is found to ensure it works for demo purposes
    if (!apiKey) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({
        message: "This is a simulated response because the API key is missing. If you want a real AI response, please provide the Anthropic API key."
      });
    }

    const anthropic = createAnthropic({
      apiKey: apiKey,
    });

    const dataContext = dashboardData ? `
Context about the OKR Dashboard:
- Team Summary: ${JSON.stringify(dashboardData.summary)}
- Top Objectives: ${JSON.stringify(dashboardData.objectives?.slice(0, 5))}
- At Risk Objectives: ${JSON.stringify(dashboardData.atRisk)}
    ` : 'No dashboard data available.';

    const systemPrompt = `
You are a helpful, professional, and knowledgeable OKR (Objectives and Key Results) Advisor.
Your goal is to help users understand their OKR dashboard data, provide insights, and answer their questions clearly.

${dataContext}

Answer the user's latest question based on the provided context. If the user asks about something not in the context, politely inform them that you can only answer questions related to the provided OKR data.
Keep your responses concise, insightful, and actionable. Use bullet points or formatting where appropriate to make it readable.
Use Thai language.
`;

    const lastMessage = messages[messages.length - 1];

    const { text } = await generateText({
      model: anthropic('claude-3-haiku-20240307'),
      system: systemPrompt,
      prompt: lastMessage.content,
    });

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('Error generating AI chat response:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
