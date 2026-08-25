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
    "/status - show the current code\n" +
    "/resolve <position> <value|@user> - settle a disagreement (creator)\n" +
    "/unresolve <position> - reopen a resolved position (creator)\n" +
    "/trust, /troll, /untrust <@user> - moderate a participant (creator)\n" +
    "/kick <@user> - remove a participant (creator)\n" +
    "/closeevent - freeze the event and announce the result (creator)\n" +
    "/events - list the events you've created",

  "language.usage": () => "Usage: /language <code>. Supported: en, ca, es, fr.",
  "language.invalid": (p) => `"${p.code}" isn't a supported language. Supported: en, ca, es, fr.`,
  "language.set": () => "Your language is now set to English.",

  "newevent.usage": (p) => `Usage: /newevent <name> or /newevent <name> | <pattern>. Default pattern: ${p.defaultPattern}.`,
  "newevent.invalidPattern": () => "That pattern isn't valid: it can only contain X (letter), 9 (digit) and * (word).",
  "newevent.created": (p) =>
    `Event "${p.name}" created. Join code: ${p.code}\nPattern: ${p.pattern}\n` +
    `You've been joined automatically.`,

  "sharetext.text": (p) => `Join the passcode relay for "${p.name}": open the bot ${p.bot} and send:`,
  "sharetext.otherLanguages": () => "Need this in another language? Run /sharetext <lang> (en, ca, es, fr).",
  "sharetext.noCurrentEvent": () => "You're not in an event. Specify a code: /sharetext <code> [lang].",

  "join.usage": () => "Usage: /join <code>.",
  "join.confirmSwitch": (p) => `You're already in "${p.currentEventName}". Switch to "${p.newEventName}"?`,
  "join.confirmYesButton": () => "Yes, switch",
  "join.confirmNoButton": () => "Cancel",
  "join.switched": (p) => `Switched to "${p.name}".`,
  "join.joined": (p) => `Joined "${p.name}". Report what you find as "<position> <value>", e.g. "6 CIPHER".`,
  "join.shareHint": () => "Want to help others find this event? Run /sharetext to get an invite message to share.",
  "join.alreadyInThisEvent": (p) => `You're already in "${p.name}".`,
  "join.cancelled": (p) => `Cancelled — you're still in "${p.name}".`,

  "leave.notInEvent": () => "You're not currently in any event.",
  "leave.left": (p) => `Left "${p.name}".`,

  "myevent.notInEvent": () => "You're not currently in any event. Use /join <code> or /newevent to start one.",
  "myevent.info": (p) => `You're in "${p.name}" (code ${p.code}, pattern ${p.pattern}).`,

  "status.header": (p) => `${p.name} — ${p.known}/${p.total} known`,
  "status.supportCount": (p) => `Supported by ${p.count}`,
  "status.supportedBy": (p) => `Supported by ${p.count} — ${p.names}`,
  "status.tooManyVariants": (p) =>
    `Too many open possibilities right now (${p.count}). Ask the event's creator to /resolve some positions.`,
  "status.moreVariants": (p) => `+${p.count} more possibilities — ask the event's creator to /resolve some positions.`,

  "slotType.letter": () => "a letter",
  "slotType.digit": () => "a digit",
  "slotType.word": () => "a word",

  "common.notInEvent": () => "You're not in an event. Use /join <code> first.",
  "common.notCreator": () => "Only the event's creator can do that.",
  "common.userNotFound": () => "Couldn't find that participant. Use their @username or the name shown in /status.",
  "common.invalidPosition": (p) => `Position must be a number between 1 and ${p.max}.`,

  "submit.usage": () => 'Send it as "<position> <value>", or /submit <position> <value>.',
  "submit.recorded": (p) => `Recorded: position ${p.position} = "${p.value}".`,
  "submit.selfCorrected": (p) => `Updated: position ${p.position} is now "${p.value}" (replaced your previous report).`,
  "submit.alreadyRecorded": (p) => `Already recorded: position ${p.position} = "${p.value}".`,
  "submit.positionResolvedNotice": (p) =>
    `Position ${p.position} is already confirmed as "${p.value}" by the event's creator. Noted anyway.`,
  "submit.confirmOtherConflict": (p) =>
    `Position ${p.position} already has "${p.existing}" reported by someone else. Also record "${p.value}"?`,
  "submit.confirmTypeMismatch": (p) =>
    `Position ${p.position} expects ${p.expected}, but "${p.value}" doesn't look like one. Record it anyway?`,
  "submit.confirmYesButton": () => "Yes, record it",
  "submit.confirmNoButton": () => "Discard",
  "submit.cancelled": () => "Discarded — nothing recorded.",

  "resolve.usage": () => "Usage: /resolve <position> <value> or /resolve <position> @user.",
  "resolve.userNoReport": (p) => `That user hasn't reported anything at position ${p.position}.`,
  "resolve.done": (p) => `Position ${p.position} resolved to "${p.value}".`,

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

  "closeevent.unresolved": (p) => `Resolve these positions first: ${p.positions}.`,
  "closeevent.finalMessage": (p) => `Final passcode for "${p.name}":`,
  "closeevent.done": () => "Event closed. Final passcode sent to every participant.",

  "events.none": () => "You haven't created any events yet.",
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
    "/status - mostra el codi actual\n" +
    "/resolve <posició> <valor|@usuari> - resol una discrepància (creador)\n" +
    "/unresolve <posició> - reobre una posició resolta (creador)\n" +
    "/trust, /troll, /untrust <@usuari> - modera un participant (creador)\n" +
    "/kick <@usuari> - expulsa un participant (creador)\n" +
    "/closeevent - congela l'esdeveniment i anuncia el resultat (creador)\n" +
    "/events - llista els esdeveniments que has creat",

  "language.usage": () => "Ús: /language <codi>. Suportats: en, ca, es, fr.",
  "language.invalid": (p) => `"${p.code}" no és un idioma suportat. Suportats: en, ca, es, fr.`,
  "language.set": () => "El teu idioma ara és el català.",

  "newevent.usage": (p) => `Ús: /newevent <nom> o /newevent <nom> | <patró>. Patró per defecte: ${p.defaultPattern}.`,
  "newevent.invalidPattern": () => "Aquest patró no és vàlid: només pot contenir X (lletra), 9 (número) i * (paraula).",
  "newevent.created": (p) =>
    `Esdeveniment "${p.name}" creat. Codi d'accés: ${p.code}\nPatró: ${p.pattern}\n` +
    `T'hi has unit automàticament.`,

  "sharetext.text": (p) => `Uneix-te al relleu de passcode de "${p.name}": obre el bot ${p.bot} i envia:`,
  "sharetext.otherLanguages": () => "Ho vols en un altre idioma? Executa /sharetext <idioma> (en, ca, es, fr).",
  "sharetext.noCurrentEvent": () => "No estàs en cap esdeveniment. Especifica un codi: /sharetext <codi> [idioma].",

  "join.usage": () => "Ús: /join <codi>.",
  "join.confirmSwitch": (p) => `Ja ets a "${p.currentEventName}". Vols canviar a "${p.newEventName}"?`,
  "join.confirmYesButton": () => "Sí, canvia",
  "join.confirmNoButton": () => "Cancel·la",
  "join.switched": (p) => `Has canviat a "${p.name}".`,
  "join.joined": (p) => `T'has unit a "${p.name}". Reporta el que trobis com a "<posició> <valor>", p.ex. "6 CIPHER".`,
  "join.shareHint": () => "Vols ajudar a difondre l'esdeveniment? Executa /sharetext per obtenir un text d'invitació.",
  "join.alreadyInThisEvent": (p) => `Ja ets a "${p.name}".`,
  "join.cancelled": (p) => `Cancel·lat — segueixes a "${p.name}".`,

  "leave.notInEvent": () => "Ara mateix no ets a cap esdeveniment.",
  "leave.left": (p) => `Has sortit de "${p.name}".`,

  "myevent.notInEvent": () => "Ara mateix no ets a cap esdeveniment. Fes servir /join <codi> o /newevent per crear-ne un.",
  "myevent.info": (p) => `Ets a "${p.name}" (codi ${p.code}, patró ${p.pattern}).`,

  "status.header": (p) => `${p.name} — ${p.known}/${p.total} conegudes`,
  "status.supportCount": (p) => `Donat per bo per ${p.count}`,
  "status.supportedBy": (p) => `Donat per bo per ${p.count} — ${p.names}`,
  "status.tooManyVariants": (p) =>
    `Hi ha massa possibilitats obertes ara mateix (${p.count}). Demana a qui ha creat l'esdeveniment que faci /resolve d'algunes posicions.`,
  "status.moreVariants": (p) =>
    `+${p.count} possibilitats més — demana a qui ha creat l'esdeveniment que faci /resolve d'algunes posicions.`,

  "slotType.letter": () => "una lletra",
  "slotType.digit": () => "un número",
  "slotType.word": () => "una paraula",

  "common.notInEvent": () => "No ets a cap esdeveniment. Fes servir /join <codi> primer.",
  "common.notCreator": () => "Només qui ha creat l'esdeveniment pot fer això.",
  "common.userNotFound": () => "No s'ha trobat aquest participant. Fes servir el seu @usuari o el nom que surt a /status.",
  "common.invalidPosition": (p) => `La posició ha de ser un número entre 1 i ${p.max}.`,

  "submit.usage": () => 'Envia-ho com a "<posició> <valor>", o /submit <posició> <valor>.',
  "submit.recorded": (p) => `Registrat: posició ${p.position} = "${p.value}".`,
  "submit.selfCorrected": (p) => `Actualitzat: la posició ${p.position} ara és "${p.value}" (s'ha substituït el teu report anterior).`,
  "submit.alreadyRecorded": (p) => `Ja estava registrat: posició ${p.position} = "${p.value}".`,
  "submit.positionResolvedNotice": (p) =>
    `La posició ${p.position} ja està confirmada com a "${p.value}" per qui ha creat l'esdeveniment. Igualment queda anotat.`,
  "submit.confirmOtherConflict": (p) =>
    `La posició ${p.position} ja té "${p.existing}" reportat per algú altre. També vols registrar "${p.value}"?`,
  "submit.confirmTypeMismatch": (p) =>
    `La posició ${p.position} espera ${p.expected}, però "${p.value}" no ho sembla. Ho vols registrar igualment?`,
  "submit.confirmYesButton": () => "Sí, registra-ho",
  "submit.confirmNoButton": () => "Descarta",
  "submit.cancelled": () => "Descartat — no s'ha registrat res.",

  "resolve.usage": () => "Ús: /resolve <posició> <valor> o /resolve <posició> @usuari.",
  "resolve.userNoReport": (p) => `Aquest usuari no ha reportat res a la posició ${p.position}.`,
  "resolve.done": (p) => `Posició ${p.position} resolta com a "${p.value}".`,

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

  "closeevent.unresolved": (p) => `Resol primer aquestes posicions: ${p.positions}.`,
  "closeevent.finalMessage": (p) => `Passcode final de "${p.name}":`,
  "closeevent.done": () => "Esdeveniment tancat. El passcode final s'ha enviat a tots els participants.",

  "events.none": () => "Encara no has creat cap esdeveniment.",
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
    "/status - muestra el código actual\n" +
    "/resolve <posición> <valor|@usuario> - resuelve una discrepancia (creador)\n" +
    "/unresolve <posición> - reabre una posición resuelta (creador)\n" +
    "/trust, /troll, /untrust <@usuario> - modera a un participante (creador)\n" +
    "/kick <@usuario> - expulsa a un participante (creador)\n" +
    "/closeevent - congela el evento y anuncia el resultado (creador)\n" +
    "/events - lista los eventos que has creado",

  "language.usage": () => "Uso: /language <código>. Soportados: en, ca, es, fr.",
  "language.invalid": (p) => `"${p.code}" no es un idioma soportado. Soportados: en, ca, es, fr.`,
  "language.set": () => "Tu idioma ahora es el español.",

  "newevent.usage": (p) => `Uso: /newevent <nombre> o /newevent <nombre> | <patrón>. Patrón por defecto: ${p.defaultPattern}.`,
  "newevent.invalidPattern": () => "Ese patrón no es válido: solo puede contener X (letra), 9 (número) y * (palabra).",
  "newevent.created": (p) =>
    `Evento "${p.name}" creado. Código de acceso: ${p.code}\nPatrón: ${p.pattern}\n` +
    `Te has unido automáticamente.`,

  "sharetext.text": (p) => `Únete al relevo de passcode de "${p.name}": abre el bot ${p.bot} y envía:`,
  "sharetext.otherLanguages": () => "¿Lo quieres en otro idioma? Ejecuta /sharetext <idioma> (en, ca, es, fr).",
  "sharetext.noCurrentEvent": () => "No estás en ningún evento. Especifica un código: /sharetext <código> [idioma].",

  "join.usage": () => "Uso: /join <código>.",
  "join.confirmSwitch": (p) => `Ya estás en "${p.currentEventName}". ¿Quieres cambiar a "${p.newEventName}"?`,
  "join.confirmYesButton": () => "Sí, cambiar",
  "join.confirmNoButton": () => "Cancelar",
  "join.switched": (p) => `Has cambiado a "${p.name}".`,
  "join.joined": (p) => `Te has unido a "${p.name}". Reporta lo que encuentres como "<posición> <valor>", p.ej. "6 CIPHER".`,
  "join.shareHint": () => "¿Quieres ayudar a difundir el evento? Ejecuta /sharetext para obtener un texto de invitación.",
  "join.alreadyInThisEvent": (p) => `Ya estás en "${p.name}".`,
  "join.cancelled": (p) => `Cancelado — sigues en "${p.name}".`,

  "leave.notInEvent": () => "Ahora mismo no estás en ningún evento.",
  "leave.left": (p) => `Has salido de "${p.name}".`,

  "myevent.notInEvent": () => "Ahora mismo no estás en ningún evento. Usa /join <código> o /newevent para crear uno.",
  "myevent.info": (p) => `Estás en "${p.name}" (código ${p.code}, patrón ${p.pattern}).`,

  "status.header": (p) => `${p.name} — ${p.known}/${p.total} conocidas`,
  "status.supportCount": (p) => `Respaldado por ${p.count}`,
  "status.supportedBy": (p) => `Respaldado por ${p.count} — ${p.names}`,
  "status.tooManyVariants": (p) =>
    `Hay demasiadas posibilidades abiertas ahora mismo (${p.count}). Pide a quien ha creado el evento que haga /resolve de algunas posiciones.`,
  "status.moreVariants": (p) =>
    `+${p.count} posibilidades más — pide a quien ha creado el evento que haga /resolve de algunas posiciones.`,

  "slotType.letter": () => "una letra",
  "slotType.digit": () => "un número",
  "slotType.word": () => "una palabra",

  "common.notInEvent": () => "No estás en ningún evento. Usa /join <código> primero.",
  "common.notCreator": () => "Solo quien ha creado el evento puede hacer esto.",
  "common.userNotFound": () => "No se ha encontrado a ese participante. Usa su @usuario o el nombre que aparece en /status.",
  "common.invalidPosition": (p) => `La posición debe ser un número entre 1 y ${p.max}.`,

  "submit.usage": () => 'Envíalo como "<posición> <valor>", o /submit <posición> <valor>.',
  "submit.recorded": (p) => `Registrado: posición ${p.position} = "${p.value}".`,
  "submit.selfCorrected": (p) => `Actualizado: la posición ${p.position} ahora es "${p.value}" (se ha sustituido tu reporte anterior).`,
  "submit.alreadyRecorded": (p) => `Ya estaba registrado: posición ${p.position} = "${p.value}".`,
  "submit.positionResolvedNotice": (p) =>
    `La posición ${p.position} ya está confirmada como "${p.value}" por quien ha creado el evento. Igualmente queda anotado.`,
  "submit.confirmOtherConflict": (p) =>
    `La posición ${p.position} ya tiene "${p.existing}" reportado por otra persona. ¿También quieres registrar "${p.value}"?`,
  "submit.confirmTypeMismatch": (p) =>
    `La posición ${p.position} espera ${p.expected}, pero "${p.value}" no lo parece. ¿Lo registras igualmente?`,
  "submit.confirmYesButton": () => "Sí, regístralo",
  "submit.confirmNoButton": () => "Descartar",
  "submit.cancelled": () => "Descartado — no se ha registrado nada.",

  "resolve.usage": () => "Uso: /resolve <posición> <valor> o /resolve <posición> @usuario.",
  "resolve.userNoReport": (p) => `Ese usuario no ha reportado nada en la posición ${p.position}.`,
  "resolve.done": (p) => `Posición ${p.position} resuelta como "${p.value}".`,

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

  "closeevent.unresolved": (p) => `Resuelve antes estas posiciones: ${p.positions}.`,
  "closeevent.finalMessage": (p) => `Passcode final de "${p.name}":`,
  "closeevent.done": () => "Evento cerrado. El passcode final se ha enviado a todos los participantes.",

  "events.none": () => "Todavía no has creado ningún evento.",
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
    "/status - affiche le code actuel\n" +
    "/resolve <position> <valeur|@utilisateur> - règle un désaccord (créateur)\n" +
    "/unresolve <position> - rouvre une position résolue (créateur)\n" +
    "/trust, /troll, /untrust <@utilisateur> - modère un participant (créateur)\n" +
    "/kick <@utilisateur> - exclut un participant (créateur)\n" +
    "/closeevent - fige l'événement et annonce le résultat (créateur)\n" +
    "/events - liste les événements que vous avez créés",

  "language.usage": () => "Utilisation : /language <code>. Langues gérées : en, ca, es, fr.",
  "language.invalid": (p) => `"${p.code}" n'est pas une langue gérée. Langues gérées : en, ca, es, fr.`,
  "language.set": () => "Votre langue est maintenant le français.",

  "newevent.usage": (p) => `Utilisation : /newevent <nom> ou /newevent <nom> | <modèle>. Modèle par défaut : ${p.defaultPattern}.`,
  "newevent.invalidPattern": () => "Ce modèle n'est pas valide : il ne peut contenir que X (lettre), 9 (chiffre) et * (mot).",
  "newevent.created": (p) =>
    `Événement "${p.name}" créé. Code d'accès : ${p.code}\nModèle : ${p.pattern}\n` +
    `Vous avez été inscrit automatiquement.`,

  "sharetext.text": (p) => `Rejoignez le relais de passcode de "${p.name}" : ouvrez le bot ${p.bot} et envoyez :`,
  "sharetext.otherLanguages": () =>
    "Vous le voulez dans une autre langue ? Lancez /sharetext <langue> (en, ca, es, fr).",
  "sharetext.noCurrentEvent": () =>
    "Vous n'êtes dans aucun événement. Indiquez un code : /sharetext <code> [langue].",

  "join.usage": () => "Utilisation : /join <code>.",
  "join.confirmSwitch": (p) => `Vous êtes déjà dans "${p.currentEventName}". Passer à "${p.newEventName}" ?`,
  "join.confirmYesButton": () => "Oui, changer",
  "join.confirmNoButton": () => "Annuler",
  "join.switched": (p) => `Vous êtes passé à "${p.name}".`,
  "join.joined": (p) => `Vous avez rejoint "${p.name}". Signalez ce que vous trouvez sous la forme "<position> <valeur>", ex. "6 CIPHER".`,
  "join.shareHint": () =>
    "Vous voulez aider à faire connaître l'événement ? Lancez /sharetext pour obtenir un texte d'invitation.",
  "join.alreadyInThisEvent": (p) => `Vous êtes déjà dans "${p.name}".`,
  "join.cancelled": (p) => `Annulé — vous êtes toujours dans "${p.name}".`,

  "leave.notInEvent": () => "Vous n'êtes actuellement dans aucun événement.",
  "leave.left": (p) => `Vous avez quitté "${p.name}".`,

  "myevent.notInEvent": () => "Vous n'êtes actuellement dans aucun événement. Utilisez /join <code> ou /newevent pour en créer un.",
  "myevent.info": (p) => `Vous êtes dans "${p.name}" (code ${p.code}, modèle ${p.pattern}).`,

  "status.header": (p) => `${p.name} — ${p.known}/${p.total} connues`,
  "status.supportCount": (p) => `Confirmé par ${p.count}`,
  "status.supportedBy": (p) => `Confirmé par ${p.count} — ${p.names}`,
  "status.tooManyVariants": (p) =>
    `Il y a trop de possibilités ouvertes en ce moment (${p.count}). Demandez à la personne qui a créé l'événement de faire /resolve sur certaines positions.`,
  "status.moreVariants": (p) =>
    `+${p.count} possibilités supplémentaires — demandez à la personne qui a créé l'événement de faire /resolve sur certaines positions.`,

  "slotType.letter": () => "une lettre",
  "slotType.digit": () => "un chiffre",
  "slotType.word": () => "un mot",

  "common.notInEvent": () => "Vous n'êtes dans aucun événement. Utilisez d'abord /join <code>.",
  "common.notCreator": () => "Seule la personne qui a créé l'événement peut faire cela.",
  "common.userNotFound": () =>
    "Ce participant est introuvable. Utilisez son @utilisateur ou le nom affiché dans /status.",
  "common.invalidPosition": (p) => `La position doit être un nombre entre 1 et ${p.max}.`,

  "submit.usage": () => 'Envoyez-la sous la forme "<position> <valeur>", ou /submit <position> <valeur>.',
  "submit.recorded": (p) => `Enregistré : position ${p.position} = "${p.value}".`,
  "submit.selfCorrected": (p) =>
    `Mis à jour : la position ${p.position} est maintenant "${p.value}" (votre précédent signalement a été remplacé).`,
  "submit.alreadyRecorded": (p) => `Déjà enregistré : position ${p.position} = "${p.value}".`,
  "submit.positionResolvedNotice": (p) =>
    `La position ${p.position} est déjà confirmée comme "${p.value}" par la personne qui a créé l'événement. C'est noté quand même.`,
  "submit.confirmOtherConflict": (p) =>
    `La position ${p.position} a déjà "${p.existing}" signalé par quelqu'un d'autre. Enregistrer aussi "${p.value}" ?`,
  "submit.confirmTypeMismatch": (p) =>
    `La position ${p.position} attend ${p.expected}, mais "${p.value}" n'y ressemble pas. L'enregistrer quand même ?`,
  "submit.confirmYesButton": () => "Oui, enregistrer",
  "submit.confirmNoButton": () => "Ignorer",
  "submit.cancelled": () => "Ignoré — rien n'a été enregistré.",

  "resolve.usage": () => "Utilisation : /resolve <position> <valeur> ou /resolve <position> @utilisateur.",
  "resolve.userNoReport": (p) => `Cet utilisateur n'a rien signalé à la position ${p.position}.`,
  "resolve.done": (p) => `Position ${p.position} résolue à "${p.value}".`,

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

  "closeevent.unresolved": (p) => `Résolvez d'abord ces positions : ${p.positions}.`,
  "closeevent.finalMessage": (p) => `Passcode final de "${p.name}" :`,
  "closeevent.done": () => "Événement clôturé. Le passcode final a été envoyé à tous les participants.",

  "events.none": () => "Vous n'avez encore créé aucun événement.",
  "events.list": (p) => `Vos événements :\n${p.items}`,
  "events.itemLine": (p) => `• ${p.name} — ${p.code} (${p.status})`,
};

export const catalogs = { en, ca, es, fr } satisfies Record<string, Catalog>;
