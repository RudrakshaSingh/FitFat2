import { adminClient } from "@/lib/sanity/client";

export async function POST(req: Request) {
  console.log("POST /api/delete-exercise call received");
  try {
    const { id, userId } = await req.json();

    if (!id || !userId) {
      return Response.json({ error: "Missing id or userId" }, { status: 400 });
    }

    // Verify ownership
    const doc = await adminClient.getDocument(id);
    
    if (!doc) {
        return Response.json({ error: "Exercise not found" }, { status: 404 });
    }
    
    // Explicitly check for userId on the document to ensure the requestor owns it
    // Using loose equality or checking if fields exist
    // The previous code used `userId` field on the exercise document.
    if (doc.userId !== userId) {
        return Response.json({ error: "Unauthorized: You can only delete your own exercises." }, { status: 403 });
    }

    await adminClient.delete(id);

    return Response.json({ success: true });
  } catch (err) {
    console.error("Error deleting exercise:", err);
    return Response.json({ error: "failed", details: String(err) }, { status: 500 });
  }
}
