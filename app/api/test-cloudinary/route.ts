// Create a test file: app/api/test-cloudinary/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // Test the connection
    const result = await cloudinary.api.ping();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}