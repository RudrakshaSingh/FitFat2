import { client } from "@/lib/sanity/client";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    // Fetch active weekly program with expanded exercise references
    const program = await client.fetch(
      `*[_type == "weeklyProgram" && userId == $userId && isActive == true][0] {
        _id,
        name,
        isActive,
        days[] {
          dayOfWeek,
          isRestDay,
          workoutName,
          exercises[] {
            // New format - sets array
            sets[] {
              reps,
              weight,
              weightUnit
            },
            // Old format support
            plannedSets,
            plannedReps,
            notes,
            exerciseRef-> {
              _id,
              name,
              description,
              difficulty,
              image
            }
          }
        }
      }`,
      { userId }
    );

    if (!program) {
      return Response.json({ program: null, message: "No active program found" });
    }

    return Response.json({ program });
  } catch (err) {
    console.error("Error fetching weekly program:", err);
    return Response.json({ error: "failed", details: String(err) }, { status: 500 });
  }
}
