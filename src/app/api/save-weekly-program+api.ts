import { adminClient } from "@/lib/sanity/client";

export async function POST(req: Request) {
  try {
    const { userId, program } = await req.json();

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    // Check if user already has an active program
    const existingProgram = await adminClient.fetch(
      `*[_type == "weeklyProgram" && userId == $userId && isActive == true][0]`,
      { userId }
    );

    if (existingProgram) {
      // Update existing program
      const updated = await adminClient
        .patch(existingProgram._id)
        .set({
          name: program.name || existingProgram.name,
          days: program.days,
        })
        .commit();

      return Response.json({ success: true, id: updated._id, updated: true });
    } else {
      // Create new program
      const newProgram = await adminClient.create({
        _type: "weeklyProgram",
        userId,
        name: program.name || "My Weekly Program",
        isActive: true,
        days: program.days || [],
      });

      return Response.json({ success: true, id: newProgram._id, created: true });
    }
  } catch (err) {
    console.error("Error saving weekly program:", err);
    return Response.json({ error: "failed", details: String(err) }, { status: 500 });
  }
}
