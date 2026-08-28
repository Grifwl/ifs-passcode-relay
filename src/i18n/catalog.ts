type Params = Record<string, string | number>;
type Message = (params: Params) => string;

const en = {
  "common.genericError": () => "Something went wrong. Please try again.",
  "common.eventNotFound": () => "No active event found with that code.",
  "common.eventClosed": () => "That event is closed.",

  "start.welcome": () =>
    "Welcome! This bot helps a group of Ingress First Saturday attendees build a shared event passcode in real time.\n\n" +
    "Use /join <code> to join an event someone already created, or /newevent to start one yourself. Send /help to see every command.",
  "help.text": () =>
    "Commands:\n" +
    "/language <code> - set your language (en, ca, es, fr)\n" +
    "/newevent <name> [| <pattern>] - create an event\n" +
    "/sharetext [code] [lang] - get an invite message to share (defaults to your current event)\n" +
    "/join <code> - join an event\n" +
    "/leave - leave your current event\n" +
    "/myevent - show which event you're in\n" +
    '"<position> <value>" or /submit - report a value\n' +
    '"<position>" alone (no value) - remove your own report at that position\n' +
    "/status - show the current passcode\n" +
    "/resolve <position> [<value|@user>] - settle a disagreement, or list current candidates as buttons (administrator)\n" +
    "/resolve - go through every position still in disagreement, one at a time (administrator)\n" +
    "/unresolve <position> - reopen a resolved position (administrator)\n" +
    "/trust, /troll, /untrust <@user> - moderate a participant (administrator)\n" +
    "/kick <@user> - remove a participant (administrator)\n" +
    "/promote <@user> - hand the administrator role to another participant (administrator)\n" +
    "/claim - take over as administrator if the current one has been inactive a while\n" +
    "/verify <passcode> - confirm a store-validated passcode, resolve every position from it and close the event (administrator)\n" +
    "/events - list the events you administer",

  "language.usage": () => "Usage: /language <code>. Supported: en, ca, es, fr.",
  "language.invalid": (p) => `"${p.code}" isn't a supported language. Supported: en, ca, es, fr.`,
  "language.set": () => "Your language is now set to English.",

  "newevent.usage": (p) =>
    `Usage: /newevent <name> or /newevent <name> | <pattern>. Default pattern: ${p.defaultPattern}. ` +
    `The "|" separates the name from the pattern, e.g.: /newevent Barcelona 2026-08 | ${p.defaultPattern}`,
  "newevent.invalidPattern": () => "That pattern isn't valid: it can only contain X (letter), 9 (digit) and * (word).",
  "newevent.created": (p) =>
    `Event "${p.name}" created. Join code: ${p.code}\nPattern: ${p.pattern}\n` +
    `You've been joined automatically and marked as trusted. Report what you find as "<position> <value>", e.g. "6 GLYPH".\n\n` +
    `Share (or forward) the message below with the event's group, or with anyone you want to help solve the passcode:`,

  "sharetext.text": (p) => `Join the passcode relay for "${p.name}": open the bot ${p.bot} and send:`,
  "sharetext.tapToCopy": () => "Tap the command above to copy it, then tap the bot's name to send it.",
  "sharetext.otherLanguages": () => "Need this in another language?\nTap below.",
  "sharetext.noCurrentEvent": () => "You're not in an event. Specify a code: /sharetext <code> [lang].",

  "join.usage": () => "Usage: /join <code>.",
  "join.confirmSwitch": (p) => `You're already in "${p.currentEventName}". Switch to "${p.newEventName}"?`,
  "join.confirmYesButton": () => "Yes, switch",
  "join.confirmNoButton": () => "Cancel",
  "join.switched": (p) => `Switched to "${p.name}".`,
  "join.joined": (p) => `Joined "${p.name}". Report what you find as "<position> <value>", e.g. "6 GLYPH".`,
  "join.shareHint": () => "Want to help others find this event? Run /sharetext to get an invite message to share.",
  "join.alreadyInThisEvent": (p) => `You're already in "${p.name}".`,
  "join.cancelled": (p) => `Cancelled — you're still in "${p.name}".`,

  "leave.notInEvent": () => "You're not currently in any event.",
  "leave.left": (p) => `Left "${p.name}".`,
  "leave.leftPromoted": (p) => `Left "${p.name}". ${p.successor} is now its administrator.`,
  "leave.autoPromoted": (p) =>
    `You are now the administrator of "${p.name}" — its previous administrator left. Send /help to see the commands you can now use.`,
  "leave.closedAbandoned": (p) =>
    `Left "${p.name}". No one left in the event was eligible to take over as administrator, so it's been closed as unfinished.`,
  "leave.anotherParticipant": () => "Another participant",

  "myevent.notInEvent": () => "You're not currently in any event. Use /join <code> or /newevent to start one.",
  "myevent.info": (p) => `You're in "${p.name}" (code ${p.code}, pattern ${p.pattern}).`,

  "status.header": (p) => `${p.name} — ${p.known}/${p.total} known`,
  "status.supportCount": (p) => `Supported by ${p.count}`,
  "status.supportedBy": (p) => `Supported by ${p.count} — ${p.names}`,
  "status.tooManyVariants": (p) =>
    `Too many open possibilities right now (${p.count}). Ask the event's administrator to /resolve some positions.`,
  "status.moreVariants": (p) => `+${p.count} more possibilities — ask the event's administrator to /resolve some positions.`,

  "slotType.letter": () => "a letter",
  "slotType.digit": () => "a digit",
  "slotType.word": () => "a word",

  "common.notInEvent": () => "You're not in an event. Use /join <code> first.",
  "common.notAdmin": () => "Only the event's administrator can do that.",
  "common.userNotFound": () => "Couldn't find that participant. Use their @username or the name shown in /status.",
  "common.invalidPosition": (p) => `Position must be a number between 1 and ${p.max}.`,

  "submit.usage": () =>
    'Send it as "<position> <value>" (or /submit <position> <value>) to report a value, ' +
    'or just "<position>" with no value to remove your own report there.',
  "submit.recorded": (p) => `Recorded: position ${p.position} = "${p.value}".`,
  "submit.selfCorrected": (p) =>
    `Updated: position ${p.position} is now "${p.value}" (it was "${p.previous}").`,
  "submit.selfRemoved": (p) => `Removed: your value "${p.value}" for position ${p.position} is no longer reported.`,
  "submit.nothingToRemove": (p) => `You hadn't reported anything at position ${p.position}.`,
  "submit.alreadyRecorded": (p) => `Already recorded: position ${p.position} = "${p.value}".`,
  "submit.positionResolvedNotice": (p) =>
    `Position ${p.position} is already confirmed as "${p.value}" by the event's administrator. Noted anyway.`,
  "submit.confirmOtherConflict": (p) =>
    `Position ${p.position} already has "${p.existing}" reported by someone else. Also record "${p.value}"?`,
  "submit.confirmTypeMismatch": (p) =>
    `Position ${p.position} expects ${p.expected}, but "${p.value}" doesn't look like one. Record it anyway?`,
  "submit.confirmYesButton": () => "Yes, record it",
  "submit.confirmNoButton": () => "Discard",
  "submit.cancelled": () => "Discarded — nothing recorded.",

  "resolve.usage": () =>
    "Usage: /resolve <position> <value>, /resolve <position> @user, /resolve <position> to list current candidates, or /resolve alone to go through every position in disagreement.",
  "resolve.userNoReport": (p) => `That user hasn't reported anything at position ${p.position}.`,
  "resolve.done": (p) => `Position ${p.position} resolved to "${p.value}".`,
  "resolve.noCandidates": (p) => `No one has reported anything at position ${p.position} yet.`,
  "resolve.candidatesHeader": (p) => `Position ${p.position} — reported values:`,
  "resolve.candidateLine": (p) => `"${p.value}" — ${p.count}${p.trustedCount ? ` (${p.trustedCount})` : ""}`,
  "resolve.trustedLegend": () => "(The number in parentheses is how many of those supporters are trusted.)",
  "resolve.candidatesPrompt": () => "Tap a button below to resolve to that value.",
  "resolve.allHeader": (p) => `${p.count} positions still in disagreement. Next: position ${p.position} — reported values:`,
  "resolve.allDone": () =>
    "No positions are currently in disagreement. That's not the same as verified, though — once you've tested a passcode at the game's redeem screen, confirm it with /verify <passcode> to finalize and close the event.",

  "unresolve.usage": () => "Usage: /unresolve <position>.",
  "unresolve.notResolved": (p) => `Position ${p.position} isn't resolved.`,
  "unresolve.done": (p) => `Position ${p.position} reopened.`,

  "trust.usage": () => "Usage: /trust <@username>.",
  "trust.done": (p) => `${p.name} is now marked as trusted.`,
  "troll.usage": () => "Usage: /troll <@username>.",
  "troll.done": (p) => `${p.name}'s reports are now excluded from this event.`,
  "untrust.usage": () => "Usage: /untrust <@username>.",
  "untrust.done": (p) => `${p.name}'s trust flag has been cleared.`,

  "kick.usage": () => "Usage: /kick <@username>.",
  "kick.done": (p) => `${p.name} has been removed from the event.`,
  "kick.notInEvent": (p) => `${p.name} isn't currently in this event.`,

  "promote.usage": () => "Usage: /promote <@username>.",
  "promote.cannotSelf": () => "You're already the event's administrator.",
  "promote.notParticipant": (p) => `${p.name} isn't currently in this event.`,
  "promote.done": (p) => `${p.name} is now this event's administrator. You remain a participant.`,
  "promote.youAreNow": (p) => `You are now the administrator of "${p.name}". Send /help to see the commands you can now use.`,

  "claim.cannotSelf": () => "You are already this event's administrator.",
  "claim.notEligible": () => "You're not eligible to claim this event's administrator role.",
  "claim.joinedQueue": () => "You've joined the queue to take over as administrator if the current one doesn't respond.",
  "claim.alreadyQueued": () => "You're already waiting for the administrator's response.",
  "claim.adminRecentlyActive": (p) =>
    `The administrator has been active in the last ${p.minutes} minutes, so you can't claim the role yet. Try again later.`,
  "claim.notifyAdmin": (p) =>
    `${p.claimant} wants to take over as administrator of "${p.name}", since you haven't been active in a while. Keep the role, or hand it over?`,
  "claim.keepButton": () => "Keep the role",
  "claim.acceptButton": () => "Hand it over",
  "claim.opened": (p) =>
    `The administrator has been notified and has ${p.minutes} minutes to respond. If they don't, run /claim again after that to force the handover.`,
  "claim.kept": (p) => `You've kept the administrator role for "${p.name}".`,
  "claim.handedOver": (p) => `You've handed over the administrator role for "${p.name}".`,
  "claim.handedOverTimeout": (p) =>
    `Since you didn't respond in time, the administrator role for "${p.name}" has been handed over automatically.`,
  "claim.becameAdmin": (p) =>
    `You are now the administrator of "${p.name}" after claiming the role due to inactivity. Send /help to see the commands you can now use.`,
  "claim.alreadyResolved": () => "This request has already been resolved.",

  "verify.usage": () => "Usage: /verify <passcode>. Paste the exact passcode the game confirmed as correct when redeemed.",
  "verify.matched": () => "Passcode confirmed — every position has been resolved to match it. Closing the event…",
  "verify.stillUnresolved": (p) => `Resolve these positions first: ${p.positions}.`,
  "verify.finalMessage": (p) => `Final passcode for "${p.name}":`,
  "verify.closed": () => "Event closed. Final passcode sent to every participant.",
  "verify.noMatch": () =>
    "That passcode doesn't match any combination of currently reported values. Double-check what you pasted — it may also mean a candidate is missing.",
  "verify.ambiguous": () =>
    "That passcode matches more than one possible combination of currently reported values, so it can't tell which one is right on its own. Resolve some positions manually first.",
  "verify.overwhelmed": () =>
    "There are too many open possibilities to check right now. Resolve some positions manually first, then try /verify again.",

  "events.none": () => "You don't administer any events yet.",
  "events.list": (p) => `Your events:\n${p.items}`,
  "events.itemLine": (p) => `• ${p.name} — ${p.code} (${p.status})`,
} satisfies Record<string, Message>;

export type MessageKey = keyof typeof en;
type Catalog = Record<MessageKey, Message>;

const ca: Catalog = {
  "common.genericError": () => "S'ha produït un error. Torna-ho a provar.",
  "common.eventNotFound": () => "No s'ha trobat cap esdeveniment actiu amb aquest codi.",
  "common.eventClosed": () => "Aquest esdeveniment està tancat.",

  "start.welcome": () =>
    "Benvingut! Aquest bot ajuda un grup d'assistents a un Ingress First Saturday a construir el passcode de l'esdeveniment en temps real.\n\n" +
    "Fes servir /join <codi> per unir-te a un esdeveniment que algú ja ha creat, o /newevent per crear-ne un tu mateix. Envia /help per veure totes les comandes.",
  "help.text": () =>
    "Comandes:\n" +
    "/language <codi> - estableix el teu idioma (en, ca, es, fr)\n" +
    "/newevent <nom> [| <patró>] - crea un esdeveniment\n" +
    "/sharetext [codi] [idioma] - obté un text d'invitació per compartir (per defecte, el teu esdeveniment actual)\n" +
    "/join <codi> - uneix-te a un esdeveniment\n" +
    "/leave - surt de l'esdeveniment actual\n" +
    "/myevent - mostra a quin esdeveniment estàs\n" +
    '"<posició> <valor>" o /submit - reporta un valor\n' +
    '"<posició>" sola (sense valor) - elimina el teu report en aquella posició\n' +
    "/status - mostra el passcode actual\n" +
    "/resolve <posició> [<valor|@usuari>] - resol una discrepància, o llista els valors reportats com a botons (administrador)\n" +
    "/resolve - repassa totes les posicions encara en discrepància, una per una (administrador)\n" +
    "/unresolve <posició> - reobre una posició resolta (administrador)\n" +
    "/trust, /troll, /untrust <@usuari> - modera un participant (administrador)\n" +
    "/kick <@usuari> - expulsa un participant (administrador)\n" +
    "/promote <@usuari> - cedeix el rol d'administrador a un altre participant (administrador)\n" +
    "/claim - assumeix el càrrec d'administrador si l'actual fa temps que és inactiu\n" +
    "/verify <passcode> - confirma un passcode validat a la botiga, resol totes les posicions a partir d'ell i tanca l'esdeveniment (administrador)\n" +
    "/events - llista els esdeveniments que administres",

  "language.usage": () => "Ús: /language <codi>. Suportats: en, ca, es, fr.",
  "language.invalid": (p) => `"${p.code}" no és un idioma suportat. Suportats: en, ca, es, fr.`,
  "language.set": () => "El teu idioma ara és el català.",

  "newevent.usage": (p) =>
    `Ús: /newevent <nom> o /newevent <nom> | <patró>. Patró per defecte: ${p.defaultPattern}. ` +
    `El "|" separa el nom del patró, p. ex.: /newevent Barcelona 2026-08 | ${p.defaultPattern}`,
  "newevent.invalidPattern": () => "Aquest patró no és vàlid: només pot contenir X (lletra), 9 (número) i * (paraula).",
  "newevent.created": (p) =>
    `Esdeveniment "${p.name}" creat. Codi d'accés: ${p.code}\nPatró: ${p.pattern}\n` +
    `T'hi has unit automàticament i t'has marcat com a de confiança. Reporta el que trobis com a "<posició> <valor>", p.ex. "6 GLYPH".\n\n` +
    `Comparteix (o reenvia) el missatge següent al grup de l'esdeveniment o amb qui vulguis resoldre el passcode:`,

  "sharetext.text": (p) => `Uneix-te al relleu de passcode de "${p.name}": obre el bot ${p.bot} i envia:`,
  "sharetext.tapToCopy": () => "Toca la comanda de sobre per copiar-la i després toca el nom del bot per enviar-l'hi.",
  "sharetext.otherLanguages": () => "Ho vols en un altre idioma?\nClica aquí sota.",
  "sharetext.noCurrentEvent": () => "No estàs en cap esdeveniment. Especifica un codi: /sharetext <codi> [idioma].",

  "join.usage": () => "Ús: /join <codi>.",
  "join.confirmSwitch": (p) => `Ja ets a "${p.currentEventName}". Vols canviar a "${p.newEventName}"?`,
  "join.confirmYesButton": () => "Sí, canvia",
  "join.confirmNoButton": () => "Cancel·la",
  "join.switched": (p) => `Has canviat a "${p.name}".`,
  "join.joined": (p) => `T'has unit a "${p.name}". Reporta el que trobis com a "<posició> <valor>", p.ex. "6 GLYPH".`,
  "join.shareHint": () => "Vols ajudar a difondre l'esdeveniment? Executa /sharetext per obtenir un text d'invitació.",
  "join.alreadyInThisEvent": (p) => `Ja ets a "${p.name}".`,
  "join.cancelled": (p) => `Cancel·lat — segueixes a "${p.name}".`,

  "leave.notInEvent": () => "Ara mateix no ets a cap esdeveniment.",
  "leave.left": (p) => `Has sortit de "${p.name}".`,
  "leave.leftPromoted": (p) => `Has sortit de "${p.name}". ${p.successor} n'és ara la persona administradora.`,
  "leave.autoPromoted": (p) =>
    `Ara ets la persona administradora de "${p.name}" — qui ho era abans ha marxat. Envia /help per veure les comandes que ja pots fer servir.`,
  "leave.closedAbandoned": (p) =>
    `Has sortit de "${p.name}". No quedava ningú apte per assumir el rol d'administrador, així que s'ha tancat com a inacabat.`,
  "leave.anotherParticipant": () => "Un altre participant",

  "myevent.notInEvent": () => "Ara mateix no ets a cap esdeveniment. Fes servir /join <codi> o /newevent per crear-ne un.",
  "myevent.info": (p) => `Ets a "${p.name}" (codi ${p.code}, patró ${p.pattern}).`,

  "status.header": (p) => `${p.name} — ${p.known}/${p.total} conegudes`,
  "status.supportCount": (p) => `Donat per bo per ${p.count}`,
  "status.supportedBy": (p) => `Donat per bo per ${p.count} — ${p.names}`,
  "status.tooManyVariants": (p) =>
    `Hi ha massa possibilitats obertes ara mateix (${p.count}). Demana a qui administra l'esdeveniment que faci /resolve d'algunes posicions.`,
  "status.moreVariants": (p) =>
    `+${p.count} possibilitats més — demana a qui administra l'esdeveniment que faci /resolve d'algunes posicions.`,

  "slotType.letter": () => "una lletra",
  "slotType.digit": () => "un número",
  "slotType.word": () => "una paraula",

  "common.notInEvent": () => "No ets a cap esdeveniment. Fes servir /join <codi> primer.",
  "common.notAdmin": () => "Només qui administra l'esdeveniment pot fer això.",
  "common.userNotFound": () => "No s'ha trobat aquest participant. Fes servir el seu @usuari o el nom que surt a /status.",
  "common.invalidPosition": (p) => `La posició ha de ser un número entre 1 i ${p.max}.`,

  "submit.usage": () =>
    'Envia-ho com a "<posició> <valor>" (o /submit <posició> <valor>) per reportar un valor, ' +
    'o només "<posició>" sense valor per eliminar el teu report en aquella posició.',
  "submit.recorded": (p) => `Registrat: posició ${p.position} = "${p.value}".`,
  "submit.selfCorrected": (p) =>
    `Actualitzat: la posició ${p.position} ara és "${p.value}" (abans era "${p.previous}").`,
  "submit.selfRemoved": (p) => `Eliminat: el teu valor "${p.value}" per a la posició ${p.position} ja no consta.`,
  "submit.nothingToRemove": (p) => `No havies reportat res a la posició ${p.position}.`,
  "submit.alreadyRecorded": (p) => `Ja estava registrat: posició ${p.position} = "${p.value}".`,
  "submit.positionResolvedNotice": (p) =>
    `La posició ${p.position} ja està confirmada com a "${p.value}" per qui administra l'esdeveniment. Igualment queda anotat.`,
  "submit.confirmOtherConflict": (p) =>
    `La posició ${p.position} ja té "${p.existing}" reportat per algú altre. També vols registrar "${p.value}"?`,
  "submit.confirmTypeMismatch": (p) =>
    `La posició ${p.position} espera ${p.expected}, però "${p.value}" no ho sembla. Ho vols registrar igualment?`,
  "submit.confirmYesButton": () => "Sí, registra-ho",
  "submit.confirmNoButton": () => "Descarta",
  "submit.cancelled": () => "Descartat — no s'ha registrat res.",

  "resolve.usage": () =>
    "Ús: /resolve <posició> <valor>, /resolve <posició> @usuari, /resolve <posició> per llistar els valors reportats, o /resolve tot sol per repassar totes les posicions en discrepància.",
  "resolve.userNoReport": (p) => `Aquest usuari no ha reportat res a la posició ${p.position}.`,
  "resolve.done": (p) => `Posició ${p.position} resolta com a "${p.value}".`,
  "resolve.noCandidates": (p) => `Ningú ha reportat res a la posició ${p.position} encara.`,
  "resolve.candidatesHeader": (p) => `Posició ${p.position} — valors reportats:`,
  "resolve.candidateLine": (p) => `"${p.value}" — ${p.count}${p.trustedCount ? ` (${p.trustedCount})` : ""}`,
  "resolve.trustedLegend": () => "(El número entre parèntesis és quants d'aquests suports són de confiança.)",
  "resolve.candidatesPrompt": () => "Toca un botó a sota per resoldre amb aquell valor.",
  "resolve.allHeader": (p) => `${p.count} posicions encara en discrepància. Següent: posició ${p.position} — valors reportats:`,
  "resolve.allDone": () =>
    "Ara mateix no hi ha cap posició en discrepància. Això no vol dir que estigui verificat: quan hagis provat un passcode a la pantalla de bescanvi del joc, confirma'l amb /verify <passcode> per finalitzar i tancar l'esdeveniment.",

  "unresolve.usage": () => "Ús: /unresolve <posició>.",
  "unresolve.notResolved": (p) => `La posició ${p.position} no està resolta.`,
  "unresolve.done": (p) => `Posició ${p.position} reoberta.`,

  "trust.usage": () => "Ús: /trust <@usuari>.",
  "trust.done": (p) => `${p.name} ara està marcat com a de confiança.`,
  "troll.usage": () => "Ús: /troll <@usuari>.",
  "troll.done": (p) => `Les aportacions de ${p.name} ara queden excloses d'aquest esdeveniment.`,
  "untrust.usage": () => "Ús: /untrust <@usuari>.",
  "untrust.done": (p) => `S'ha tret la marca de confiança de ${p.name}.`,

  "kick.usage": () => "Ús: /kick <@usuari>.",
  "kick.done": (p) => `${p.name} ha estat expulsat de l'esdeveniment.`,
  "kick.notInEvent": (p) => `${p.name} no és participant d'aquest esdeveniment ara mateix.`,

  "promote.usage": () => "Ús: /promote <@usuari>.",
  "promote.cannotSelf": () => "Ja ets qui administra aquest esdeveniment.",
  "promote.notParticipant": (p) => `${p.name} no és participant d'aquest esdeveniment ara mateix.`,
  "promote.done": (p) => `${p.name} ara és qui administra aquest esdeveniment. Tu continues sent-ne participant.`,
  "promote.youAreNow": (p) => `Ara ets qui administra "${p.name}". Envia /help per veure les comandes que ja pots fer servir.`,

  "claim.cannotSelf": () => "Ja ets qui administra aquest esdeveniment.",
  "claim.notEligible": () => "No pots reclamar el rol d'administrador d'aquest esdeveniment.",
  "claim.joinedQueue": () => "T'has afegit a la cua per assumir el càrrec d'administrador si qui l'ocupa ara no respon.",
  "claim.alreadyQueued": () => "Ja estàs esperant la resposta de l'administrador.",
  "claim.adminRecentlyActive": (p) =>
    `Qui administra l'esdeveniment ha estat actiu en els últims ${p.minutes} minuts, així que encara no pots reclamar el càrrec. Torna-ho a provar més tard.`,
  "claim.notifyAdmin": (p) =>
    `${p.claimant} vol ocupar el càrrec d'administrador de "${p.name}", ja que fa temps que no ets actiu. Vols mantenir el càrrec o cedir-lo?`,
  "claim.keepButton": () => "Mantenir el càrrec",
  "claim.acceptButton": () => "Cedir el càrrec",
  "claim.opened": (p) =>
    `S'ha avisat l'administrador i té ${p.minutes} minuts per respondre. Si no ho fa, torna a fer /claim passat aquest temps per forçar el relleu.`,
  "claim.kept": (p) => `Has mantingut el càrrec d'administrador de "${p.name}".`,
  "claim.handedOver": (p) => `Has cedit el càrrec d'administrador de "${p.name}".`,
  "claim.handedOverTimeout": (p) =>
    `Com que no has respost a temps, el càrrec d'administrador de "${p.name}" s'ha cedit automàticament.`,
  "claim.becameAdmin": (p) =>
    `Ara ets la persona administradora de "${p.name}" després de reclamar el càrrec per inactivitat. Envia /help per veure les comandes que ja pots fer servir.`,
  "claim.alreadyResolved": () => "Aquesta petició ja s'ha resolt.",

  "verify.usage": () => "Ús: /verify <passcode>. Enganxa el passcode exacte que el joc ha confirmat com a correcte en bescanviar-lo.",
  "verify.matched": () => "Passcode confirmat — totes les posicions s'han resolt en conseqüència. Tancant l'esdeveniment…",
  "verify.stillUnresolved": (p) => `Resol primer aquestes posicions: ${p.positions}.`,
  "verify.finalMessage": (p) => `Passcode final de "${p.name}":`,
  "verify.closed": () => "Esdeveniment tancat. El passcode final s'ha enviat a tots els participants.",
  "verify.noMatch": () =>
    "Aquest passcode no coincideix amb cap combinació dels valors reportats actualment. Comprova el que has enganxat — també pot ser que falti algun candidat per reportar.",
  "verify.ambiguous": () =>
    "Aquest passcode coincideix amb més d'una combinació possible dels valors reportats actualment, així que no es pot saber quina és la correcta automàticament. Resol algunes posicions manualment primer.",
  "verify.overwhelmed": () =>
    "Hi ha massa possibilitats obertes per comprovar-ho ara mateix. Resol algunes posicions manualment primer i torna a provar /verify.",

  "events.none": () => "Encara no administres cap esdeveniment.",
  "events.list": (p) => `Els teus esdeveniments:\n${p.items}`,
  "events.itemLine": (p) => `• ${p.name} — ${p.code} (${p.status})`,
};

const es: Catalog = {
  "common.genericError": () => "Se ha producido un error. Inténtalo de nuevo.",
  "common.eventNotFound": () => "No se ha encontrado ningún evento activo con ese código.",
  "common.eventClosed": () => "Ese evento está cerrado.",

  "start.welcome": () =>
    "¡Bienvenido! Este bot ayuda a un grupo de asistentes a un Ingress First Saturday a construir el passcode del evento en tiempo real.\n\n" +
    "Usa /join <código> para unirte a un evento que alguien ya haya creado, o /newevent para crear uno tú mismo. Envía /help para ver todos los comandos.",
  "help.text": () =>
    "Comandos:\n" +
    "/language <código> - establece tu idioma (en, ca, es, fr)\n" +
    "/newevent <nombre> [| <patrón>] - crea un evento\n" +
    "/sharetext [código] [idioma] - obtén un texto de invitación para compartir (por defecto, tu evento actual)\n" +
    "/join <código> - únete a un evento\n" +
    "/leave - sal del evento actual\n" +
    "/myevent - muestra en qué evento estás\n" +
    '"<posición> <valor>" o /submit - reporta un valor\n' +
    '"<posición>" sola (sin valor) - elimina tu reporte en esa posición\n' +
    "/status - muestra el passcode actual\n" +
    "/resolve <posición> [<valor|@usuario>] - resuelve una discrepancia, o lista los valores reportados como botones (administrador)\n" +
    "/resolve - repasa todas las posiciones todavía en discrepancia, una por una (administrador)\n" +
    "/unresolve <posición> - reabre una posición resuelta (administrador)\n" +
    "/trust, /troll, /untrust <@usuario> - modera a un participante (administrador)\n" +
    "/kick <@usuario> - expulsa a un participante (administrador)\n" +
    "/promote <@usuario> - cede el rol de administrador a otro participante (administrador)\n" +
    "/claim - asume el cargo de administrador si el actual lleva tiempo inactivo\n" +
    "/verify <passcode> - confirma un passcode validado en la tienda, resuelve todas las posiciones a partir de él y cierra el evento (administrador)\n" +
    "/events - lista los eventos que administras",

  "language.usage": () => "Uso: /language <código>. Soportados: en, ca, es, fr.",
  "language.invalid": (p) => `"${p.code}" no es un idioma soportado. Soportados: en, ca, es, fr.`,
  "language.set": () => "Tu idioma ahora es el español.",

  "newevent.usage": (p) =>
    `Uso: /newevent <nombre> o /newevent <nombre> | <patrón>. Patrón por defecto: ${p.defaultPattern}. ` +
    `El "|" separa el nombre del patrón, p. ej.: /newevent Barcelona 2026-08 | ${p.defaultPattern}`,
  "newevent.invalidPattern": () => "Ese patrón no es válido: solo puede contener X (letra), 9 (número) y * (palabra).",
  "newevent.created": (p) =>
    `Evento "${p.name}" creado. Código de acceso: ${p.code}\nPatrón: ${p.pattern}\n` +
    `Te has unido automáticamente y te has marcado como de confianza. Reporta lo que encuentres como "<posición> <valor>", p.ej. "6 GLYPH".\n\n` +
    `Comparte (o reenvía) el siguiente mensaje con el grupo del evento, o con quien quieras que ayude a resolver el passcode:`,

  "sharetext.text": (p) => `Únete al relevo de passcode de "${p.name}": abre el bot ${p.bot} y envía:`,
  "sharetext.tapToCopy": () => "Toca el comando de arriba para copiarlo y luego toca el nombre del bot para enviárselo.",
  "sharetext.otherLanguages": () => "¿Lo quieres en otro idioma?\nTócalo aquí abajo.",
  "sharetext.noCurrentEvent": () => "No estás en ningún evento. Especifica un código: /sharetext <código> [idioma].",

  "join.usage": () => "Uso: /join <código>.",
  "join.confirmSwitch": (p) => `Ya estás en "${p.currentEventName}". ¿Quieres cambiar a "${p.newEventName}"?`,
  "join.confirmYesButton": () => "Sí, cambiar",
  "join.confirmNoButton": () => "Cancelar",
  "join.switched": (p) => `Has cambiado a "${p.name}".`,
  "join.joined": (p) => `Te has unido a "${p.name}". Reporta lo que encuentres como "<posición> <valor>", p.ej. "6 GLYPH".`,
  "join.shareHint": () => "¿Quieres ayudar a difundir el evento? Ejecuta /sharetext para obtener un texto de invitación.",
  "join.alreadyInThisEvent": (p) => `Ya estás en "${p.name}".`,
  "join.cancelled": (p) => `Cancelado — sigues en "${p.name}".`,

  "leave.notInEvent": () => "Ahora mismo no estás en ningún evento.",
  "leave.left": (p) => `Has salido de "${p.name}".`,
  "leave.leftPromoted": (p) => `Has salido de "${p.name}". ${p.successor} ahora es quien lo administra.`,
  "leave.autoPromoted": (p) =>
    `Ahora eres quien administra "${p.name}" — quien lo era antes se ha marchado. Envía /help para ver los comandos que ya puedes usar.`,
  "leave.closedAbandoned": (p) =>
    `Has salido de "${p.name}". No quedaba nadie apto para asumir el rol de administrador, así que se ha cerrado como inacabado.`,
  "leave.anotherParticipant": () => "Otro participante",

  "myevent.notInEvent": () => "Ahora mismo no estás en ningún evento. Usa /join <código> o /newevent para crear uno.",
  "myevent.info": (p) => `Estás en "${p.name}" (código ${p.code}, patrón ${p.pattern}).`,

  "status.header": (p) => `${p.name} — ${p.known}/${p.total} conocidas`,
  "status.supportCount": (p) => `Respaldado por ${p.count}`,
  "status.supportedBy": (p) => `Respaldado por ${p.count} — ${p.names}`,
  "status.tooManyVariants": (p) =>
    `Hay demasiadas posibilidades abiertas ahora mismo (${p.count}). Pide a quien administra el evento que haga /resolve de algunas posiciones.`,
  "status.moreVariants": (p) =>
    `+${p.count} posibilidades más — pide a quien administra el evento que haga /resolve de algunas posiciones.`,

  "slotType.letter": () => "una letra",
  "slotType.digit": () => "un número",
  "slotType.word": () => "una palabra",

  "common.notInEvent": () => "No estás en ningún evento. Usa /join <código> primero.",
  "common.notAdmin": () => "Solo quien administra el evento puede hacer esto.",
  "common.userNotFound": () => "No se ha encontrado a ese participante. Usa su @usuario o el nombre que aparece en /status.",
  "common.invalidPosition": (p) => `La posición debe ser un número entre 1 y ${p.max}.`,

  "submit.usage": () =>
    'Envíalo como "<posición> <valor>" (o /submit <posición> <valor>) para reportar un valor, ' +
    'o solo "<posición>" sin valor para eliminar tu reporte en esa posición.',
  "submit.recorded": (p) => `Registrado: posición ${p.position} = "${p.value}".`,
  "submit.selfCorrected": (p) =>
    `Actualizado: la posición ${p.position} ahora es "${p.value}" (antes era "${p.previous}").`,
  "submit.selfRemoved": (p) => `Eliminado: tu valor "${p.value}" para la posición ${p.position} ya no consta.`,
  "submit.nothingToRemove": (p) => `No habías reportado nada en la posición ${p.position}.`,
  "submit.alreadyRecorded": (p) => `Ya estaba registrado: posición ${p.position} = "${p.value}".`,
  "submit.positionResolvedNotice": (p) =>
    `La posición ${p.position} ya está confirmada como "${p.value}" por quien administra el evento. Igualmente queda anotado.`,
  "submit.confirmOtherConflict": (p) =>
    `La posición ${p.position} ya tiene "${p.existing}" reportado por otra persona. ¿También quieres registrar "${p.value}"?`,
  "submit.confirmTypeMismatch": (p) =>
    `La posición ${p.position} espera ${p.expected}, pero "${p.value}" no lo parece. ¿Lo registras igualmente?`,
  "submit.confirmYesButton": () => "Sí, regístralo",
  "submit.confirmNoButton": () => "Descartar",
  "submit.cancelled": () => "Descartado — no se ha registrado nada.",

  "resolve.usage": () =>
    "Uso: /resolve <posición> <valor>, /resolve <posición> @usuario, /resolve <posición> para listar los valores reportados, o /resolve solo para repasar todas las posiciones en discrepancia.",
  "resolve.userNoReport": (p) => `Ese usuario no ha reportado nada en la posición ${p.position}.`,
  "resolve.done": (p) => `Posición ${p.position} resuelta como "${p.value}".`,
  "resolve.noCandidates": (p) => `Nadie ha reportado nada en la posición ${p.position} todavía.`,
  "resolve.candidatesHeader": (p) => `Posición ${p.position} — valores reportados:`,
  "resolve.candidateLine": (p) => `"${p.value}" — ${p.count}${p.trustedCount ? ` (${p.trustedCount})` : ""}`,
  "resolve.trustedLegend": () => "(El número entre paréntesis es cuántos de esos apoyos son de confianza.)",
  "resolve.candidatesPrompt": () => "Toca un botón debajo para resolver con ese valor.",
  "resolve.allHeader": (p) => `${p.count} posiciones todavía en discrepancia. Siguiente: posición ${p.position} — valores reportados:`,
  "resolve.allDone": () =>
    "Ahora mismo no hay ninguna posición en discrepancia. Eso no significa que esté verificado: cuando hayas probado un passcode en la pantalla de canje del juego, confírmalo con /verify <passcode> para finalizar y cerrar el evento.",

  "unresolve.usage": () => "Uso: /unresolve <posición>.",
  "unresolve.notResolved": (p) => `La posición ${p.position} no está resuelta.`,
  "unresolve.done": (p) => `Posición ${p.position} reabierta.`,

  "trust.usage": () => "Uso: /trust <@usuario>.",
  "trust.done": (p) => `${p.name} ahora está marcado como de confianza.`,
  "troll.usage": () => "Uso: /troll <@usuario>.",
  "troll.done": (p) => `Las aportaciones de ${p.name} ahora quedan excluidas de este evento.`,
  "untrust.usage": () => "Uso: /untrust <@usuario>.",
  "untrust.done": (p) => `Se ha quitado la marca de confianza de ${p.name}.`,

  "kick.usage": () => "Uso: /kick <@usuario>.",
  "kick.done": (p) => `${p.name} ha sido expulsado del evento.`,
  "kick.notInEvent": (p) => `${p.name} no es participante de este evento ahora mismo.`,

  "promote.usage": () => "Uso: /promote <@usuario>.",
  "promote.cannotSelf": () => "Ya eres quien administra este evento.",
  "promote.notParticipant": (p) => `${p.name} no es participante de este evento ahora mismo.`,
  "promote.done": (p) => `${p.name} ahora es quien administra este evento. Tú sigues siendo participante.`,
  "promote.youAreNow": (p) => `Ahora eres quien administra "${p.name}". Envía /help para ver los comandos que ya puedes usar.`,

  "claim.cannotSelf": () => "Ya eres quien administra este evento.",
  "claim.notEligible": () => "No puedes reclamar el rol de administrador de este evento.",
  "claim.joinedQueue": () => "Te has añadido a la cola para asumir el cargo de administrador si quien lo ocupa ahora no responde.",
  "claim.alreadyQueued": () => "Ya estás esperando la respuesta del administrador.",
  "claim.adminRecentlyActive": (p) =>
    `Quien administra el evento ha estado activo en los últimos ${p.minutes} minutos, así que todavía no puedes reclamar el cargo. Inténtalo de nuevo más tarde.`,
  "claim.notifyAdmin": (p) =>
    `${p.claimant} quiere ocupar el cargo de administrador de "${p.name}", ya que hace tiempo que no estás activo. ¿Quieres mantener el cargo o cederlo?`,
  "claim.keepButton": () => "Mantener el cargo",
  "claim.acceptButton": () => "Ceder el cargo",
  "claim.opened": (p) =>
    `Se ha avisado al administrador y tiene ${p.minutes} minutos para responder. Si no lo hace, vuelve a ejecutar /claim pasado ese tiempo para forzar el relevo.`,
  "claim.kept": (p) => `Has mantenido el cargo de administrador de "${p.name}".`,
  "claim.handedOver": (p) => `Has cedido el cargo de administrador de "${p.name}".`,
  "claim.handedOverTimeout": (p) =>
    `Como no has respondido a tiempo, el cargo de administrador de "${p.name}" se ha cedido automáticamente.`,
  "claim.becameAdmin": (p) =>
    `Ahora eres quien administra "${p.name}" tras reclamar el cargo por inactividad. Envía /help para ver los comandos que ya puedes usar.`,
  "claim.alreadyResolved": () => "Esta petición ya se ha resuelto.",

  "verify.usage": () => "Uso: /verify <passcode>. Pega el passcode exacto que el juego ha confirmado como correcto al canjearlo.",
  "verify.matched": () => "Passcode confirmado — todas las posiciones se han resuelto en consecuencia. Cerrando el evento…",
  "verify.stillUnresolved": (p) => `Resuelve antes estas posiciones: ${p.positions}.`,
  "verify.finalMessage": (p) => `Passcode final de "${p.name}":`,
  "verify.closed": () => "Evento cerrado. El passcode final se ha enviado a todos los participantes.",
  "verify.noMatch": () =>
    "Ese passcode no coincide con ninguna combinación de los valores reportados actualmente. Comprueba lo que has pegado — también puede ser que falte algún candidato por reportar.",
  "verify.ambiguous": () =>
    "Ese passcode coincide con más de una combinación posible de los valores reportados actualmente, así que no se puede saber cuál es la correcta automáticamente. Resuelve antes algunas posiciones manualmente.",
  "verify.overwhelmed": () =>
    "Hay demasiadas posibilidades abiertas para comprobarlo ahora mismo. Resuelve antes algunas posiciones manualmente y vuelve a intentar /verify.",

  "events.none": () => "Todavía no administras ningún evento.",
  "events.list": (p) => `Tus eventos:\n${p.items}`,
  "events.itemLine": (p) => `• ${p.name} — ${p.code} (${p.status})`,
};

const fr: Catalog = {
  "common.genericError": () => "Une erreur s'est produite. Réessayez.",
  "common.eventNotFound": () => "Aucun événement actif trouvé avec ce code.",
  "common.eventClosed": () => "Cet événement est clôturé.",

  "start.welcome": () =>
    "Bienvenue ! Ce bot aide un groupe de participants à un Ingress First Saturday à construire le passcode de l'événement en temps réel.\n\n" +
    "Utilisez /join <code> pour rejoindre un événement déjà créé, ou /newevent pour en créer un vous-même. Envoyez /help pour voir toutes les commandes.",
  "help.text": () =>
    "Commandes :\n" +
    "/language <code> - définit votre langue (en, ca, es, fr)\n" +
    "/newevent <nom> [| <modèle>] - crée un événement\n" +
    "/sharetext [code] [langue] - obtient un texte d'invitation à partager (par défaut, votre événement actuel)\n" +
    "/join <code> - rejoindre un événement\n" +
    "/leave - quitter l'événement actuel\n" +
    "/myevent - affiche dans quel événement vous êtes\n" +
    '"<position> <valeur>" ou /submit - signaler une valeur\n' +
    '"<position>" seule (sans valeur) - supprime votre signalement à cette position\n' +
    "/status - affiche le passcode actuel\n" +
    "/resolve <position> [<valeur|@utilisateur>] - règle un désaccord, ou liste les valeurs signalées sous forme de boutons (administrateur)\n" +
    "/resolve - parcourt toutes les positions encore en désaccord, une par une (administrateur)\n" +
    "/unresolve <position> - rouvre une position résolue (administrateur)\n" +
    "/trust, /troll, /untrust <@utilisateur> - modère un participant (administrateur)\n" +
    "/kick <@utilisateur> - exclut un participant (administrateur)\n" +
    "/promote <@utilisateur> - transfère le rôle d'administrateur à un autre participant (administrateur)\n" +
    "/claim - reprend le rôle d'administrateur si l'actuel est inactif depuis un moment\n" +
    "/verify <passcode> - confirme un passcode validé en boutique, résout toutes les positions à partir de lui et clôture l'événement (administrateur)\n" +
    "/events - liste les événements que vous administrez",

  "language.usage": () => "Utilisation : /language <code>. Langues gérées : en, ca, es, fr.",
  "language.invalid": (p) => `"${p.code}" n'est pas une langue gérée. Langues gérées : en, ca, es, fr.`,
  "language.set": () => "Votre langue est maintenant le français.",

  "newevent.usage": (p) =>
    `Utilisation : /newevent <nom> ou /newevent <nom> | <modèle>. Modèle par défaut : ${p.defaultPattern}. ` +
    `Le « | » sépare le nom du modèle, ex. : /newevent Barcelona 2026-08 | ${p.defaultPattern}`,
  "newevent.invalidPattern": () => "Ce modèle n'est pas valide : il ne peut contenir que X (lettre), 9 (chiffre) et * (mot).",
  "newevent.created": (p) =>
    `Événement "${p.name}" créé. Code d'accès : ${p.code}\nModèle : ${p.pattern}\n` +
    `Vous avez été inscrit automatiquement et marqué comme fiable. Signalez ce que vous trouvez sous la forme "<position> <valeur>", ex. "6 GLYPH".\n\n` +
    `Partagez (ou transférez) le message ci-dessous avec le groupe de l'événement, ou avec qui vous voulez pour aider à résoudre le passcode :`,

  "sharetext.text": (p) => `Rejoignez le relais de passcode de "${p.name}" : ouvrez le bot ${p.bot} et envoyez :`,
  "sharetext.tapToCopy": () =>
    "Touchez la commande ci-dessus pour la copier, puis touchez le nom du bot pour la lui envoyer.",
  "sharetext.otherLanguages": () => "Vous le voulez dans une autre langue ?\nAppuyez ci-dessous.",
  "sharetext.noCurrentEvent": () =>
    "Vous n'êtes dans aucun événement. Indiquez un code : /sharetext <code> [langue].",

  "join.usage": () => "Utilisation : /join <code>.",
  "join.confirmSwitch": (p) => `Vous êtes déjà dans "${p.currentEventName}". Passer à "${p.newEventName}" ?`,
  "join.confirmYesButton": () => "Oui, changer",
  "join.confirmNoButton": () => "Annuler",
  "join.switched": (p) => `Vous êtes passé à "${p.name}".`,
  "join.joined": (p) => `Vous avez rejoint "${p.name}". Signalez ce que vous trouvez sous la forme "<position> <valeur>", ex. "6 GLYPH".`,
  "join.shareHint": () =>
    "Vous voulez aider à faire connaître l'événement ? Lancez /sharetext pour obtenir un texte d'invitation.",
  "join.alreadyInThisEvent": (p) => `Vous êtes déjà dans "${p.name}".`,
  "join.cancelled": (p) => `Annulé — vous êtes toujours dans "${p.name}".`,

  "leave.notInEvent": () => "Vous n'êtes actuellement dans aucun événement.",
  "leave.left": (p) => `Vous avez quitté "${p.name}".`,
  "leave.leftPromoted": (p) => `Vous avez quitté "${p.name}". ${p.successor} en est désormais l'administrateur.`,
  "leave.autoPromoted": (p) =>
    `Vous êtes désormais l'administrateur de "${p.name}" — son précédent administrateur est parti. Envoyez /help pour voir les commandes que vous pouvez maintenant utiliser.`,
  "leave.closedAbandoned": (p) =>
    `Vous avez quitté "${p.name}". Personne d'éligible ne restait pour reprendre le rôle d'administrateur, donc il a été clôturé comme inachevé.`,
  "leave.anotherParticipant": () => "Un autre participant",

  "myevent.notInEvent": () => "Vous n'êtes actuellement dans aucun événement. Utilisez /join <code> ou /newevent pour en créer un.",
  "myevent.info": (p) => `Vous êtes dans "${p.name}" (code ${p.code}, modèle ${p.pattern}).`,

  "status.header": (p) => `${p.name} — ${p.known}/${p.total} connues`,
  "status.supportCount": (p) => `Confirmé par ${p.count}`,
  "status.supportedBy": (p) => `Confirmé par ${p.count} — ${p.names}`,
  "status.tooManyVariants": (p) =>
    `Il y a trop de possibilités ouvertes en ce moment (${p.count}). Demandez à la personne qui administre l'événement de faire /resolve sur certaines positions.`,
  "status.moreVariants": (p) =>
    `+${p.count} possibilités supplémentaires — demandez à la personne qui administre l'événement de faire /resolve sur certaines positions.`,

  "slotType.letter": () => "une lettre",
  "slotType.digit": () => "un chiffre",
  "slotType.word": () => "un mot",

  "common.notInEvent": () => "Vous n'êtes dans aucun événement. Utilisez d'abord /join <code>.",
  "common.notAdmin": () => "Seule la personne qui administre l'événement peut faire cela.",
  "common.userNotFound": () =>
    "Ce participant est introuvable. Utilisez son @utilisateur ou le nom affiché dans /status.",
  "common.invalidPosition": (p) => `La position doit être un nombre entre 1 et ${p.max}.`,

  "submit.usage": () =>
    'Envoyez-la sous la forme "<position> <valeur>" (ou /submit <position> <valeur>) pour signaler une valeur, ' +
    'ou juste "<position>" sans valeur pour supprimer votre signalement à cette position.',
  "submit.recorded": (p) => `Enregistré : position ${p.position} = "${p.value}".`,
  "submit.selfCorrected": (p) =>
    `Mis à jour : la position ${p.position} est maintenant "${p.value}" (c'était "${p.previous}").`,
  "submit.selfRemoved": (p) => `Supprimé : votre valeur "${p.value}" pour la position ${p.position} n'est plus signalée.`,
  "submit.nothingToRemove": (p) => `Vous n'aviez rien signalé à la position ${p.position}.`,
  "submit.alreadyRecorded": (p) => `Déjà enregistré : position ${p.position} = "${p.value}".`,
  "submit.positionResolvedNotice": (p) =>
    `La position ${p.position} est déjà confirmée comme "${p.value}" par la personne qui administre l'événement. C'est noté quand même.`,
  "submit.confirmOtherConflict": (p) =>
    `La position ${p.position} a déjà "${p.existing}" signalé par quelqu'un d'autre. Enregistrer aussi "${p.value}" ?`,
  "submit.confirmTypeMismatch": (p) =>
    `La position ${p.position} attend ${p.expected}, mais "${p.value}" n'y ressemble pas. L'enregistrer quand même ?`,
  "submit.confirmYesButton": () => "Oui, enregistrer",
  "submit.confirmNoButton": () => "Ignorer",
  "submit.cancelled": () => "Ignoré — rien n'a été enregistré.",

  "resolve.usage": () =>
    "Utilisation : /resolve <position> <valeur>, /resolve <position> @utilisateur, /resolve <position> pour lister les valeurs signalées, ou /resolve seul pour parcourir toutes les positions en désaccord.",
  "resolve.userNoReport": (p) => `Cet utilisateur n'a rien signalé à la position ${p.position}.`,
  "resolve.done": (p) => `Position ${p.position} résolue à "${p.value}".`,
  "resolve.noCandidates": (p) => `Personne n'a encore rien signalé à la position ${p.position}.`,
  "resolve.candidatesHeader": (p) => `Position ${p.position} — valeurs signalées :`,
  "resolve.candidateLine": (p) => `« ${p.value} » — ${p.count}${p.trustedCount ? ` (${p.trustedCount})` : ""}`,
  "resolve.trustedLegend": () => "(Le nombre entre parenthèses indique combien de ces soutiens sont de confiance.)",
  "resolve.candidatesPrompt": () => "Touchez un bouton ci-dessous pour résoudre avec cette valeur.",
  "resolve.allHeader": (p) => `${p.count} positions encore en désaccord. Suivante : position ${p.position} — valeurs signalées :`,
  "resolve.allDone": () =>
    "Aucune position n'est actuellement en désaccord. Cela ne veut pas dire que c'est vérifié : une fois que vous avez testé un passcode sur l'écran d'échange du jeu, confirmez-le avec /verify <passcode> pour finaliser et clôturer l'événement.",

  "unresolve.usage": () => "Utilisation : /unresolve <position>.",
  "unresolve.notResolved": (p) => `La position ${p.position} n'est pas résolue.`,
  "unresolve.done": (p) => `Position ${p.position} rouverte.`,

  "trust.usage": () => "Utilisation : /trust <@utilisateur>.",
  "trust.done": (p) => `${p.name} est maintenant marqué comme fiable.`,
  "troll.usage": () => "Utilisation : /troll <@utilisateur>.",
  "troll.done": (p) => `Les signalements de ${p.name} sont désormais exclus de cet événement.`,
  "untrust.usage": () => "Utilisation : /untrust <@utilisateur>.",
  "untrust.done": (p) => `Le marquage de fiabilité de ${p.name} a été retiré.`,

  "kick.usage": () => "Utilisation : /kick <@utilisateur>.",
  "kick.done": (p) => `${p.name} a été exclu de l'événement.`,
  "kick.notInEvent": (p) => `${p.name} ne participe pas actuellement à cet événement.`,

  "promote.usage": () => "Utilisation : /promote <@utilisateur>.",
  "promote.cannotSelf": () => "Vous êtes déjà la personne qui administre cet événement.",
  "promote.notParticipant": (p) => `${p.name} ne participe pas actuellement à cet événement.`,
  "promote.done": (p) => `${p.name} est désormais la personne qui administre cet événement. Vous restez participant.`,
  "promote.youAreNow": (p) =>
    `Vous êtes désormais la personne qui administre "${p.name}". Envoyez /help pour voir les commandes que vous pouvez maintenant utiliser.`,

  "claim.cannotSelf": () => "Vous êtes déjà la personne qui administre cet événement.",
  "claim.notEligible": () => "Vous n'êtes pas éligible pour réclamer le rôle d'administrateur de cet événement.",
  "claim.joinedQueue": () => "Vous avez rejoint la file pour reprendre le rôle d'administrateur si la personne actuelle ne répond pas.",
  "claim.alreadyQueued": () => "Vous attendez déjà la réponse de l'administrateur.",
  "claim.adminRecentlyActive": (p) =>
    `L'administrateur a été actif au cours des ${p.minutes} dernières minutes, vous ne pouvez donc pas encore réclamer le rôle. Réessayez plus tard.`,
  "claim.notifyAdmin": (p) =>
    `${p.claimant} souhaite reprendre le rôle d'administrateur de "${p.name}", car vous n'avez pas été actif depuis un moment. Voulez-vous garder le rôle ou le céder ?`,
  "claim.keepButton": () => "Garder le rôle",
  "claim.acceptButton": () => "Céder le rôle",
  "claim.opened": (p) =>
    `L'administrateur a été prévenu et a ${p.minutes} minutes pour répondre. S'il ne le fait pas, relancez /claim après ce délai pour forcer la passation.`,
  "claim.kept": (p) => `Vous avez gardé le rôle d'administrateur de "${p.name}".`,
  "claim.handedOver": (p) => `Vous avez cédé le rôle d'administrateur de "${p.name}".`,
  "claim.handedOverTimeout": (p) =>
    `Comme vous n'avez pas répondu à temps, le rôle d'administrateur de "${p.name}" a été cédé automatiquement.`,
  "claim.becameAdmin": (p) =>
    `Vous êtes désormais l'administrateur de "${p.name}" après avoir réclamé le rôle pour inactivité. Envoyez /help pour voir les commandes que vous pouvez maintenant utiliser.`,
  "claim.alreadyResolved": () => "Cette demande a déjà été résolue.",

  "verify.usage": () => "Utilisation : /verify <passcode>. Collez le passcode exact confirmé comme correct par le jeu lors de l'échange.",
  "verify.matched": () => "Passcode confirmé — toutes les positions ont été résolues en conséquence. Clôture de l'événement…",
  "verify.stillUnresolved": (p) => `Résolvez d'abord ces positions : ${p.positions}.`,
  "verify.finalMessage": (p) => `Passcode final de "${p.name}" :`,
  "verify.closed": () => "Événement clôturé. Le passcode final a été envoyé à tous les participants.",
  "verify.noMatch": () =>
    "Ce passcode ne correspond à aucune combinaison des valeurs actuellement signalées. Vérifiez ce que vous avez collé — il se peut aussi qu'il manque un candidat signalé.",
  "verify.ambiguous": () =>
    "Ce passcode correspond à plusieurs combinaisons possibles des valeurs actuellement signalées, impossible de savoir automatiquement laquelle est la bonne. Résolvez d'abord certaines positions manuellement.",
  "verify.overwhelmed": () =>
    "Il y a trop de possibilités ouvertes pour vérifier cela maintenant. Résolvez d'abord certaines positions manuellement, puis réessayez /verify.",

  "events.none": () => "Vous n'administrez encore aucun événement.",
  "events.list": (p) => `Vos événements :\n${p.items}`,
  "events.itemLine": (p) => `• ${p.name} — ${p.code} (${p.status})`,
};

export const catalogs = { en, ca, es, fr } satisfies Record<string, Catalog>;
