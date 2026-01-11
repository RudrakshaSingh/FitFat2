import { adminClient } from "@/lib/sanity/client";

// Helper to generate unique keys for Sanity arrays
const generateKey = () => Math.random().toString(36).substr(2, 9);

// Format days array with proper Sanity keys
const formatDaysForSanity = (days: any[]) => {
  return days.map((day) => ({
    _key: generateKey(),
    _type: "dayPlan",
    dayOfWeek: day.dayOfWeek,
    isRestDay: day.isRestDay || false,
    workoutName: day.workoutName,
    exercises: (day.exercises || []).map((ex: any) => ({
      _key: generateKey(),
      _type: "plannedExercise",
      exerciseRef: {
        _type: "reference",
        _ref: ex.exerciseRef,
      },
      sets: (ex.sets || []).map((set: any) => ({
        _key: generateKey(),
        _type: "plannedSet",
        reps: set.reps || 1,
        weight: set.weight || undefined,
        weightUnit: set.weightUnit || "kg",
      })),
      notes: ex.notes,
    })),
  }));
};

export async function POST(req: Request) {
  try {
    const { userId, program } = await req.json();

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    // Format days with proper Sanity structure
    const formattedDays = formatDaysForSanity(program.days || []);

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
          days: formattedDays,
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
        days: formattedDays,
      });

      return Response.json({ success: true, id: newProgram._id, created: true });
    }
  } catch (err) {
    console.error("Error saving weekly program:", err);
    return Response.json({ error: "failed", details: String(err) }, { status: 500 });
  }
}
