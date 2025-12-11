import { adminClient } from "@/lib/sanity/client";

export async function POST(req: Request) {
  try {
    const { exercise, userId } = await req.json();

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    // Check for duplicate exercise name for this user
    const existingExercise = await adminClient.fetch(
      `*[_type == "exercise" && userId == $userId && name == $name][0]`,
      { userId, name: exercise.name }
    );

    if (existingExercise) {
      return Response.json(
        { error: "duplicate", message: "This exercise is already in your library" },
        { status: 409 }
      );
    }

    // 1️⃣ Download image or handle base64
    let imageAssetDescriptor = undefined;

    if (exercise.gifUrl) {
      let imageBuffer: Buffer;

      if (exercise.gifUrl.startsWith("data:")) {
        // Handle Base64 Data URI
        const base64Data = exercise.gifUrl.split(";base64,")[1];
        imageBuffer = Buffer.from(base64Data, "base64");
      } else {
        // Handle Remote URL
        const res = await fetch(exercise.gifUrl);
        const arrayBuffer = await res.arrayBuffer();
        imageBuffer = Buffer.from(new Uint8Array(arrayBuffer));
      }

      // 3️⃣ Upload the buffer to Sanity
      const imageAsset = await adminClient.assets.upload("image", imageBuffer, {
        filename: `${exercise.name}.gif`,
      });
      
      imageAssetDescriptor = {
        _type: "image",
        asset: { _ref: imageAsset._id },
        alt: exercise.name,
      };
    }

    // 4️⃣ Build valid Exercise document
    const exerciseData = {
      _type: "exercise",
      userId: userId,
      name: exercise.name,
      target: exercise.target || undefined,
      description: exercise.description,
      difficulty: exercise.difficulty || "beginner",
      image: imageAssetDescriptor,
      videoUrl: exercise.videoUrl,
      isActive: true,
    };

    // 5️⃣ Save to Sanity
    const saved = await adminClient.create(exerciseData);

    return Response.json({ success: true, id: saved._id });
  } catch (err) {
    console.error("Error saving exercise:", err);
    return Response.json({ error: "failed", details: String(err) }, { status: 500 });
  }
}
