import { NextResponse } from 'next/server';
import { 
  saveToMediaLibrary, 
  getMediaLibrary, 
  deleteFromMediaLibrary,
  MediaCategory 
} from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - List media library items with optional filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category') as MediaCategory | null;
    const projectId = searchParams.get('projectId');
    const limit = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const items = await getMediaLibrary(userId, {
      category: category || undefined,
      projectId: projectId || undefined,
      limit: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json({
      success: true,
      items,
      count: items.length
    });

  } catch (error: any) {
    console.error("Media Library GET error:", error);
    return NextResponse.json({ 
      error: 'Failed to fetch media library',
      message: error.message 
    }, { status: 500 });
  }
}

// POST - Save a new media item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId, 
      imageUrl, 
      prompt, 
      category, 
      subcategory,
      model, 
      projectId, 
      projectName 
    } = body;

    // Validation
    if (!userId || !imageUrl || !prompt || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, imageUrl, prompt, category' 
      }, { status: 400 });
    }

    const validCategories: MediaCategory[] = ['logo', 'pattern', 'mockup', 'hero', 'color_mood', 'social', 'cover'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      }, { status: 400 });
    }

    const id = await saveToMediaLibrary(userId, {
      imageUrl,
      prompt,
      category,
      subcategory,
      model: model || 'unknown',
      projectId,
      projectName,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      id,
      message: 'تصویر با موفقیت در کتابخانه ذخیره شد'
    });

  } catch (error: any) {
    console.error("Media Library POST error:", error);
    return NextResponse.json({ 
      error: 'Failed to save to media library',
      message: error.message 
    }, { status: 500 });
  }
}

// DELETE - Remove a media item
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const itemId = searchParams.get('itemId');

    if (!userId || !itemId) {
      return NextResponse.json({ 
        error: 'userId and itemId are required' 
      }, { status: 400 });
    }

    await deleteFromMediaLibrary(userId, itemId);

    return NextResponse.json({
      success: true,
      message: 'تصویر از کتابخانه حذف شد'
    });

  } catch (error: any) {
    console.error("Media Library DELETE error:", error);
    return NextResponse.json({ 
      error: 'Failed to delete from media library',
      message: error.message 
    }, { status: 500 });
  }
}
