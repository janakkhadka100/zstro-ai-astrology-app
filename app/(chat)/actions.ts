// app/(chat)/actions.ts
// Chat actions for ZSTRO AI

// import { auth } from '@/auth';
import { getAstroPayload } from './actions';

export async function getChatActions() {
  // const session = await auth();
  return {
    session: null,
    getAstroPayload: null
  };
}
