import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
  const { filename, data } = body;
  const buffer = Buffer.from(data, 'base64');
  const filePath = path.join(process.cwd(), 'public/downloads', filename);
  
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing file:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
