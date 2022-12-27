export type Message = {
  authorId: string;
  content: string;
  own?: boolean;
};

/* chat name as key, message list as values */
export const chats: Record<string, Message[]> = {};
