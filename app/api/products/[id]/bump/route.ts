import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '../../../modules/products/services/product.service';
import dbConnect from '@/lib/mongoose';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  const productService = new ProductService();

  try {
    const product = await productService.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if ((product as any).bumpCount >= 2) {
      return NextResponse.json({ error: 'Product has reached the maximum number of bumps' }, { status: 400 });
    }
    (product as any).bumpCount = ((product as any).bumpCount || 0) + 1;
    (product as any).lastBumpedAt = new Date();
    await product.save();
    return NextResponse.json({ message: 'Product bumped successfully', product });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to bump product', details: error?.message || String(error) }, { status: 500 });
  }
}
