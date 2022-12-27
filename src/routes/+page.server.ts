import { chats } from "$lib/chats";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return { chats: Object.keys(chats) };
};

export const actions: Actions = {
  add: async ({ request }) => {
    const form = await request.formData();
    const forumname = form.get("chatname")?.toString();
    if (!forumname) {
      return fail(400, { error: "missing chat name" });
    } else {
      if (!(forumname in chats)) {
        chats[forumname] = [];
      } else {
        return fail(400, { error: "chat already exists" });
      }
    }
  },
};
