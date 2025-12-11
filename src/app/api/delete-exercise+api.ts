import { adminClient } from "@/lib/sanity/client";

export async function POST(req: Request) {
  console.log("POST /api/delete-exercise call received");
  try {
    const { id, userId, cascade } = await req.json();

    if (!id || !userId) {
      return Response.json({ error: "Missing id or userId" }, { status: 400 });
    }

    // Verify ownership
    const doc = await adminClient.getDocument(id);
    
    if (!doc) {
        return Response.json({ error: "Exercise not found" }, { status: 404 });
    }
    
    // Explicitly check for userId on the document to ensure the requestor owns it
    if (doc.userId !== userId) {
        return Response.json({ error: "Unauthorized: You can only delete your own exercises." }, { status: 403 });
    }

    if (cascade) {
         // Find all workouts that reference this exercise
         const references = await adminClient.fetch(
            `*[_type == "workout" && references($id)]._id`,
            { id }
         );

         const transaction = adminClient.transaction();

         // Delete referencing workouts
         references.forEach((refId: string) => {
             transaction.delete(refId);
         });

         // Delete the exercise itself
         transaction.delete(id);

         await transaction.commit();
         
         return Response.json({ success: true, deletedWorkouts: references.length });
    } else {
        await adminClient.delete(id);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Error deleting exercise:", err);
    return Response.json({ error: "failed", details: String(err) }, { status: 500 });
  }
}
