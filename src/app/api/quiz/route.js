import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, numQuestions = 5, language = "English" } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Instruction prompt is required" }, { status: 400 });
    }

    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      console.error("HF_TOKEN is missing in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const systemPrompt = `You are "CDF Guru" — an AI teaching assistant built by Connecting Dreams Foundation for students of the Haryana Board.

QUIZ GENERATION INSTRUCTIONS (STRICT):
The user wants a practice quiz based on their instruction prompt. You MUST respond with ONLY a valid JSON object, with no other text before or after it.

The JSON must follow this EXACT structure:
{
  "quiz": true,
  "topic": "Clean Name of the Topic/Chapter",
  "questions": [
    {
      "question": "Question text goes here...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Brief explanation of why the correct option is right",
      "imageKeyword": "Wikipedia search keyword for an image relevant to this question (optional, null if none)"
    }
  ]
}

RULES:
- Generate EXACTLY ${numQuestions} multiple-choice questions. No more, no less.
- "answer" is the zero-based index of the correct option (0, 1, 2, or 3).
- Questions should be educational, clear, and highly relevant to Haryana Board school subjects based on the user's instructions.
- IMPORTANT: You MUST generate the questions, options, and explanation in the following language: ${language}.
- Output ONLY the JSON object. Do NOT wrap it in markdown code blocks, do NOT write \`\`\`json, do NOT include intro or outro conversational text. Just output the raw JSON string starting with { and ending with }.`;

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-4-Scout-17B-16E-Instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a quiz with ${numQuestions} questions based on this instruction: ${prompt}` }
        ],
        max_tokens: Math.min(2500, numQuestions * 250), // Ensure enough tokens for more questions
        temperature: 0.3 // Lower temperature for more structured, reliable formatting
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("HuggingFace API Error in Quiz route:", errData);
      return NextResponse.json(
        { error: `API Error ${response.status}: ${errData.error?.message || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    let aiText = data.choices[0].message.content.trim();

    // Strip code fences if they are present
    aiText = aiText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

    // Validate if it is parseable JSON
    try {
      const parsed = JSON.parse(aiText);
      
      // Fetch Wikipedia images for any questions that provided an imageKeyword
      if (parsed.questions && Array.isArray(parsed.questions)) {
        await Promise.all(parsed.questions.map(async (q) => {
          if (q.imageKeyword) {
            try {
              const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.imageKeyword)}`);
              if (wikiRes.ok) {
                const wikiData = await wikiRes.json();
                if (wikiData.thumbnail && wikiData.thumbnail.source) {
                  q.image = wikiData.thumbnail.source;
                }
              }
            } catch (e) {
              console.error("Failed to fetch wiki image for keyword:", q.imageKeyword);
            }
          }
        }));
      }

      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse quiz response content as JSON:", aiText);
      return NextResponse.json(
        { error: "Model failed to generate valid JSON format. Please try again." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Quiz Route Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
