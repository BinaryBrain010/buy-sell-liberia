import { NextRequest, NextResponse } from 'next/server';
import { parseFiles } from '@/lib/multer';

export async function POST(req: NextRequest) {
  try {
    console.log('=== LOGO UPLOAD TEST ===');
    console.log('Content-Type:', req.headers.get('content-type'));
    console.log('Content-Length:', req.headers.get('content-length'));
    
    const { files, fields } = await parseFiles(req);
    
    console.log('Files found:', files.length);
    console.log('Files details:', files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified
    })));
    
    console.log('Form fields:', Object.keys(fields));
    console.log('Form fields values:', fields);
    
    // Check for logo specifically
    const logoFile = files.find(f => f.name === 'logo');
    console.log('Logo file found:', !!logoFile);
    
    if (logoFile) {
      console.log('Logo file details:', {
        name: logoFile.name,
        size: logoFile.size,
        type: logoFile.type
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Upload test completed',
      files: files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      })),
      fields: fields,
      logoFound: !!logoFile
    });
  } catch (error: any) {
    console.error('Upload test error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
