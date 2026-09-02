type Params = Record<string, string | number | boolean | null>;
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
    "/language <code> - set your language (en, ca, es, fr, gl, eu)\n" +
    "/newevent <name> [| <pattern>] - create an event\n" +
    "/sharetext [code] [lang] - get an invite message to share (defaults to your current event)\n" +
    "/join <code> - join an event\n" +
    "/leave - leave your current event\n" +
    "/current - show your current event, its administrator and participant count\n" +
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
    "/events - list every event you've been part of, current or past",

  "language.usage": () => "Usage: /language <code>. Supported: en, ca, es, fr, gl, eu.",
  "language.invalid": (p) => `"${p.code}" isn't a supported language. Supported: en, ca, es, fr, gl, eu.`,
  "language.set": () => "Your language is now set to English.",

  "newevent.usage": (p) =>
    `Usage: /newevent <name> or /newevent <name> | <pattern>. Default pattern: ${p.defaultPattern}. ` +
    `The "|" separates the name from the pattern, e.g.: /newevent Barcelona 2026-08 | ${p.defaultPattern}`,
  "newevent.invalidPattern": () => "That pattern isn't valid: it can only contain X (letter), 9 (digit) and * (word).",
  "newevent.confirmLeaveUnresolved": (p) =>
    `You're currently in "${p.currentEventName}", which hasn't been verified yet. Creating a new event will leave it. Continue?`,
  "newevent.confirmYesButton": () => "Yes, create it",
  "newevent.confirmNoButton": () => "Cancel",
  "newevent.cancelled": () => "Cancelled — no event was created.",
  "newevent.expired": () => "That request is no longer available — send /newevent again if you still want to create it.",
  "newevent.confirmed": () => "Got it — creating your new event and leaving the previous one.",
  "newevent.created": (p) =>
    `Event "${p.name}" created. Join code: ${p.code}\nPattern: ${p.pattern}\n` +
    `You've been joined automatically and marked as trusted. Report what you find as "<position> <value>", e.g. "6 GLYPH".\n\n` +
    `Share (or forward) the message below with the event's group, or with anyone you want to help solve the passcode:`,

  "sharetext.text": (p) => `Join the passcode relay for "${p.name}": open the bot ${p.bot} and send:`,
  "sharetext.tapToCopy": () =>
    "Tap the command above to copy it, then tap the bot's name to open a conversation with it. If it's your first time there, tap Start first; then paste the command and send it.",
  "sharetext.otherLanguages": () => "Need this in another language?\nTap below.",
  "sharetext.noCurrentEvent": () => "You're not in an event. Specify a code: /sharetext <code> [lang].",

  "join.usage": () => "Usage: /join <code>.",
  "join.confirmSwitch": (p) => `You're already in "${p.currentEventName}". Switch to "${p.newEventName}"?`,
  "join.confirmSwitchRevive": (p) =>
    `You're already in "${p.currentEventName}". "${p.newEventName}" is closed with no administrator — switching will reopen it and make you its administrator. Continue?`,
  "join.confirmYesButton": () => "Yes, switch",
  "join.confirmNoButton": () => "Cancel",
  "join.switched": (p) => `Switched to "${p.name}".`,
  "join.joined": (p) => `Joined "${p.name}". Report what you find as "<position> <value>", e.g. "6 GLYPH".`,
  "join.revived": (p) =>
    `"${p.name}" was closed with no administrator — you've reopened it and are now its administrator. Report what you find as "<position> <value>", e.g. "6 GLYPH".`,
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

  "current.notInEvent": () => "You're not currently in any event. Use /join <code> or /newevent to start one.",
  "current.info": (p) =>
    `Current event:\n` +
    `• Name: ${p.name}\n` +
    `• Join code: ${p.code}\n` +
    `• Passcode pattern: ${p.pattern}\n` +
    `• Participants: ${p.participantCount}\n` +
    `• Current administrator: ${p.admin}`,
  "current.adminNoUsername": () => "(no public @username)",
  "current.you": () => " (you)",

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

  "events.none": () => "You haven't participated in any event yet.",
  "events.list": (p) => `Your events:\n${p.items}`,
  "events.itemLine": (p) => {
    let status =
      p.status === "active" ? "active" : p.reason === "completed" ? "closed, completed" : p.reason === "abandoned" ? "closed, abandoned" : "closed";
    if (p.isCurrent) status += ", current";
    const suffix = p.isAdmin ? " — you're the administrator" : "";
    return `• ${p.name} — ${p.code} (${status})${suffix}`;
  },
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
    "/language <codi> - estableix el teu idioma (en, ca, es, fr, gl, eu)\n" +
    "/newevent <nom> [| <patró>] - crea un esdeveniment\n" +
    "/sharetext [codi] [idioma] - obté un text d'invitació per compartir (per defecte, el teu esdeveniment actual)\n" +
    "/join <codi> - uneix-te a un esdeveniment\n" +
    "/leave - surt de l'esdeveniment actual\n" +
    "/current - mostra l'esdeveniment actual, qui l'administra i el nombre de participants\n" +
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
    "/events - llista tots els esdeveniments en què has participat, actuals o passats",

  "language.usage": () => "Ús: /language <codi>. Suportats: en, ca, es, fr, gl, eu.",
  "language.invalid": (p) => `"${p.code}" no és un idioma suportat. Suportats: en, ca, es, fr, gl, eu.`,
  "language.set": () => "El teu idioma ara és el català.",

  "newevent.usage": (p) =>
    `Ús: /newevent <nom> o /newevent <nom> | <patró>. Patró per defecte: ${p.defaultPattern}. ` +
    `El "|" separa el nom del patró, p. ex.: /newevent Barcelona 2026-08 | ${p.defaultPattern}`,
  "newevent.invalidPattern": () => "Aquest patró no és vàlid: només pot contenir X (lletra), 9 (número) i * (paraula).",
  "newevent.confirmLeaveUnresolved": (p) =>
    `Ara mateix ets a "${p.currentEventName}", que encara no s'ha verificat. Crear un esdeveniment nou el deixarà enrere. Vols continuar?`,
  "newevent.confirmYesButton": () => "Sí, crea'l",
  "newevent.confirmNoButton": () => "Cancel·la",
  "newevent.cancelled": () => "Cancel·lat — no s'ha creat cap esdeveniment.",
  "newevent.expired": () => "Aquesta sol·licitud ja no està disponible — torna a enviar /newevent si encara el vols crear.",
  "newevent.confirmed": () => "Entesos — creant el teu esdeveniment nou i deixant l'anterior.",
  "newevent.created": (p) =>
    `Esdeveniment "${p.name}" creat. Codi d'accés: ${p.code}\nPatró: ${p.pattern}\n` +
    `T'hi has unit automàticament i t'has marcat com a de confiança. Reporta el que trobis com a "<posició> <valor>", p.ex. "6 GLYPH".\n\n` +
    `Comparteix (o reenvia) el missatge següent al grup de l'esdeveniment o amb qui vulguis resoldre el passcode:`,

  "sharetext.text": (p) => `Uneix-te al relleu de passcode de "${p.name}": obre el bot ${p.bot} i envia:`,
  "sharetext.tapToCopy": () =>
    "Toca la comanda de sobre per copiar-la i després toca el nom del bot per obrir-hi una conversa. Si és la primera vegada que hi entres, toca primer Start; després enganxa-hi la comanda i envia-la.",
  "sharetext.otherLanguages": () => "Ho vols en un altre idioma?\nClica aquí sota.",
  "sharetext.noCurrentEvent": () => "No estàs en cap esdeveniment. Especifica un codi: /sharetext <codi> [idioma].",

  "join.usage": () => "Ús: /join <codi>.",
  "join.confirmSwitch": (p) => `Ja ets a "${p.currentEventName}". Vols canviar a "${p.newEventName}"?`,
  "join.confirmSwitchRevive": (p) =>
    `Ja ets a "${p.currentEventName}". "${p.newEventName}" està tancat sense administrador — si hi canvies, el reobriràs i en seràs l'administrador/a. Vols continuar?`,
  "join.confirmYesButton": () => "Sí, canvia",
  "join.confirmNoButton": () => "Cancel·la",
  "join.switched": (p) => `Has canviat a "${p.name}".`,
  "join.joined": (p) => `T'has unit a "${p.name}". Reporta el que trobis com a "<posició> <valor>", p.ex. "6 GLYPH".`,
  "join.revived": (p) =>
    `"${p.name}" estava tancat sense administrador — l'has reobert i ara n'ets l'administrador/a. Reporta el que trobis com a "<posició> <valor>", p.ex. "6 GLYPH".`,
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

  "current.notInEvent": () => "Ara mateix no ets a cap esdeveniment. Fes servir /join <codi> o /newevent per crear-ne un.",
  "current.info": (p) =>
    `Esdeveniment actual:\n` +
    `• Nom: ${p.name}\n` +
    `• Codi per unir-s'hi: ${p.code}\n` +
    `• Patró del passcode: ${p.pattern}\n` +
    `• Nombre de participants: ${p.participantCount}\n` +
    `• Administrador/a actual: ${p.admin}`,
  "current.adminNoUsername": () => "(sense @usuari públic)",
  "current.you": () => " (tu)",

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

  "events.none": () => "Encara no has participat en cap esdeveniment.",
  "events.list": (p) => `Els teus esdeveniments:\n${p.items}`,
  "events.itemLine": (p) => {
    let status =
      p.status === "active" ? "actiu" : p.reason === "completed" ? "tancat, completat" : p.reason === "abandoned" ? "tancat, abandonat" : "tancat";
    if (p.isCurrent) status += ", actual";
    const suffix = p.isAdmin ? " — n'ets l'administrador/a" : "";
    return `• ${p.name} — ${p.code} (${status})${suffix}`;
  },
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
    "/language <código> - establece tu idioma (en, ca, es, fr, gl, eu)\n" +
    "/newevent <nombre> [| <patrón>] - crea un evento\n" +
    "/sharetext [código] [idioma] - obtén un texto de invitación para compartir (por defecto, tu evento actual)\n" +
    "/join <código> - únete a un evento\n" +
    "/leave - sal del evento actual\n" +
    "/current - muestra el evento actual, quién lo administra y el número de participantes\n" +
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
    "/events - lista todos los eventos en los que has participado, actuales o pasados",

  "language.usage": () => "Uso: /language <código>. Soportados: en, ca, es, fr, gl, eu.",
  "language.invalid": (p) => `"${p.code}" no es un idioma soportado. Soportados: en, ca, es, fr, gl, eu.`,
  "language.set": () => "Tu idioma ahora es el español.",

  "newevent.usage": (p) =>
    `Uso: /newevent <nombre> o /newevent <nombre> | <patrón>. Patrón por defecto: ${p.defaultPattern}. ` +
    `El "|" separa el nombre del patrón, p. ej.: /newevent Barcelona 2026-08 | ${p.defaultPattern}`,
  "newevent.invalidPattern": () => "Ese patrón no es válido: solo puede contener X (letra), 9 (número) y * (palabra).",
  "newevent.confirmLeaveUnresolved": (p) =>
    `Ahora mismo estás en "${p.currentEventName}", que todavía no se ha verificado. Crear un evento nuevo lo dejará atrás. ¿Quieres continuar?`,
  "newevent.confirmYesButton": () => "Sí, créalo",
  "newevent.confirmNoButton": () => "Cancelar",
  "newevent.cancelled": () => "Cancelado — no se ha creado ningún evento.",
  "newevent.expired": () => "Esa solicitud ya no está disponible — vuelve a enviar /newevent si todavía quieres crearlo.",
  "newevent.confirmed": () => "Entendido — creando tu evento nuevo y dejando el anterior.",
  "newevent.created": (p) =>
    `Evento "${p.name}" creado. Código de acceso: ${p.code}\nPatrón: ${p.pattern}\n` +
    `Te has unido automáticamente y te has marcado como de confianza. Reporta lo que encuentres como "<posición> <valor>", p.ej. "6 GLYPH".\n\n` +
    `Comparte (o reenvía) el siguiente mensaje con el grupo del evento, o con quien quieras que ayude a resolver el passcode:`,

  "sharetext.text": (p) => `Únete al relevo de passcode de "${p.name}": abre el bot ${p.bot} y envía:`,
  "sharetext.tapToCopy": () =>
    "Toca el comando de arriba para copiarlo y luego toca el nombre del bot para abrir una conversación con él. Si es la primera vez que entras ahí, toca primero Start; después pega ahí el comando y envíalo.",
  "sharetext.otherLanguages": () => "¿Lo quieres en otro idioma?\nTócalo aquí abajo.",
  "sharetext.noCurrentEvent": () => "No estás en ningún evento. Especifica un código: /sharetext <código> [idioma].",

  "join.usage": () => "Uso: /join <código>.",
  "join.confirmSwitch": (p) => `Ya estás en "${p.currentEventName}". ¿Quieres cambiar a "${p.newEventName}"?`,
  "join.confirmSwitchRevive": (p) =>
    `Ya estás en "${p.currentEventName}". "${p.newEventName}" está cerrado sin administrador — si cambias, lo reabrirás y serás su administrador/a. ¿Quieres continuar?`,
  "join.confirmYesButton": () => "Sí, cambiar",
  "join.confirmNoButton": () => "Cancelar",
  "join.switched": (p) => `Has cambiado a "${p.name}".`,
  "join.joined": (p) => `Te has unido a "${p.name}". Reporta lo que encuentres como "<posición> <valor>", p.ej. "6 GLYPH".`,
  "join.revived": (p) =>
    `"${p.name}" estaba cerrado sin administrador — lo has reabierto y ahora eres su administrador/a. Reporta lo que encuentres como "<posición> <valor>", p.ej. "6 GLYPH".`,
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

  "current.notInEvent": () => "Ahora mismo no estás en ningún evento. Usa /join <código> o /newevent para crear uno.",
  "current.info": (p) =>
    `Evento actual:\n` +
    `• Nombre: ${p.name}\n` +
    `• Código para unirse: ${p.code}\n` +
    `• Patrón del passcode: ${p.pattern}\n` +
    `• Número de participantes: ${p.participantCount}\n` +
    `• Administrador/a actual: ${p.admin}`,
  "current.adminNoUsername": () => "(sin @usuario público)",
  "current.you": () => " (tú)",

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

  "events.none": () => "Todavía no has participado en ningún evento.",
  "events.list": (p) => `Tus eventos:\n${p.items}`,
  "events.itemLine": (p) => {
    let status =
      p.status === "active" ? "activo" : p.reason === "completed" ? "cerrado, completado" : p.reason === "abandoned" ? "cerrado, abandonado" : "cerrado";
    if (p.isCurrent) status += ", actual";
    const suffix = p.isAdmin ? " — eres el/la administrador/a" : "";
    return `• ${p.name} — ${p.code} (${status})${suffix}`;
  },
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
    "/language <code> - définit votre langue (en, ca, es, fr, gl, eu)\n" +
    "/newevent <nom> [| <modèle>] - crée un événement\n" +
    "/sharetext [code] [langue] - obtient un texte d'invitation à partager (par défaut, votre événement actuel)\n" +
    "/join <code> - rejoindre un événement\n" +
    "/leave - quitter l'événement actuel\n" +
    "/current - affiche l'événement actuel, son administrateur et le nombre de participants\n" +
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
    "/events - liste tous les événements auxquels vous avez participé, actuels ou passés",

  "language.usage": () => "Utilisation : /language <code>. Langues gérées : en, ca, es, fr, gl, eu.",
  "language.invalid": (p) => `"${p.code}" n'est pas une langue gérée. Langues gérées : en, ca, es, fr, gl, eu.`,
  "language.set": () => "Votre langue est maintenant le français.",

  "newevent.usage": (p) =>
    `Utilisation : /newevent <nom> ou /newevent <nom> | <modèle>. Modèle par défaut : ${p.defaultPattern}. ` +
    `Le « | » sépare le nom du modèle, ex. : /newevent Barcelona 2026-08 | ${p.defaultPattern}`,
  "newevent.invalidPattern": () => "Ce modèle n'est pas valide : il ne peut contenir que X (lettre), 9 (chiffre) et * (mot).",
  "newevent.confirmLeaveUnresolved": (p) =>
    `Vous êtes actuellement dans "${p.currentEventName}", qui n'a pas encore été vérifié. Créer un nouvel événement le quittera. Continuer ?`,
  "newevent.confirmYesButton": () => "Oui, le créer",
  "newevent.confirmNoButton": () => "Annuler",
  "newevent.cancelled": () => "Annulé — aucun événement n'a été créé.",
  "newevent.expired": () => "Cette demande n'est plus disponible — renvoyez /newevent si vous voulez toujours le créer.",
  "newevent.confirmed": () => "Compris — création de votre nouvel événement, en quittant le précédent.",
  "newevent.created": (p) =>
    `Événement "${p.name}" créé. Code d'accès : ${p.code}\nModèle : ${p.pattern}\n` +
    `Vous avez été inscrit automatiquement et marqué comme fiable. Signalez ce que vous trouvez sous la forme "<position> <valeur>", ex. "6 GLYPH".\n\n` +
    `Partagez (ou transférez) le message ci-dessous avec le groupe de l'événement, ou avec qui vous voulez pour aider à résoudre le passcode :`,

  "sharetext.text": (p) => `Rejoignez le relais de passcode de "${p.name}" : ouvrez le bot ${p.bot} et envoyez :`,
  "sharetext.tapToCopy": () =>
    "Touchez la commande ci-dessus pour la copier, puis touchez le nom du bot pour ouvrir une conversation avec lui. Si c'est la première fois que vous y entrez, touchez d'abord Start ; puis collez-y la commande et envoyez-la.",
  "sharetext.otherLanguages": () => "Vous le voulez dans une autre langue ?\nAppuyez ci-dessous.",
  "sharetext.noCurrentEvent": () =>
    "Vous n'êtes dans aucun événement. Indiquez un code : /sharetext <code> [langue].",

  "join.usage": () => "Utilisation : /join <code>.",
  "join.confirmSwitch": (p) => `Vous êtes déjà dans "${p.currentEventName}". Passer à "${p.newEventName}" ?`,
  "join.confirmSwitchRevive": (p) =>
    `Vous êtes déjà dans "${p.currentEventName}". "${p.newEventName}" est clôturé sans administrateur — si vous changez, vous le rouvrirez et en deviendrez l'administrateur. Continuer ?`,
  "join.confirmYesButton": () => "Oui, changer",
  "join.confirmNoButton": () => "Annuler",
  "join.switched": (p) => `Vous êtes passé à "${p.name}".`,
  "join.joined": (p) => `Vous avez rejoint "${p.name}". Signalez ce que vous trouvez sous la forme "<position> <valeur>", ex. "6 GLYPH".`,
  "join.revived": (p) =>
    `"${p.name}" était clôturé sans administrateur — vous l'avez rouvert et en êtes désormais l'administrateur. Signalez ce que vous trouvez sous la forme "<position> <valeur>", ex. "6 GLYPH".`,
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

  "current.notInEvent": () => "Vous n'êtes actuellement dans aucun événement. Utilisez /join <code> ou /newevent pour en créer un.",
  "current.info": (p) =>
    `Événement actuel :\n` +
    `• Nom : ${p.name}\n` +
    `• Code pour rejoindre : ${p.code}\n` +
    `• Modèle du passcode : ${p.pattern}\n` +
    `• Nombre de participants : ${p.participantCount}\n` +
    `• Administrateur/trice actuel(le) : ${p.admin}`,
  "current.adminNoUsername": () => "(pas de @nom d'utilisateur public)",
  "current.you": () => " (vous)",

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

  "events.none": () => "Vous n'avez encore participé à aucun événement.",
  "events.list": (p) => `Vos événements :\n${p.items}`,
  "events.itemLine": (p) => {
    let status =
      p.status === "active" ? "actif" : p.reason === "completed" ? "clos, terminé" : p.reason === "abandoned" ? "clos, abandonné" : "clos";
    if (p.isCurrent) status += ", actuel";
    const suffix = p.isAdmin ? " — vous en êtes l'administrateur/trice" : "";
    return `• ${p.name} — ${p.code} (${status})${suffix}`;
  },
};

const gl: Catalog = {
  "common.genericError": () => "Produciuse un erro. Téntao de novo.",
  "common.eventNotFound": () => "Non se atopou ningún evento activo con ese código.",
  "common.eventClosed": () => "Ese evento está pechado.",

  "start.welcome": () =>
    "Benvido! Este bot axuda a un grupo de asistentes a un Ingress First Saturday a construír o passcode do evento en tempo real.\n\n" +
    "Usa /join <código> para unirte a un evento que alguén xa creou, ou /newevent para crear un ti mesmo. Envía /help para ver todos os comandos.",
  "help.text": () =>
    "Comandos:\n" +
    "/language <código> - establece o teu idioma (en, ca, es, fr, gl, eu)\n" +
    "/newevent <nome> [| <patrón>] - crea un evento\n" +
    "/sharetext [código] [idioma] - obtén un texto de convite para compartir (por defecto, o teu evento actual)\n" +
    "/join <código> - únete a un evento\n" +
    "/leave - abandona o evento actual\n" +
    "/current - mostra o evento actual, quen o administra e o número de participantes\n" +
    '"<posición> <valor>" ou /submit - reporta un valor\n' +
    '"<posición>" soa (sen valor) - elimina o teu reporte nesa posición\n' +
    "/status - mostra o passcode actual\n" +
    "/resolve <posición> [<valor|@usuario>] - resolve unha discrepancia, ou lista os valores reportados como botóns (administrador)\n" +
    "/resolve - repasa todas as posicións aínda en discrepancia, unha por unha (administrador)\n" +
    "/unresolve <posición> - reabre unha posición resolta (administrador)\n" +
    "/trust, /troll, /untrust <@usuario> - modera un participante (administrador)\n" +
    "/kick <@usuario> - expulsa un participante (administrador)\n" +
    "/promote <@usuario> - cede o rol de administrador a outro participante (administrador)\n" +
    "/claim - asume o cargo de administrador se o actual leva tempo inactivo\n" +
    "/verify <passcode> - confirma un passcode validado na tenda, resolve todas as posicións a partir del e pecha o evento (administrador)\n" +
    "/events - lista todos os eventos nos que participaches, actuais ou pasados",

  "language.usage": () => "Uso: /language <código>. Soportados: en, ca, es, fr, gl, eu.",
  "language.invalid": (p) => `"${p.code}" non é un idioma soportado. Soportados: en, ca, es, fr, gl, eu.`,
  "language.set": () => "O teu idioma agora é o galego.",

  "newevent.usage": (p) =>
    `Uso: /newevent <nome> ou /newevent <nome> | <patrón>. Patrón por defecto: ${p.defaultPattern}. ` +
    `O "|" separa o nome do patrón, p. ex.: /newevent Barcelona 2026-08 | ${p.defaultPattern}`,
  "newevent.invalidPattern": () => "Ese patrón non é válido: só pode conter X (letra), 9 (díxito) e * (palabra).",
  "newevent.confirmLeaveUnresolved": (p) =>
    `Agora mesmo estás en "${p.currentEventName}", que aínda non se verificou. Crear un evento novo deixarao atrás. Queres continuar?`,
  "newevent.confirmYesButton": () => "Si, créao",
  "newevent.confirmNoButton": () => "Cancelar",
  "newevent.cancelled": () => "Cancelado — non se creou ningún evento.",
  "newevent.expired": () => "Esa solicitude xa non está dispoñible — envía /newevent de novo se aínda o queres crear.",
  "newevent.confirmed": () => "Entendido — creando o teu evento novo e deixando o anterior.",
  "newevent.created": (p) =>
    `Evento "${p.name}" creado. Código de acceso: ${p.code}\nPatrón: ${p.pattern}\n` +
    `Uníchete automaticamente e marcáronte como de confianza. Reporta o que atopes como "<posición> <valor>", p.ex. "6 GLYPH".\n\n` +
    `Comparte (ou reenvía) a seguinte mensaxe co grupo do evento, ou con quen queiras que axude a resolver o passcode:`,

  "sharetext.text": (p) => `Únete ao relevo de passcode de "${p.name}": abre o bot ${p.bot} e envía:`,
  "sharetext.tapToCopy": () =>
    "Toca o comando de arriba para copialo e despois toca o nome do bot para abrir unha conversa con el. Se é a primeira vez que entras aí, toca primeiro Start; despois pega o comando e envíao.",
  "sharetext.otherLanguages": () => "Quéreo noutro idioma?\nToca aquí abaixo.",
  "sharetext.noCurrentEvent": () => "Non estás en ningún evento. Especifica un código: /sharetext <código> [idioma].",

  "join.usage": () => "Uso: /join <código>.",
  "join.confirmSwitch": (p) => `Xa estás en "${p.currentEventName}". Queres cambiar a "${p.newEventName}"?`,
  "join.confirmSwitchRevive": (p) =>
    `Xa estás en "${p.currentEventName}". "${p.newEventName}" está pechado sen administrador — se cambias, reabriralo e serás o seu administrador/a. Queres continuar?`,
  "join.confirmYesButton": () => "Si, cambiar",
  "join.confirmNoButton": () => "Cancelar",
  "join.switched": (p) => `Cambiaches a "${p.name}".`,
  "join.joined": (p) => `Uníchete a "${p.name}". Reporta o que atopes como "<posición> <valor>", p.ex. "6 GLYPH".`,
  "join.revived": (p) =>
    `"${p.name}" estaba pechado sen administrador — reabríchelo e agora es o seu administrador/a. Reporta o que atopes como "<posición> <valor>", p.ex. "6 GLYPH".`,
  "join.shareHint": () => "Queres axudar a difundir o evento? Executa /sharetext para obter un texto de convite.",
  "join.alreadyInThisEvent": (p) => `Xa estás en "${p.name}".`,
  "join.cancelled": (p) => `Cancelado — segues en "${p.name}".`,

  "leave.notInEvent": () => "Agora mesmo non estás en ningún evento.",
  "leave.left": (p) => `Saíches de "${p.name}".`,
  "leave.leftPromoted": (p) => `Saíches de "${p.name}". ${p.successor} é agora a persoa administradora.`,
  "leave.autoPromoted": (p) =>
    `Agora es a persoa administradora de "${p.name}" — quen o era antes marchou. Envía /help para ver os comandos que xa podes usar.`,
  "leave.closedAbandoned": (p) =>
    `Saíches de "${p.name}". Non quedaba ninguén apto para asumir o rol de administrador, así que se pechou como inacabado.`,
  "leave.anotherParticipant": () => "Outro participante",

  "current.notInEvent": () => "Agora mesmo non estás en ningún evento. Usa /join <código> ou /newevent para crear un.",
  "current.info": (p) =>
    `Evento actual:\n` +
    `• Nome: ${p.name}\n` +
    `• Código para unirse: ${p.code}\n` +
    `• Patrón do passcode: ${p.pattern}\n` +
    `• Número de participantes: ${p.participantCount}\n` +
    `• Administrador/a actual: ${p.admin}`,
  "current.adminNoUsername": () => "(sen @usuario público)",
  "current.you": () => " (ti)",

  "status.header": (p) => `${p.name} — ${p.known}/${p.total} coñecidas`,
  "status.supportCount": (p) => `Respaldado por ${p.count}`,
  "status.supportedBy": (p) => `Respaldado por ${p.count} — ${p.names}`,
  "status.tooManyVariants": (p) =>
    `Hai demasiadas posibilidades abertas agora mesmo (${p.count}). Pídelle a quen administra o evento que faga /resolve dalgunhas posicións.`,
  "status.moreVariants": (p) =>
    `+${p.count} posibilidades máis — pídelle a quen administra o evento que faga /resolve dalgunhas posicións.`,

  "slotType.letter": () => "unha letra",
  "slotType.digit": () => "un díxito",
  "slotType.word": () => "unha palabra",

  "common.notInEvent": () => "Non estás en ningún evento. Usa /join <código> primeiro.",
  "common.notAdmin": () => "Só quen administra o evento pode facer iso.",
  "common.userNotFound": () => "Non se atopou ese participante. Usa o seu @usuario ou o nome que aparece en /status.",
  "common.invalidPosition": (p) => `A posición debe ser un número entre 1 e ${p.max}.`,

  "submit.usage": () =>
    'Envíao como "<posición> <valor>" (ou /submit <posición> <valor>) para reportar un valor, ' +
    'ou só "<posición>" sen valor para eliminar o teu reporte nesa posición.',
  "submit.recorded": (p) => `Rexistrado: posición ${p.position} = "${p.value}".`,
  "submit.selfCorrected": (p) =>
    `Actualizado: a posición ${p.position} agora é "${p.value}" (antes era "${p.previous}").`,
  "submit.selfRemoved": (p) => `Eliminado: o teu valor "${p.value}" para a posición ${p.position} xa non consta.`,
  "submit.nothingToRemove": (p) => `Non tiñas reportado nada na posición ${p.position}.`,
  "submit.alreadyRecorded": (p) => `Xa estaba rexistrado: posición ${p.position} = "${p.value}".`,
  "submit.positionResolvedNotice": (p) =>
    `A posición ${p.position} xa está confirmada como "${p.value}" por quen administra o evento. Igualmente queda anotado.`,
  "submit.confirmOtherConflict": (p) =>
    `A posición ${p.position} xa ten "${p.existing}" reportado por outra persoa. Tamén queres rexistrar "${p.value}"?`,
  "submit.confirmTypeMismatch": (p) =>
    `A posición ${p.position} espera ${p.expected}, pero "${p.value}" non o parece. Queres rexistralo igualmente?`,
  "submit.confirmYesButton": () => "Si, rexístrao",
  "submit.confirmNoButton": () => "Descartar",
  "submit.cancelled": () => "Descartado — non se rexistrou nada.",

  "resolve.usage": () =>
    "Uso: /resolve <posición> <valor>, /resolve <posición> @usuario, /resolve <posición> para listar os valores reportados, ou /resolve só para repasar todas as posicións en discrepancia.",
  "resolve.userNoReport": (p) => `Ese usuario non reportou nada na posición ${p.position}.`,
  "resolve.done": (p) => `Posición ${p.position} resolta como "${p.value}".`,
  "resolve.noCandidates": (p) => `Ninguén reportou nada na posición ${p.position} aínda.`,
  "resolve.candidatesHeader": (p) => `Posición ${p.position} — valores reportados:`,
  "resolve.candidateLine": (p) => `"${p.value}" — ${p.count}${p.trustedCount ? ` (${p.trustedCount})` : ""}`,
  "resolve.trustedLegend": () => "(O número entre parénteses é cantos deses apoios son de confianza.)",
  "resolve.candidatesPrompt": () => "Toca un botón debaixo para resolver con ese valor.",
  "resolve.allHeader": (p) => `${p.count} posicións aínda en discrepancia. Seguinte: posición ${p.position} — valores reportados:`,
  "resolve.allDone": () =>
    "Agora mesmo non hai ningunha posición en discrepancia. Iso non significa que estea verificado: cando teñas probado un passcode na pantalla de canxeo do xogo, confírmao con /verify <passcode> para finalizar e pechar o evento.",

  "unresolve.usage": () => "Uso: /unresolve <posición>.",
  "unresolve.notResolved": (p) => `A posición ${p.position} non está resolta.`,
  "unresolve.done": (p) => `Posición ${p.position} reaberta.`,

  "trust.usage": () => "Uso: /trust <@usuario>.",
  "trust.done": (p) => `${p.name} agora está marcado como de confianza.`,
  "troll.usage": () => "Uso: /troll <@usuario>.",
  "troll.done": (p) => `As achegas de ${p.name} agora quedan excluídas deste evento.`,
  "untrust.usage": () => "Uso: /untrust <@usuario>.",
  "untrust.done": (p) => `Retirouse a marca de confianza de ${p.name}.`,

  "kick.usage": () => "Uso: /kick <@usuario>.",
  "kick.done": (p) => `${p.name} foi expulsado do evento.`,
  "kick.notInEvent": (p) => `${p.name} non é participante deste evento agora mesmo.`,

  "promote.usage": () => "Uso: /promote <@usuario>.",
  "promote.cannotSelf": () => "Xa es quen administra este evento.",
  "promote.notParticipant": (p) => `${p.name} non é participante deste evento agora mesmo.`,
  "promote.done": (p) => `${p.name} agora é quen administra este evento. Ti segues sendo participante.`,
  "promote.youAreNow": (p) => `Agora es quen administra "${p.name}". Envía /help para ver os comandos que xa podes usar.`,

  "claim.cannotSelf": () => "Xa es quen administra este evento.",
  "claim.notEligible": () => "Non podes reclamar o rol de administrador deste evento.",
  "claim.joinedQueue": () => "Engadícheste á cola para asumir o cargo de administrador se quen o ocupa agora non responde.",
  "claim.alreadyQueued": () => "Xa estás esperando a resposta do administrador.",
  "claim.adminRecentlyActive": (p) =>
    `Quen administra o evento estivo activo nos últimos ${p.minutes} minutos, así que aínda non podes reclamar o cargo. Téntao de novo máis tarde.`,
  "claim.notifyAdmin": (p) =>
    `${p.claimant} quere ocupar o cargo de administrador de "${p.name}", xa que hai tempo que non estás activo. Queres manter o cargo ou cedelo?`,
  "claim.keepButton": () => "Manter o cargo",
  "claim.acceptButton": () => "Ceder o cargo",
  "claim.opened": (p) =>
    `Avisouse o administrador e ten ${p.minutes} minutos para responder. Se non o fai, volve executar /claim pasado ese tempo para forzar o relevo.`,
  "claim.kept": (p) => `Mantiveches o cargo de administrador de "${p.name}".`,
  "claim.handedOver": (p) => `Cedeches o cargo de administrador de "${p.name}".`,
  "claim.handedOverTimeout": (p) =>
    `Como non respondiches a tempo, o cargo de administrador de "${p.name}" cedeuse automaticamente.`,
  "claim.becameAdmin": (p) =>
    `Agora es a persoa administradora de "${p.name}" tras reclamar o cargo por inactividade. Envía /help para ver os comandos que xa podes usar.`,
  "claim.alreadyResolved": () => "Esta petición xa se resolveu.",

  "verify.usage": () => "Uso: /verify <passcode>. Pega o passcode exacto que o xogo confirmou como correcto ao canxealo.",
  "verify.matched": () => "Passcode confirmado — todas as posicións resolvéronse en consecuencia. Pechando o evento…",
  "verify.stillUnresolved": (p) => `Resolve antes estas posicións: ${p.positions}.`,
  "verify.finalMessage": (p) => `Passcode final de "${p.name}":`,
  "verify.closed": () => "Evento pechado. O passcode final enviouse a todos os participantes.",
  "verify.noMatch": () =>
    "Ese passcode non coincide con ningunha combinación dos valores reportados actualmente. Comproba o que pegaches — tamén pode ser que falte algún candidato por reportar.",
  "verify.ambiguous": () =>
    "Ese passcode coincide con máis dunha combinación posible dos valores reportados actualmente, así que non se pode saber cal é a correcta automaticamente. Resolve antes algunhas posicións manualmente.",
  "verify.overwhelmed": () =>
    "Hai demasiadas posibilidades abertas para comprobalo agora mesmo. Resolve antes algunhas posicións manualmente e volve tentar /verify.",

  "events.none": () => "Aínda non participaches en ningún evento.",
  "events.list": (p) => `Os teus eventos:\n${p.items}`,
  "events.itemLine": (p) => {
    let status =
      p.status === "active" ? "activo" : p.reason === "completed" ? "pechado, completado" : p.reason === "abandoned" ? "pechado, abandonado" : "pechado";
    if (p.isCurrent) status += ", actual";
    const suffix = p.isAdmin ? " — es o/a administrador/a" : "";
    return `• ${p.name} — ${p.code} (${status})${suffix}`;
  },
};

const eu: Catalog = {
  "common.genericError": () => "Zerbait gaizki joan da. Saiatu berriro.",
  "common.eventNotFound": () => "Ez da kode horrekin ekitaldi aktiborik aurkitu.",
  "common.eventClosed": () => "Ekitaldi hori itxita dago.",

  "start.welcome": () =>
    "Ongi etorri! Bot honek Ingress First Saturday bateko partaideei laguntzen die ekitaldiaren pasakodea denbora errealean elkarlanean osatzen.\n\n" +
    "Erabili /join <kodea> norbaitek sortutako ekitaldi batera batzeko, edo /newevent bat zeuk sortzeko. Bidali /help komando guztiak ikusteko.",
  "help.text": () =>
    "Komandoak:\n" +
    "/language <kodea> - zure hizkuntza ezartzen du (en, ca, es, fr, gl, eu)\n" +
    "/newevent <izena> [| <eredua>] - ekitaldi bat sortzen du\n" +
    "/sharetext [kodea] [hizkuntza] - partekatzeko gonbidapen-testu bat lortzen du (lehenetsita, zure uneko ekitaldia)\n" +
    "/join <kodea> - ekitaldi batera batzen zaitu\n" +
    "/leave - uneko ekitaldia uzten du\n" +
    "/current - uneko ekitaldia, nork administratzen duen eta partaide kopurua erakusten ditu\n" +
    '"<posizioa> <balioa>" edo /submit - balio bat jakinarazten du\n' +
    '"<posizioa>" bakarrik (balio gabe) - posizio horretan zure jakinarazpena kentzen du\n' +
    "/status - uneko pasakodea erakusten du\n" +
    "/resolve <posizioa> [<balioa|@erabiltzailea>] - desadostasun bat ebazten du, edo jakinarazitako balioak botoi gisa zerrendatzen ditu (administratzailea)\n" +
    "/resolve - desadostasunean dauden posizio guztiak banan-banan errepasatzen ditu (administratzailea)\n" +
    "/unresolve <posizioa> - ebatzitako posizio bat berrirekitzen du (administratzailea)\n" +
    "/trust, /troll, /untrust <@erabiltzailea> - partaide bat moderatzen du (administratzailea)\n" +
    "/kick <@erabiltzailea> - partaide bat kanporatzen du (administratzailea)\n" +
    "/promote <@erabiltzailea> - administratzaile rola beste partaide bati ematen dio (administratzailea)\n" +
    "/claim - administratzaile kargua hartzen du, unekoa denbora batez inaktibo egon bada\n" +
    "/verify <passcode> - dendan balioztatutako pasakode bat berresten du, hortik posizio guztiak ebatzi eta ekitaldia ixten du (administratzailea)\n" +
    "/events - parte hartu duzun ekitaldi guztiak zerrendatzen ditu, unekoak zein iraganekoak",

  "language.usage": () => "Erabilera: /language <kodea>. Onartuak: en, ca, es, fr, gl, eu.",
  "language.invalid": (p) => `"${p.code}" ez da onartutako hizkuntza bat. Onartuak: en, ca, es, fr, gl, eu.`,
  "language.set": () => "Zure hizkuntza orain euskara da.",

  "newevent.usage": (p) =>
    `Erabilera: /newevent <izena> edo /newevent <izena> | <eredua>. Eredu lehenetsia: ${p.defaultPattern}. ` +
    `"|" ikurrak izena eta eredua bereizten ditu, adib.: /newevent Barcelona 2026-08 | ${p.defaultPattern}`,
  "newevent.invalidPattern": () => "Eredu hori ez da baliozkoa: X (letra), 9 (zenbakia) eta * (hitza) baino ezin ditu izan.",
  "newevent.confirmLeaveUnresolved": (p) =>
    `Orain "${p.currentEventName}" ekitaldian zaude, eta oraindik ez da egiaztatu. Ekitaldi berri bat sortzeak hura atzean utziko du. Jarraitu nahi duzu?`,
  "newevent.confirmYesButton": () => "Bai, sortu",
  "newevent.confirmNoButton": () => "Utzi",
  "newevent.cancelled": () => "Utzita — ez da ekitaldirik sortu.",
  "newevent.expired": () => "Eskaera hori jada ez dago erabilgarri — bidali /newevent berriro oraindik sortu nahi baduzu.",
  "newevent.confirmed": () => "Ados — zure ekitaldi berria sortzen eta aurrekoa uzten.",
  "newevent.created": (p) =>
    `"${p.name}" ekitaldia sortu da. Batzeko kodea: ${p.code}\nEredua: ${p.pattern}\n` +
    `Automatikoki batu zara eta fidagarritzat markatu zaitu. Aurkitzen duzuna "<posizioa> <balioa>" gisa jakinarazi, adib. "6 GLYPH".\n\n` +
    `Partekatu (edo birbidali) beheko mezua ekitaldiaren taldearekin, edo pasakodea ebazten lagundu nahi duen edonorekin:`,

  "sharetext.text": (p) => `Batu "${p.name}" ekitaldiaren pasakode-errelebora: ireki ${p.bot} bota eta bidali:`,
  "sharetext.tapToCopy": () =>
    "Sakatu goiko komandoa kopiatzeko, eta gero sakatu botaren izena harekin elkarrizketa bat irekitzeko. Lehen aldia bada, sakatu lehenik Start; ondoren itsatsi komandoa eta bidali.",
  "sharetext.otherLanguages": () => "Beste hizkuntza batean nahi duzu?\nSakatu behean.",
  "sharetext.noCurrentEvent": () => "Ez zaude ekitaldi batean. Zehaztu kode bat: /sharetext <kodea> [hizkuntza].",

  "join.usage": () => "Erabilera: /join <kodea>.",
  "join.confirmSwitch": (p) => `Jada "${p.currentEventName}" ekitaldian zaude. "${p.newEventName}" ekitaldira aldatu nahi duzu?`,
  "join.confirmSwitchRevive": (p) =>
    `Jada "${p.currentEventName}" ekitaldian zaude. "${p.newEventName}" itxita dago administratzailerik gabe — aldatzen baduzu, berrirekiko duzu eta haren administratzaile bihurtuko zara. Jarraitu nahi duzu?`,
  "join.confirmYesButton": () => "Bai, aldatu",
  "join.confirmNoButton": () => "Utzi",
  "join.switched": (p) => `"${p.name}" ekitaldira aldatu zara.`,
  "join.joined": (p) => `"${p.name}" ekitaldira batu zara. Aurkitzen duzuna "<posizioa> <balioa>" gisa jakinarazi, adib. "6 GLYPH".`,
  "join.revived": (p) =>
    `"${p.name}" itxita zegoen administratzailerik gabe — berrireki duzu eta orain haren administratzaile zara. Aurkitzen duzuna "<posizioa> <balioa>" gisa jakinarazi, adib. "6 GLYPH".`,
  "join.shareHint": () => "Ekitaldia zabaltzen lagundu nahi duzu? Exekutatu /sharetext gonbidapen-testu bat lortzeko.",
  "join.alreadyInThisEvent": (p) => `Jada "${p.name}" ekitaldian zaude.`,
  "join.cancelled": (p) => `Utzita — "${p.name}" ekitaldian jarraitzen duzu.`,

  "leave.notInEvent": () => "Orain ez zaude inongo ekitaldian.",
  "leave.left": (p) => `"${p.name}" utzi duzu.`,
  "leave.leftPromoted": (p) => `"${p.name}" utzi duzu. ${p.successor} da orain haren administratzailea.`,
  "leave.autoPromoted": (p) =>
    `Orain "${p.name}" ekitaldiaren administratzailea zara — aurreko administratzailea joan egin da. Bidali /help orain erabil ditzakezun komandoak ikusteko.`,
  "leave.closedAbandoned": (p) =>
    `"${p.name}" utzi duzu. Ekitaldian ez zen inor geratzen administratzaile kargua hartzeko gai zenik, beraz amaitu gabe itxi da.`,
  "leave.anotherParticipant": () => "Beste partaide bat",

  "current.notInEvent": () => "Orain ez zaude inongo ekitaldian. Erabili /join <kodea> edo /newevent bat sortzeko.",
  "current.info": (p) =>
    `Uneko ekitaldia:\n` +
    `• Izena: ${p.name}\n` +
    `• Batzeko kodea: ${p.code}\n` +
    `• Pasakodearen eredua: ${p.pattern}\n` +
    `• Partaide kopurua: ${p.participantCount}\n` +
    `• Uneko administratzailea: ${p.admin}`,
  "current.adminNoUsername": () => "(@erabiltzaile publikorik ez)",
  "current.you": () => " (zu)",

  "status.header": (p) => `${p.name} — ${p.known}/${p.total} ezagunak`,
  "status.supportCount": (p) => `${p.count} lagunek babestua`,
  "status.supportedBy": (p) => `${p.count} lagunek babestua — ${p.names}`,
  "status.tooManyVariants": (p) =>
    `Orain gehiegi dira aukera irekiak (${p.count}). Eskatu ekitaldiaren administratzaileari posizio batzuk /resolve egiteko.`,
  "status.moreVariants": (p) =>
    `+${p.count} aukera gehiago — eskatu ekitaldiaren administratzaileari posizio batzuk /resolve egiteko.`,

  "slotType.letter": () => "letra bat",
  "slotType.digit": () => "zenbaki bat",
  "slotType.word": () => "hitz bat",

  "common.notInEvent": () => "Ez zaude ekitaldi batean. Erabili lehenengo /join <kodea>.",
  "common.notAdmin": () => "Ekitaldiaren administratzaileak bakarrik egin dezake hori.",
  "common.userNotFound": () => "Ez da partaide hori aurkitu. Erabili haren @erabiltzailea edo /status-en agertzen den izena.",
  "common.invalidPosition": (p) => `Posizioak 1 eta ${p.max} arteko zenbaki bat izan behar du.`,

  "submit.usage": () =>
    'Bidali "<posizioa> <balioa>" gisa (edo /submit <posizioa> <balioa>) balio bat jakinarazteko, ' +
    'edo "<posizioa>" bakarrik, balio gabe, posizio horretan zure jakinarazpena kentzeko.',
  "submit.recorded": (p) => `Erregistratuta: ${p.position} posizioa = "${p.value}".`,
  "submit.selfCorrected": (p) =>
    `Eguneratuta: ${p.position} posizioa orain "${p.value}" da (lehen "${p.previous}" zen).`,
  "submit.selfRemoved": (p) => `Kenduta: ${p.position} posizioan zenuen "${p.value}" balioa ez da jada jakinarazita.`,
  "submit.nothingToRemove": (p) => `Ez zenuen ezer jakinarazi ${p.position} posizioan.`,
  "submit.alreadyRecorded": (p) => `Jada erregistratuta zegoen: ${p.position} posizioa = "${p.value}".`,
  "submit.positionResolvedNotice": (p) =>
    `${p.position} posizioa jada "${p.value}" gisa berretsi du ekitaldiaren administratzaileak. Hala ere, oharra hartu da.`,
  "submit.confirmOtherConflict": (p) =>
    `${p.position} posizioan jada "${p.existing}" jakinarazi du beste norbaitek. "${p.value}" ere erregistratu nahi duzu?`,
  "submit.confirmTypeMismatch": (p) =>
    `${p.position} posizioak ${p.expected} espero du, baina "${p.value}" ez dirudi hori. Hala ere erregistratu nahi duzu?`,
  "submit.confirmYesButton": () => "Bai, erregistratu",
  "submit.confirmNoButton": () => "Baztertu",
  "submit.cancelled": () => "Baztertuta — ez da ezer erregistratu.",

  "resolve.usage": () =>
    "Erabilera: /resolve <posizioa> <balioa>, /resolve <posizioa> @erabiltzailea, /resolve <posizioa> jakinarazitako balioak zerrendatzeko, edo /resolve bakarrik desadostasunean dauden posizio guztiak errepasatzeko.",
  "resolve.userNoReport": (p) => `Erabiltzaile horrek ez du ezer jakinarazi ${p.position} posizioan.`,
  "resolve.done": (p) => `${p.position} posizioa "${p.value}" gisa ebatzi da.`,
  "resolve.noCandidates": (p) => `Inork ez du oraindik ezer jakinarazi ${p.position} posizioan.`,
  "resolve.candidatesHeader": (p) => `${p.position} posizioa — jakinarazitako balioak:`,
  "resolve.candidateLine": (p) => `"${p.value}" — ${p.count}${p.trustedCount ? ` (${p.trustedCount})` : ""}`,
  "resolve.trustedLegend": () => "(Parentesi arteko zenbakiak babes horietatik zenbat diren fidagarriak adierazten du.)",
  "resolve.candidatesPrompt": () => "Sakatu beheko botoi bat balio horrekin ebazteko.",
  "resolve.allHeader": (p) => `${p.count} posizio daude oraindik desadostasunean. Hurrengoa: ${p.position} posizioa — jakinarazitako balioak:`,
  "resolve.allDone": () =>
    "Orain ez dago desadostasunean dagoen posiziorik. Horrek ez du esan nahi egiaztatuta dagoenik: jokoaren trukatze-pantailan pasakode bat probatu ondoren, berretsi /verify <passcode> bidez ekitaldia amaitu eta ixteko.",

  "unresolve.usage": () => "Erabilera: /unresolve <posizioa>.",
  "unresolve.notResolved": (p) => `${p.position} posizioa ez dago ebatzita.`,
  "unresolve.done": (p) => `${p.position} posizioa berrireki da.`,

  "trust.usage": () => "Erabilera: /trust <@erabiltzailea>.",
  "trust.done": (p) => `${p.name} orain fidagarritzat markatuta dago.`,
  "troll.usage": () => "Erabilera: /troll <@erabiltzailea>.",
  "troll.done": (p) => `${p.name}-ren ekarpenak orain ekitaldi honetatik kanpo geratzen dira.`,
  "untrust.usage": () => "Erabilera: /untrust <@erabiltzailea>.",
  "untrust.done": (p) => `${p.name}-ren fidagarritasun-marka kendu da.`,

  "kick.usage": () => "Erabilera: /kick <@erabiltzailea>.",
  "kick.done": (p) => `${p.name} ekitaldi honetatik kanporatu da.`,
  "kick.notInEvent": (p) => `${p.name} ez da orain ekitaldi honetako partaide.`,

  "promote.usage": () => "Erabilera: /promote <@erabiltzailea>.",
  "promote.cannotSelf": () => "Jada zu zara ekitaldi honen administratzailea.",
  "promote.notParticipant": (p) => `${p.name} ez da orain ekitaldi honetako partaide.`,
  "promote.done": (p) => `${p.name} da orain ekitaldi honen administratzailea. Zu partaide izaten jarraitzen duzu.`,
  "promote.youAreNow": (p) => `Orain zu zara "${p.name}" ekitaldiaren administratzailea. Bidali /help orain erabil ditzakezun komandoak ikusteko.`,

  "claim.cannotSelf": () => "Jada zu zara ekitaldi honen administratzailea.",
  "claim.notEligible": () => "Ez zara ekitaldi honen administratzaile rola eskatzeko gai.",
  "claim.joinedQueue": () => "Uneko administratzaileak erantzuten ez badu administratzaile kargua hartzeko ilarara batu zara.",
  "claim.alreadyQueued": () => "Jada administratzailearen erantzunaren zain zaude.",
  "claim.adminRecentlyActive": (p) =>
    `Administratzailea azken ${p.minutes} minutuetan aktibo egon da, beraz oraindik ezin duzu kargua eskatu. Saiatu berriro geroago.`,
  "claim.notifyAdmin": (p) =>
    `${p.claimant}-ek "${p.name}" ekitaldiaren administratzaile kargua hartu nahi du, aspaldi aktibo egon ez zarelako. Kargua mantendu nahi duzu, ala eman nahi duzu?`,
  "claim.keepButton": () => "Mantendu kargua",
  "claim.acceptButton": () => "Eman kargua",
  "claim.opened": (p) =>
    `Administratzaileari jakinarazi zaio eta ${p.minutes} minutu ditu erantzuteko. Erantzuten ez badu, exekutatu /claim berriro epe hori igarota, aldaketa behartzeko.`,
  "claim.kept": (p) => `"${p.name}" ekitaldiaren administratzaile kargua mantendu duzu.`,
  "claim.handedOver": (p) => `"${p.name}" ekitaldiaren administratzaile kargua eman duzu.`,
  "claim.handedOverTimeout": (p) =>
    `Garaiz erantzun ez duzunez, "${p.name}" ekitaldiaren administratzaile kargua automatikoki eman da.`,
  "claim.becameAdmin": (p) =>
    `Orain zu zara "${p.name}" ekitaldiaren administratzailea, inaktibitateagatik kargua eskatu ondoren. Bidali /help orain erabil ditzakezun komandoak ikusteko.`,
  "claim.alreadyResolved": () => "Eskaera hau jada ebatzi da.",

  "verify.usage": () => "Erabilera: /verify <passcode>. Itsatsi jokoak trukatzean zuzentzat berretsi duen pasakode zehatza.",
  "verify.matched": () => "Pasakodea berretsi da — posizio guztiak horren arabera ebatzi dira. Ekitaldia ixten…",
  "verify.stillUnresolved": (p) => `Ebatzi lehenengo posizio hauek: ${p.positions}.`,
  "verify.finalMessage": (p) => `"${p.name}" ekitaldiaren azken pasakodea:`,
  "verify.closed": () => "Ekitaldia itxi da. Azken pasakodea partaide guztiei bidali zaie.",
  "verify.noMatch": () =>
    "Pasakode hori ez dator bat orain jakinarazitako balioen inolako konbinaziorekin. Egiaztatu itsatsi duzuna — baliteke jakinarazi gabeko hautagairen bat falta izatea ere.",
  "verify.ambiguous": () =>
    "Pasakode hori orain jakinarazitako balioen konbinazio bat baino gehiagorekin dator bat, beraz ezin da automatikoki jakin zein den zuzena. Ebatzi lehenengo posizio batzuk eskuz.",
  "verify.overwhelmed": () =>
    "Orain gehiegi dira aukera irekiak hori egiaztatzeko. Ebatzi lehenengo posizio batzuk eskuz, eta saiatu berriro /verify-rekin.",

  "events.none": () => "Oraindik ez duzu ekitaldi batean ere parte hartu.",
  "events.list": (p) => `Zure ekitaldiak:\n${p.items}`,
  "events.itemLine": (p) => {
    let status =
      p.status === "active" ? "aktibo" : p.reason === "completed" ? "itxita, amaituta" : p.reason === "abandoned" ? "itxita, abandonatuta" : "itxita";
    if (p.isCurrent) status += ", unekoa";
    const suffix = p.isAdmin ? " — zu zara administratzailea" : "";
    return `• ${p.name} — ${p.code} (${status})${suffix}`;
  },
};

export const catalogs = { en, ca, es, fr, gl, eu } satisfies Record<string, Catalog>;
