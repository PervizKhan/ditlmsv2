import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/services/certificate.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await CertificateService.getCertificate(params.id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    
    return NextResponse.json(result.data);
    
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return NextResponse.json({ error: 'Failed to fetch certificate' }, { status: 500 });
  }
}