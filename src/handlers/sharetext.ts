import type { Context } from "grammy";
import type { Env } from "../env.js";
import type { IfsEvent } from "../domain/types.js";
import { ensureUser } from "../session.js";
import { t, isSupportedLanguage } from "../i18n/index.js";
import { getEventByCode, getEventById } from "../db/events.js";
import { getParticipant } from "../db/participants.js";
import { renderShareText } from "../domain/shareText.js";

export async function handleShareText(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const parts = String(ctx.match ?? "").trim().split(/\s+/).filter(Boolean);

  // Event codes are always 6 characters (see domain/codeGen.ts) and
  // language codes always 2, so a lone argument is unambiguous: /sharetext
  // <lang> means "my current event, in this language", while a second
  // argument always means the first one is an explicit event code. This
  // is a length check, not a isSupportedLanguage() check — an
  // unsupported-but-2-character value (e.g. "ru") must still land in the
  // [lang] slot so it hits the "invalid language" error below, instead
  // of being looked up as an event code and reported as not found.
  let codeArg = parts[0];
  let langArg = parts[1];
  if (codeArg && !langArg && codeArg.length === 2) {
    langArg = codeArg;
    codeArg = undefined;
  }

  let lang = user.language;
  if (langArg) {
    const normalized = langArg.toLowerCase();
    if (!isSupportedLanguage(normalized)) {
      await ctx.reply(t(user.language, "language.invalid", { code: normalized }));
      return;
    }
    lang = normalized;
  }

  let event: IfsEvent | null;
  if (codeArg) {
    event = await getEventByCode(env.DB, codeArg);
    if (!event) {
      await ctx.reply(t(user.language, "common.eventNotFound"));
      return;
    }
  } else {
    const participant = await getParticipant(env.DB, user.userId);
    event = participant ? await getEventById(env.DB, participant.eventId) : null;
    if (!event) {
      await ctx.reply(t(user.language, "sharetext.noCurrentEvent"));
      return;
    }
  }

  if (event.status !== "active") {
    await ctx.reply(t(user.language, "common.eventClosed"));
    return;
  }

  await ctx.reply(renderShareText(lang, event), { parse_mode: "HTML" });
}
