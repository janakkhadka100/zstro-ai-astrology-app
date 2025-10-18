import { NextRequest, NextResponse } from 'next/server';
import { prokeralaService } from '@/lib/services/prokerala-service';

export async function POST(req: NextRequest) {
  try {
    const { name, birthDetails } = await req.json();
    
    // Prokerala service बाट kundali generate गर्ने
    const result = await prokeralaService.getKundali(birthDetails);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Kundali API Error:', error);
    return NextResponse.json(
      { success: false, error: 'कुण्डली बनाउन सकिएन' },
      { status: 500 }
    );
  }
}
