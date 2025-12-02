import { adminClient } from "@/lib/sanity/client";

export interface WorkoutData {
  _type: "workout";
  userId: string;
  date: string; // ISO string
  duration: number; // seconds
  exercises: {
    _type: string;
    _key: string;
    exerciseRef: {
      _type: "reference";
      _ref: string;
    };
    sets: {
      reps: number;
      weight: number;
      weightUnit: "kg" | "lbs";
    }[];
  }[];
}

export async function POST(request: Request) {
  const { workoutData }: { workoutData: WorkoutData } = await request.json();
  try {
    const result = await adminClient.create(workoutData);

    console.log("Workout saved successfully:", result);

    return Response.json({
      success: true,
      workoutId: result._id,
      message: "Workout saved successfully",
    });
  } catch (error) {
    console.error("Error saving workout:", error);
    return Response.json({ error: "Failed to save workout" }, { status: 500 });
  }
}
