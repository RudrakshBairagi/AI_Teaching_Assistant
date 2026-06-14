import { NextResponse } from 'next/server';

async function callGroqTTS(input, token) {
  return fetch("https://api.groq.com/openai/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "canopylabs/orpheus-v1-english",
      input: input,
      voice: "hannah",
      response_format: "wav"
    })
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json({ error: 'Input text is required' }, { status: 400 });
    }

    // Collect all available Groq tokens
    const tokens = [
      process.env.GROQ_TOKEN,
      process.env.GROQ_TOKEN_2,
      process.env.GROQ_TOKEN_3,
    ].filter(Boolean);

    if (tokens.length === 0) {
      console.error('No GROQ_TOKEN found in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Try each token — if one hits rate limit (429), try the next
    for (let i = 0; i < tokens.length; i++) {
      const response = await callGroqTTS(input, tokens[i]);

      if (response.ok) {
        const audioBlob = await response.blob();
        return new NextResponse(audioBlob, {
          status: 200,
          headers: { 'Content-Type': 'audio/wav' },
        });
      }

      // If rate limited and we have more keys, try the next one
      if (response.status === 429 && i < tokens.length - 1) {
        console.log(`Groq key ${i + 1} rate limited, trying key ${i + 2}...`);
        continue;
      }

      // Final failure
      const errText = await response.text();
      console.error('Groq API Error:', errText);
      return NextResponse.json(
        { error: `Groq TTS failed: ${response.statusText}` },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('TTS Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
