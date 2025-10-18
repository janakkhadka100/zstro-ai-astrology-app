import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  userss,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  type Message,
  messagess,
  vote,
  astrologicalData,
  district,
  payment,
  subscription,
  Payment
} from './schema';
import { ArtifactKind } from '@/components/artifact';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(users).where(eq(users.email, email));
  } catch (error) {
    console.error('Failed to get users from database');
    throw error;
  }
}

export async function createUser(email: string, password: string, name: string, gender: "male" | "female" | "other", dob: string, time: string, latitude: string, longitude: string, timezone: string, place: string, role: "users" | "admin" = "users"): Promise<{ id: string } | null> {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    const [newUser] = await db
      .insert(users)
      .values({ email, password: hash, name, gender, dob, time, latitude, longitude, timezone, place, role })
      .returning({ id: users.id });

    return newUser || null; // Ensure we return the users object containing `id`
  } catch (error) {
    console.error('Failed to create users in database', error);
    throw error;
  }
}
export async function getUserByResetToken(token: string) {
  try {
    const [selectedUser] = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, token));

    return selectedUser;
  } catch (error) {
    console.error('Failed to get users by reset token from database', error);
    throw error;
  }
}
export async function getUserById(usersId: string) {
  try {
    const [selectedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, usersId));

    return selectedUser;
  } catch (error) {
    console.error('Failed to get users by id from database', error);
    throw error;
  }
}
export async function getUserByEmail(email: string) {
  try {
    const [selectedUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return selectedUser;
  } catch (error) {
    console.error('Failed to get users by email from database', error);
    throw error;
  }
}

export async function updateUserPassword(
  usersId: string,
  newPassword: string
) {
  try {
    // Hash the new password
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(newPassword, salt);

    // Update password in the database
    const [updatedUser] = await db
      .update(users)
      .set({
        password: hashedPassword
      })
      .where(eq(users.id, usersId))
      .returning({
        id: users.id,
        email: users.email,
        password: users.password,
      });

    return updatedUser;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw new Error("Failed to reset password");
  }
}

export async function resetTokenUpdate(
  usersId: string,
  resetToken: string | null,
  resetTokenExpiry: Date | null,
) {
  try {

    // Update resetToken and resetTokenExpiry in the database
    const [updatedUser] = await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiry: resetTokenExpiry,  // This will be a valid timestamp now
      })
      .where(eq(users.id, usersId))
      .returning({
        id: users.id,
        resetToken: users.resetToken,
        resetTokenExpiry: users.resetTokenExpiry,
      });
    return updatedUser;
  } catch (error) {
    console.error("Error updating reset token:", error);
    throw new Error("Failed to update reset token");
  }
}


export async function saveChat({
  id,
  usersId,
  title,
}: {
  id: string;
  usersId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      usersId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(messages).where(eq(messages.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.usersId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by users from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({ messagess }: { messagess: Array<Message> }) {
  try {
    return await db.insert(messages).values(messagess);
  } catch (error) {
    console.error('Failed to save messagess in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, id))
      .orderBy(asc(messages.createdAt));
  } catch (error) {
    console.error('Failed to get messagess by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messagesId,
  type,
}: {
  chatId: string;
  messagesId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messagesId, messagesId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messagesId, messagesId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messagesId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote messages in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  usersId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  usersId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      usersId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(messages).where(eq(messages.id, id));
  } catch (error) {
    console.error('Failed to get messages by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagessToDelete = await db
      .select({ id: messages.id })
      .from(messages)
      .where(
        and(eq(messages.chatId, chatId), gte(messages.createdAt, timestamp)),
      );

    const messagesIds = messagessToDelete.map((messages) => messages.id);

    if (messagesIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messagesId, messagesIds)),
        );

      return await db
        .delete(messages)
        .where(
          and(eq(messages.chatId, chatId), inArray(messages.id, messagesIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messagess by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

export async function getAstroDataByUserIdAndType({ usersId, type }: { usersId: string; type: string }) {
  try {
    const [selectedData] = await db
      .select()
      .from(astrologicalData)
      .where(and(eq(astrologicalData.usersId, usersId), eq(astrologicalData.type, type)))
      .orderBy(desc(astrologicalData.createdAt));
    return selectedData;
  } catch (error) {
    console.error('Failed to get Astrological Data by users id and type from database', error);
    throw error;
  }
}

export const storeAstrologicalData = async (usersId: string, type: string, content: any) => {
  try {
    await db.insert(astrologicalData).values({
      usersId,
      type,
      content: content, // Ensure full JSON is stored
      createdAt: new Date(),
    });

    console.log('Astrological data stored successfully:', content);
  } catch (error) {
    console.error('Failed to store astrological data:', error);
    throw error;
  }
};
export async function getAllDistricts() {
  try {
    return await db.select().from(district).orderBy(asc(district.districtName));
  } catch (error) {
    console.error('Failed to get all districts from database', error);
    throw error;
  }
}

export async function getDistrictById({ id }: { id: string }) {
  try {
    const [selectedDistrict] = await db
      .select()
      .from(district)
      .where(eq(district.id, id));

    return selectedDistrict;
  } catch (error) {
    console.error('Failed to get district by id from database', error);
    throw error;
  }
}

export async function isCoinSufficient(usersId: string): Promise<boolean> {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, usersId));

  if (!existingUser) throw new Error('User not found');
  const coins = existingUser.coins ?? 0;

  return coins >= 10;
}

export async function updateUserMessageStats(usersId: string): Promise<void> {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, usersId));

  if (!existingUser) throw new Error('User not found');

  const now = new Date();
  
  await db
    .update(users)
    .set({
      coins: (existingUser.coins && existingUser.coins > 10) ? existingUser.coins - 10 :  0,
      lastMessageAt: now,
    })
    .where(eq(users.id, usersId));
}

export async function storeSubscriptionInfo(
  usersId: string,
  subscriptionDetails: { coins: number; status?: "active" | "canceled" | "expired" },
): Promise<void> {
  try {
    await db.insert(subscription).values({
      usersId,
      coins: subscriptionDetails.coins,
      status: subscriptionDetails.status || "active",
      createdAt: new Date(),
    });
    await db
      .update(users)
      .set({
        coins: sql`${users.coins} + ${subscriptionDetails.coins}`,
      })
      .where(eq(users.id, usersId));
  } catch (error) {
    console.error("Failed to store subscription information:", error);
    throw error;
  }
}

export async function storePaymentInfo(usersId: string, paymentDetails: any): Promise<boolean> {
  try {
    const [existingPayment] = await db
    .select()
    .from(payment)
    .where(and(eq(payment.usersId, usersId), eq(payment.transactionId, paymentDetails.transactionId)));

    if (!existingPayment) {
      await db.insert(payment).values({
        usersId,
        ...paymentDetails,
        createdAt: new Date(),
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to store payment information:", error);
    throw error;
  }
}

export async function upgradeToPremium(usersId: string): Promise<{ isPremium: boolean }> {
  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, usersId));

    if (!existingUser) throw new Error("User not found");

    await db
      .update(users)
      .set({ isPremium: true })
      .where(eq(users.id, usersId));

    return { isPremium: true };
  } catch (error) {
    console.error("Error upgrading users to premium:", error);
    throw error;
  }
}
export async function getPaymentHistoryByUserId(usersId: string) {
  try {
    return await db
      .select()
      .from(payment)
      .where(eq(payment.usersId, usersId))
      .orderBy(desc(payment.createdAt));
  } catch (error) {
    console.error('Failed to get payment history by users id from database', error);
    throw error;
  }
}
export async function checkUserSubscriptionAndUpdateIfExpired(usersId: string) {
  try {
    // Fetch the latest subscription (assuming one per users)
    const result = await db
      .select()
      .from(subscription)
      .where(eq(subscription.usersId, usersId))
      .orderBy(desc(subscription.createdAt))
      .limit(1);

    const sub = result[0]; // get the first subscription row

    if (sub && sub.expiresAt && sub.expiresAt < new Date()) {
      // If subscription is expired, update status
      await db
        .update(subscription)
        .set({ status: 'expired' })
        .where(eq(subscription.id, sub.id));

      await db
        .update(users)
        .set({ isPremium: false })
        .where(eq(users.id, usersId));
    }

    return sub;
  } catch (error) {
    console.error('Failed to check users subscription from database', error);
    throw error;
  }
}
export async function getAllUsers(): Promise<User[]> {
  try {
    return await db
      .select()
      .from(users)
      .orderBy(asc(users.role));
  } catch (error) {
    console.error('Failed to get all userss from database', error);
    throw error;
  }
}
export type PaymentWithUser = {
  id: string;
  amount: number;
  method: "khalti" | "esewa" | "connectips";
  status: "pending" | "completed" | "failed";
  transactionId: string;
  transactionCode: string;
  createdAt: Date;
  name: string | null;   // from users
  email: string | null;  // from users
};
export async function getAllPayments(): Promise<PaymentWithUser[]> {
  try {
    return await db
      .select({
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        transactionCode: payment.transactionCode,
        createdAt: payment.createdAt,
        name: users.name,
        email: users.email,
      })
      .from(payment)
      .leftJoin(users, eq(payment.usersId, users.id))
      .orderBy(desc(payment.createdAt));
  } catch (error) {
    console.error("Failed to get all payments from database", error);
    throw error;
  }
}
export async function updateUserCoins(usersId: string, coinsToAdd: number) {
  try {
    await db
      .update(users)
      .set({
        coins: sql`${users.coins} + ${coinsToAdd}`,
      })
      .where(eq(users.id, usersId));

    return { success: true };
  } catch (error) {
    console.error("Failed to update users coins", error);
    throw error;
  }
}
export async function getUserRole(
  email: string
): Promise<{ role: string } | null> {
  try {
    const [selectedUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, email));

    return selectedUser || null;
  } catch (error) {
    console.error("Failed to get users role from database", error);
    throw error;
  }
}