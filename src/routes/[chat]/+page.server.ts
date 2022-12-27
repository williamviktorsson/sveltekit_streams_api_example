import { error, fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { chats, type Message } from "$lib/chats";
import { streams } from "./+server";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!(params.chat in chats)) {
    throw error(404, "chat not found");
  }

  /* Find the correct chat */
  const chat = chats[params.chat];

  /* set boolean own to true for all messages in the chat which the current user wrote */
  chat.forEach((e) => (e.own = e.authorId == locals.userid));

  return { chat };
};

export const actions: Actions = {
  write: async ({ request, params, locals }) => {
    const form = await request.formData();
    const message = form.get("message")?.toString();
    if (!message) {
      return fail(400, { error: "missing message" });
    }

    if (!params.chat || !(params.chat in chats)) {
      throw error(404, "chat not found");
    }

    // what chat are we writing to ?
    const chat = chats[params.chat];

    // create the message
    const msg: Message = {
      authorId: locals.userid,
      content: message,
    };

    // add to "database"
    chat.push(msg);

    // send the message to all connected clients.
    for (const userid in streams) {
      /* send messages to all other streams (exept own), for this chat */
      const connection = streams[userid];
      if (connection.chat == params.chat && userid != locals.userid) {
        /* enqueue messages to all streams for this chat */
        connection.controller.enqueue(JSON.stringify(msg));
      }
    }
  },
};
