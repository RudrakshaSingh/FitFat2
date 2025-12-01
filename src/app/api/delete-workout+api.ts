import { adminClient } from "@/lib/sanity/client";

export async function POST(request: Request) {
  try {
    const { workoutId }: { workoutId: string } = await request.json();

    if (!workoutId) {
      return Response.json(
        { error: "Workout ID is required" },
        { status: 400 }
      );
    }

    // Delete workout in Sanity
    await adminClient.delete(workoutId);

    console.log("Workout deleted successfully:", workoutId);

    return Response.json({
      success: true,
      message: "Workout deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workout:", error);

    return Response.json(
      { error: "Failed to delete workout" },
      { status: 500 }
    );
  }
}
