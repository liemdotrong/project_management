import { NextResponse } from 'next/server';
import connectDB from "@/lib/mongo";
import Document from "@/models/Document";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const doc = await Document.findById(id);

    if (!doc || !doc.file_data) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Extract the base64 part if it contains the data URI scheme (e.g., "data:image/png;base64,...")
    let base64Data = doc.file_data;
    if (base64Data.includes("base64,")) {
      base64Data = base64Data.split("base64,")[1];
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Return as file with correct MIME type
    const headers = new Headers();
    headers.set("Content-Type", doc.mime_type || "application/octet-stream");
    headers.set("Content-Disposition", `inline; filename="${doc.file_name}"`);

    return new NextResponse(buffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
