import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(request: Request) {
  const { exerciseName } = await request.json();

  if (!exerciseName) {
    return Response.json(
      { error: "No exercise name provided" },
      { status: 400 }
    );
  }

  const prompt = `
  You are a fitness coach

  You are given an exercise, provide clear instruction on how to perform exercise. Include if any equipment is required. Explain the exercise in detail and for a beginner.

  The exercise name is: ${exerciseName}

  Use the following format:

  ##Equipment Required

  ##Instructions

  ##Tips

  ##Variations

  ##Safety

  keep spacing between the headings and the content.

  Always use headings and subheadings.
  `;

  //   console.log(prompt);

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    console.log("ai:", response);

    return Response.json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error("Error fetching AI guidance:", error);
    return Response.json(
      { error: "Failed to fetch AI guidance." },
      { status: 500 }
    );
  }
}
