import { NextResponse } from "next/server";
import lighthouse from "@lighthouse-web3/sdk";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const apiKey = process.env.LIGHTHOUSE_API_KEY!;
    
    // Upload the ENTIRE publicData object, not just watchHistory
    const publicData = data.publicData || {};

    // Convert to string
    const jsonString = JSON.stringify(publicData, null, 2);

    // Upload
    const response = await lighthouse.uploadText(
      jsonString, 
      apiKey, 
      "netflix_public_data"
    );
    const cid = response.data.Hash;

    return NextResponse.json({ 
      cid,
      uploadedFields: Object.keys(publicData)
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const apiKey = process.env.LIGHTHOUSE_API_KEY!;
    const response = await lighthouse.getUploads(apiKey, null);
    // Only return array of objects, each with cid
    const files = response.data.fileList.map((f: any) => ({
      cid: f.cid,
      fileName: f.fileName,
    }));
    return NextResponse.json(files);
  } catch (err: any) {
    console.error("Error fetching uploads:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

}
