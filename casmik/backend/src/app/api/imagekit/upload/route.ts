import { NextRequest, NextResponse } from 'next/server';
import { uploadToImageKit, IMAGEKIT_CONFIG } from '@/lib/imagekit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle JSON body with base64 or remote URL
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { file, fileName, folder = IMAGEKIT_CONFIG.folder, tags } = body;

      if (!file || !fileName) {
        return NextResponse.json(
          { success: false, error: 'Both "file" (base64 or URL) and "fileName" are required.' },
          { status: 400 }
        );
      }

      const result = await uploadToImageKit({
        file,
        fileName,
        folder,
        tags: Array.isArray(tags) ? tags : ['casmik'],
      });

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Handle Multipart form-data
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const customFileName = formData.get('fileName') as string | null;
      const folder = (formData.get('folder') as string | null) || IMAGEKIT_CONFIG.folder;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'File upload missing in form-data ("file" key).' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadToImageKit({
        file: buffer,
        fileName: customFileName || file.name,
        folder,
        tags: ['casmik', 'upload'],
      });

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported Content-Type. Use multipart/form-data or application/json.' },
      { status: 415 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to upload image to ImageKit',
      },
      { status: 500 }
    );
  }
}
