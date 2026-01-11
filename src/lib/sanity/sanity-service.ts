import { client, adminClient } from "@/lib/sanity/client";

// Helper to generate unique keys for Sanity arrays
const generateKey = () => Math.random().toString(36).substr(2, 9);

// ============ Types ============

export interface WorkoutData {
  _type: "workout";
  userId: string;
  date: string;
  duration: number;
  exercises: {
    _type: string;
    _key: string;
    exerciseRef: {
      _type: string;
      _ref: string;
    };
    sets: {
      reps: number;
      weight: number;
      weightUnit: "kg" | "lbs";
      _type?: string;
      _key?: string;
    }[];
  }[];
}

export interface ExerciseData {
  name: string;
  target?: string;
  description?: string;
  difficulty?: string;
  gifUrl?: string;
  videoUrl?: string;
}

export interface WeeklyProgram {
  name?: string;
  days: {
    dayOfWeek: string;
    isRestDay?: boolean;
    workoutName?: string;
    exercises?: {
      exerciseRef: string;
      sets?: {
        reps?: number;
        weight?: number;
        weightUnit?: string;
      }[];
      notes?: string;
    }[];
  }[];
}

// ============ Weekly Program ============

export async function getWeeklyProgram(userId: string) {
  if (!userId) {
    throw new Error("Missing userId");
  }

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
          sets[] {
            reps,
            weight,
            weightUnit
          },
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

  return { program, message: program ? undefined : "No active program found" };
}

// Format days array with proper Sanity keys
const formatDaysForSanity = (days: WeeklyProgram["days"]) => {
  return days.map((day) => ({
    _key: generateKey(),
    _type: "dayPlan",
    dayOfWeek: day.dayOfWeek,
    isRestDay: day.isRestDay || false,
    workoutName: day.workoutName,
    exercises: (day.exercises || []).map((ex) => ({
      _key: generateKey(),
      _type: "plannedExercise",
      exerciseRef: {
        _type: "reference",
        _ref: ex.exerciseRef,
      },
      sets: (ex.sets || []).map((set) => ({
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

export async function saveWeeklyProgram(userId: string, program: WeeklyProgram) {
  if (!userId) {
    throw new Error("Missing userId");
  }

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

    return { success: true, id: updated._id, updated: true };
  } else {
    // Create new program
    const newProgram = await adminClient.create({
      _type: "weeklyProgram",
      userId,
      name: program.name || "My Weekly Program",
      isActive: true,
      days: formattedDays,
    });

    return { success: true, id: newProgram._id, created: true };
  }
}

// ============ Workouts ============

export async function saveWorkout(workoutData: WorkoutData) {
  const result = await adminClient.create(workoutData);
  console.log("Workout saved successfully:", result);
  return {
    success: true,
    workoutId: result._id,
    message: "Workout saved successfully",
  };
}

export async function deleteWorkout(workoutId: string) {
  if (!workoutId) {
    throw new Error("Workout ID is required");
  }

  await adminClient.delete(workoutId);
  console.log("Workout deleted successfully:", workoutId);

  return {
    success: true,
    message: "Workout deleted successfully",
  };
}

// ============ Exercises ============

// Helper to check how many workouts reference an exercise
export async function getExerciseReferenceCount(exerciseId: string): Promise<number> {
  const count = await adminClient.fetch(
    `count(*[_type == "workout" && references($id)])`,
    { id: exerciseId }
  );
  return count;
}
// Base64 to Uint8Array helper (works in React Native without Buffer)
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function addExerciseToLibrary(userId: string, exercise: ExerciseData) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  // Check for duplicate exercise name for this user
  const existingExercise = await adminClient.fetch(
    `*[_type == "exercise" && userId == $userId && name == $name][0]`,
    { userId, name: exercise.name }
  );

  if (existingExercise) {
    return { error: "duplicate", message: "This exercise is already in your library" };
  }

  // Handle image - for remote URLs, just store the URL directly without uploading
  // This avoids React Native's binary upload limitations
  let imageAssetDescriptor = undefined;

  if (exercise.gifUrl) {
    if (exercise.gifUrl.startsWith("data:")) {
      // Only try to upload base64 images (from custom exercise creation)
      try {
        const base64Data = exercise.gifUrl.split(";base64,")[1];
        const uint8Array = base64ToUint8Array(base64Data);
        
        const imageAsset = await adminClient.assets.upload("image", uint8Array as any, {
          filename: `${exercise.name.replace(/[^a-zA-Z0-9]/g, "_")}.gif`,
        });

        if (imageAsset) {
          imageAssetDescriptor = {
            _type: "image",
            asset: { _ref: imageAsset._id },
            alt: exercise.name,
          };
        }
      } catch (uploadError) {
        console.error("Image upload failed, saving exercise without image:", uploadError);
      }
    }
    // For remote URLs (from browse), we don't upload - the gifUrl will be stored directly
  }

  // Build valid Exercise document
  const exerciseData: any = {
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

  // Store remote gifUrl directly (for exercises from browse)
  if (exercise.gifUrl && !exercise.gifUrl.startsWith("data:")) {
    exerciseData.gifUrl = exercise.gifUrl;
  }

  // Save to Sanity
  const saved = await adminClient.create(exerciseData);

  return { success: true, id: saved._id };
}

export async function deleteExercise(id: string, userId: string, cascade: boolean = false) {
  if (!id || !userId) {
    throw new Error("Missing id or userId");
  }

  // Verify ownership
  const doc = await adminClient.getDocument(id);

  if (!doc) {
    throw new Error("Exercise not found");
  }

  // Explicitly check for userId on the document to ensure the requestor owns it
  if ((doc as any).userId !== userId) {
    throw new Error("Unauthorized: You can only delete your own exercises.");
  }

  // Check for references first
  const references = await adminClient.fetch(
    `*[_type == "workout" && references($id)]._id`,
    { id }
  );

  if (references.length > 0 && !cascade) {
    // Don't attempt delete if there are references and cascade is false
    throw new Error(`Cannot delete: Exercise is used in ${references.length} workout(s). Use cascade delete.`);
  }

  if (cascade && references.length > 0) {
    // Delete referencing workouts first, then the exercise
    const transaction = adminClient.transaction();

    // Delete referencing workouts
    for (const refId of references) {
      transaction.delete(refId);
    }

    // Delete the exercise itself
    transaction.delete(id);

    await transaction.commit();

    return { success: true, deletedWorkouts: references.length };
  } else {
    // No references, safe to delete directly
    await adminClient.delete(id);
    return { success: true };
  }
}
