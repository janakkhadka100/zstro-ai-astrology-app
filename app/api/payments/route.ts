import { getAllPayments } from '@/lib/db/queries';

export async function GET(request: Request) {
  try {
    const payments = await getAllPayments();
    return new Response(JSON.stringify(payments), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return new Response('Failed to fetch payments', { status: 500 });
  }
}
