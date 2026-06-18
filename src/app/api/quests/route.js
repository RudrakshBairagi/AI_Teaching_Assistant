import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { context } = body;

    if (!context) {
      return NextResponse.json({ error: "Context is required" }, { status: 400 });
    }

    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      console.error("HF_TOKEN is missing in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const systemPrompt = `You are "EduMate AI" — an AI teaching assistant built by Connecting Dreams Foundation for students of the Haryana Board.

DAILY QUESTS GENERATION INSTRUCTIONS (STRICT):
The user wants 3 practical, offline after-school activities ("Daily Quests") based on what they just learned. You MUST respond with ONLY a valid JSON object, with no other text before or after it.

The JSON must follow this EXACT structure:
{
  "quests": [
    {
      "title": "Short, catchy name for the activity",
      "description": "Clear explanation of what the student should do in the real world to reinforce their learning.",
      "estimatedTime": "e.g., 15 mins",
      "icon": "A relevant font-awesome solid icon class name, e.g. 'fa-book', 'fa-leaf', 'fa-flask', 'fa-magnifying-glass'"
    }
  ]
}

RULES:
- Generate EXACTLY 3 quests.
- Quests should be actionable, offline (do not require screen time), and use common household or school items.
- Respond in the same language the user uses in their request context.
- Output ONLY the JSON object. Do NOT wrap it in markdown code blocks, do NOT write \`\`\`json.`;

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
          { role: "user", content: `Generate daily quests based on this recent learning context: ${context}` }
        ],
        max_tokens: 800,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("HuggingFace API Error in Quests route:", errData);
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
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse quests response content as JSON:", aiText);
      return NextResponse.json(
        { error: "Model failed to generate valid JSON format. Please try again." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Quests Route Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
