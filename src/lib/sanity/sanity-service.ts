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
            image,
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

// Helper to check how many documents reference an exercise
export async function getExerciseReferenceCount(exerciseId: string): Promise<number> {
  const count = await adminClient.fetch(
    `count(*[references($id)])`,
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


// Robust image upload helper using direct Fetch API
// This avoids Sanity Client's Node-specific logic that fails in React Native
async function uploadImageToSanity(imageBytes: Uint8Array, filename: string, contentType: string): Promise<any> {
    const projectId = "hfe964r3";
    const dataset = "production";
    const token = process.env.EXPO_PUBLIC_SANITY_API_TOKEN;

    if (!token) {
        throw new Error("Missing Sanity API Token");
    }

    const url = `https://${projectId}.api.sanity.io/v2021-06-07/assets/images/${dataset}?filename=${filename}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": contentType,
        },
        body: imageBytes as any,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sanity Upload Failed: ${response.status} - ${errorText}`);
    }

    const json = await response.json();
    // Sanity returns { document: { _id: ... } }
    return json.document;
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

  // Handle image upload - ALWAYS upload to create a Sanity asset
  // This ensures consistent data structure (image field) for all exercises
  let imageAssetDescriptor = undefined;

  // Use either the explicit gifUrl or the image passed
  const imageUrlToUpload = exercise.gifUrl;

  if (imageUrlToUpload) {
    try {
      let uint8Array: Uint8Array;
      let filename: string;
      let contentType = "image/gif"; // Default

      if (imageUrlToUpload.startsWith("data:")) {
        // Base64 handling
        const mimeType = imageUrlToUpload.split(";")[0].split(":")[1] || "image/gif";
        const base64Data = imageUrlToUpload.split(";base64,")[1];
        uint8Array = base64ToUint8Array(base64Data);
        filename = `${exercise.name.replace(/[^a-zA-Z0-9]/g, "_")}.${mimeType.split("/")[1] || "gif"}`;
        contentType = mimeType;
      } else {
        // Remote URL (from Browse) handling - Fetch and convert to binary
        const response = await fetch(imageUrlToUpload);
        const arrayBuffer = await response.arrayBuffer();
        uint8Array = new Uint8Array(arrayBuffer);
        const urlFilename = imageUrlToUpload.split('/').pop()?.split('?')[0] || "image.gif";
        filename = `remote_${urlFilename}`;
        // Attempt to guess mime type from filename or default
        if (filename.toLowerCase().endsWith(".png")) contentType = "image/png";
        else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg";
      }
      
      // Upload using our robust helper
      const imageAsset = await uploadImageToSanity(uint8Array, filename, contentType);

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

  // Save to Sanity
  const saved = await adminClient.create(exerciseData);

  return { success: true, id: saved._id };
}

export async function updateExercise(id: string, userId: string, exercise: ExerciseData) {
  if (!id || !userId) {
    throw new Error("Missing id or userId");
  }

  // Verify ownership
  const doc = await adminClient.getDocument(id);
  if (!doc) {
    throw new Error("Exercise not found");
  }

  if ((doc as any).userId !== userId) {
    throw new Error("Unauthorized: You can only edit your own exercises.");
  }

  // Handle image upload - ALWAYS upload to create a Sanity asset
  let imageAssetDescriptor = undefined;
  const imageUrlToUpload = exercise.gifUrl;

  if (imageUrlToUpload) {
     // If it's a Sanity CDN URL (existing image), we might skip upload if we were smart,
     // but reusing the logic ensures consistency if they pasted a new URL.
     // Optimization: Check if it's already a sanity asset URL we own? 
     // For now, simpler to just re-process if it looks like a new input or if we want to be safe.
     // Actually, if the UI passes the existing Sanity URL, fetching it and re-uploading effectively "duplicates" it
     // but creates a new asset ref. Sanity handles duplicates well but it wastes space.
     // Better: The UI should only pass `gifUrl` if it CHANGED. 
     // But `add-custom-exercise` state logic is simple.
     
    try {
      let uint8Array: Uint8Array;
      let filename: string;
      let contentType = "image/gif"; 

      if (imageUrlToUpload.startsWith("data:")) {
        // Base64 handling
        const mimeType = imageUrlToUpload.split(";")[0].split(":")[1] || "image/gif";
        const base64Data = imageUrlToUpload.split(";base64,")[1];
        uint8Array = base64ToUint8Array(base64Data);
        filename = `${exercise.name.replace(/[^a-zA-Z0-9]/g, "_")}.${mimeType.split("/")[1] || "gif"}`;
        contentType = mimeType;
      } else {
        // Remote URL handling
        const response = await fetch(imageUrlToUpload);
        const arrayBuffer = await response.arrayBuffer();
        uint8Array = new Uint8Array(arrayBuffer);
        const urlFilename = imageUrlToUpload.split('/').pop()?.split('?')[0] || "image.gif";
        filename = `remote_${urlFilename}`;
        if (filename.toLowerCase().endsWith(".png")) contentType = "image/png";
        else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg";
      }
      
      const imageAsset = await uploadImageToSanity(uint8Array, filename, contentType);

      if (imageAsset) {
        imageAssetDescriptor = {
          _type: "image",
          asset: { _ref: imageAsset._id },
          alt: exercise.name,
        };
      }
    } catch (uploadError) {
      console.error("Image upload failed during update:", uploadError);
    }
  }

  // Build patch
  const patch: any = {
    name: exercise.name,
    target: exercise.target || undefined,
    description: exercise.description,
    difficulty: exercise.difficulty || "beginner",
    videoUrl: exercise.videoUrl,
  };

  if (imageAssetDescriptor) {
    patch.image = imageAssetDescriptor;
  }

  await adminClient.patch(id).set(patch).commit();

  return { success: true };
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

  // Check for references first - checking ALL referencing documents
  const references = await adminClient.fetch(
    `*[references($id)]._id`,
    { id }
  );

  if (references.length > 0 && !cascade) {
    // Don't attempt delete if there are references and cascade is false
    throw new Error(`Cannot delete: Exercise is used in ${references.length} item(s). Use cascade delete.`);
  }

  if (cascade && references.length > 0) {
    // Delete referencing documents first, then the exercise
    const transaction = adminClient.transaction();

    // Delete referencing documents
    for (const refId of references) {
      transaction.delete(refId);
    }

    // Delete the exercise itself
    transaction.delete(id);

    await transaction.commit();

    return { success: true, deletedReferences: references.length };
  } else {
    // No references, safe to delete directly
    await adminClient.delete(id);
    return { success: true };
  }
}
