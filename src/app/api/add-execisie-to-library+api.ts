import { adminClient } from "@/lib/sanity/client";

export async function POST(req: Request) {
  try {
    const { exercise } = await req.json();

    // 1️⃣ Download image as ArrayBuffer
    const res = await fetch(exercise.gifUrl);
    const arrayBuffer = await res.arrayBuffer();

    // 2️⃣ Convert ArrayBuffer → Uint8Array → Buffer (TS SAFE)
    const uint8 = new Uint8Array(arrayBuffer);
    const imageBuffer = Buffer.from(uint8);

    // 3️⃣ Upload the buffer to Sanity
    const imageAsset = await adminClient.assets.upload("image", imageBuffer, {
      filename: `${exercise.name}.gif`,
    });

    // 4️⃣ Build valid Exercise document
    const exerciseData = {
      _type: "exercise",
      name: exercise.name,
      description: exercise.description,
      difficulty: exercise.difficulty || "beginner",
      image: {
        _type: "image",
        asset: { _ref: imageAsset._id },
        alt: exercise.name,
      },
      videoUrl: undefined,
      isActive: true,
    };

    // 5️⃣ Save to Sanity
    const saved = await adminClient.create(exerciseData);

    return Response.json({ success: true, id: saved._id });
  } catch (err) {
    console.error("Error saving exercise:", err);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
