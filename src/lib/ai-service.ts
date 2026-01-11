import OpenAI from "openai";

// EXPO_PUBLIC_ prefixed env vars are replaced at build time by Metro bundler
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function getExerciseGuide(exerciseName: string): Promise<string> {
  if (!exerciseName) {
    throw new Error("No exercise name provided");
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

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });

  console.log("ai:", response);

  return response.choices[0].message.content || "";
}
