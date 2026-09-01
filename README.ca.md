<!-- Languages: [English](README.md) | Català | [Castellano](README.es.md) | [Français](README.fr.md) -->

# IFS Passcode Relay

Un bot de Telegram que permet als assistents a un esdeveniment
**Ingress First Saturday (IFS)** construir col·laborativament, en temps
real, el passcode bescanviable de l'esdeveniment.

**Idiomes:** [English](README.md) · Català · [Castellano](README.es.md) · [Français](README.fr.md)

## Què és això?

Ingress First Saturday és un esdeveniment presencial recurrent del joc
mòbil [Ingress](https://ingress.com). Durant l'esdeveniment, es mostren
als jugadors les imatges d'una sèrie de portals; visitar-los sobre el
terreny i inspeccionar-ne el contingut multimèdia revela un caràcter.
Concatenant els caràcters en l'ordre correcte s'obté un passcode
bescanviable a la botiga del joc per un paquet d'objectes de l'IFS.

Poden haver-hi diversos IFS en marxa alhora, cadascun amb el seu propi
passcode. Aquest bot permet a tothom qui assisteix a un IFS concret
reportar quin caràcter ha trobat i a quina posició correspon, i manté una
vista compartida i en viu del passcode a mesura que s'omple — sense haver de
recollir captures de pantalla manualment en un grup de xat.

## Com funciona, des del punt de vista d'un jugador

1. Qui organitza el relleu de passcode d'un IFS crea un esdeveniment amb
   `/newevent` i obté un codi curt per compartir amb els assistents (per
   exemple, en un grup de WhatsApp) — el bot envia de seguida un text
   d'invitació llest per enganxar amb aquest codi, i qui crea
   l'esdeveniment s'hi uneix automàticament — com a administrador/a —,
   ja que ser l'organitzador no l'eximeix de caçar portals també. També
   comença marcat com a de confiança pel seu propi esdeveniment, igual
   com faria `/trust` amb qualsevol altra persona. Per defecte, es dona
   per fet que el passcode segueix
   el patró `XXX99*999XX` (tres lletres, dos números, una paraula
   sencera, tres números, dues lletres) — qui crea l'esdeveniment pot
   establir-ne un altre si aquell IFS fa servir un altre format. El nom
   de l'esdeveniment no cal que sigui únic: fer `/newevent` dues vegades
   amb exactament el mateix nom no és un error, simplement crea dos
   esdeveniments separats amb dos codis d'accés diferents. Com que els
   assistents només veuen el nom a l'hora de triar quin codi seguir,
   val la pena que sigui prou específic per distingir esdeveniments IFS
   amb el mateix nom — per exemple, `/newevent Barcelona 2026-08`,
   incloent-hi l'any i el mes, en lloc d'un simple `/newevent Barcelona`
   que col·lisiona amb qualsevol altre IFS de Barcelona. Si ets a un
   altre esdeveniment encara no resolt (no tancat), primer et demana
   confirmació — l'administris o no — ja que crear-ne un de nou el
   deixa enrere; si dius que no, no es crea res. Si aquell esdeveniment
   ja estava tancat, o no eres a cap, es crea de seguida sense
   preguntar. En qualsevol cas, si n'administraves el que deixes,
   es traspassa primer, igual com faria `/leave` (vegeu el punt 6 més
   avall).
2. La resta d'assistents envien `/join <codi>` al bot, que també els
   convida a executar `/sharetext` per si volen ajudar a difondre'l. Un
   agent només pot estar contribuint activament a un esdeveniment alhora,
   així que unir-se a un de diferent mentre l'actual encara no està
   resolt demana confirmar el canvi primer — i, si n'administraves
   l'anterior, el traspassa igualment. Si l'esdeveniment actual ja està
   tancat, o no en tens cap, `/join` et canvia de seguida sense
   preguntar. Si el codi al qual t'uneixes pertany a un
   esdeveniment que es va tancar perquè el seu administrador anterior el
   va deixar sense ningú elegible per prendre'n el relleu, `/join` el
   reobre i et fa administrador/a en comptes de rebutjar el codi.
3. Quan trobes un valor, simplement envies la seva posició i el valor:
   `6 GLYPH` reporta que la posició 6 (la paraula) és `GLYPH`; `7 3`
   reporta que la posició 7 és el número `3`. No cal recordar cap
   comanda. Les lletres es mostren en majúscules, però les pots escriure
   com vulguis.
4. El bot manté un únic missatge per participant actualitzat amb l'estat
   actual del passcode, editant-lo cada cop que algú reporta alguna cosa
   nova — no inunda el xat amb un missatge nou per cada report.
5. Si dues persones diferents reporten valors diferents per a la
   mateixa posició, totes dues es conserven: el bot mostra cada possible
   passcode complet en un bloc fàcil de copiar, amb quantes persones el
   donen per bo — i, en els menys donats per bons, qui els ha reportat,
   perquè qui administra l'esdeveniment pugui detectar un error o un
   troll. Si el que envies no encaixa amb la posició esperada, o
   contradiu el que **algú altre** ja ha reportat, el bot et demana
   confirmació abans de registrar-ho. Corregir el teu **propi** report
   anterior és diferent: no cal confirmació, el teu valor anterior en
   aquella posició se substitueix directament — i el bot et diu quin era
   aquest valor anterior, per si la correcció mateixa ha estat un error
   i el vols tornar a enviar. Si era l'única cosa que mantenia una
   discrepància, la discrepància desapareix a l'acte.
   Has enviat un valor a la posició equivocada, o encara no la coneixes
   de veritat? Envia només el número de posició, sense res després (o
   `/submit <posició>`), per eliminar el teu report en aquella posició —
   sense confirmació, i el bot et diu quin valor ha eliminat per si
   també ho vols desfer.
6. Qui administra l'esdeveniment resol una discrepància amb `/resolve
   <posició> <valor>` — o, escrit només com `/resolve <posició>`, el bot
   llista els valors reportats per aquella posició amb quanta gent en
   dona cadascun per bo — i, si algun d'aquests suports és de confiança,
   quants ho són — i mostra un botó per valor (el més donat per bo
   primer) per resoldre-la amb un sol toc. Escriure `/resolve` tot
   sol, sense arguments, repassa en canvi totes les posicions encara en
   discrepància una per una: en resoldre la que es mostra amb els seus
   botons, el bot envia de seguida la següent, fins que avisa que ja no
   en queda cap. Aquest avís mai porta una drecera per tancar
   l'esdeveniment, encara que en aquell moment totes les posicions
   tinguin ja un valor establert — que qui reporta hi estigui d'acord no
   és el mateix que el passcode funcioni de veritat, així que el bot
   remet qui administra a `/verify` (vegeu més avall). Qui administra
   l'esdeveniment també pot marcar un participant com a de confiança o
   com a troll si cal. Marcar algú com a troll, només per a aquell
   esdeveniment, descarta la resta de les seves aportacions i deixa
   d'enviar-li actualitzacions — tampoc rebrà el passcode final quan es
   tanqui l'esdeveniment.

   Quan només queden poques posicions en discrepància, pot ser més ràpid
   provar directament uns quants dels blocs de passcode renderitzats a la
   pantalla de bescanvi del joc. Un cop un d'ells es confirma correcte
   allà, qui administra l'esdeveniment l'enganxa de tornada amb
   `/verify <passcode>` i el bot esbrina, per a totes les posicions alhora,
   quin valor reportat l'ha produït.
7. `/verify <passcode>` és l'**única** manera de completar i tancar un
   esdeveniment — no hi ha una comanda separada per "tancar". Encara que
   totes les posicions ja coincideixin, aquest acord no s'ha comprovat
   contra el joc en si, així que qui administra ha de copiar un passcode
   candidat, enganxar-lo a la botiga, confirmar que s'accepta, i
   enganxar aquest mateix passcode a `/verify`. Un cop coincideix, el bot
   resol totes les posicions a partir d'ell i envia el passcode final
   com a missatge **nou** a tots els participants — no només una edició
   — perquè a ningú se li escapi encara que no hagi estat seguint-ho
   activament.

### Referència de comandes

| Comanda | Qui la pot fer servir | Què fa |
|---|---|---|
| `/start`, `/help` | tothom | Introducció i llista de comandes. |
| `/language <codi>` | tothom | Estableix el teu idioma (`en`, `ca`, `es`, `fr`). |
| `/newevent <nom> [\| <patró>]` | tothom | Crea un nou esdeveniment IFS i n'obté el codi d'accés; t'hi uneix automàticament i et marca com a de confiança. Aquí la `\|` separa el nom del patró, no vol dir "tria l'un o l'altre" — p. ex. `/newevent Barcelona 2026-08 \| XXX99*999XX`. Demana confirmació primer si el teu esdeveniment actual encara no està resolt (dir que no no crea res); aquell es traspassa primer, igual com faria `/leave`. |
| `/sharetext [codi] [idioma]` | tothom | Obté un text llest per compartir convidant a unir-s'hi. `codi` per defecte és el teu esdeveniment actual, `idioma` el teu propi — ja s'envia automàticament un cop des de `/newevent`. |
| `/join <codi>` | tothom | Uneix-te a un esdeveniment — demana confirmació només si el teu esdeveniment actual encara no està resolt, traspassant-lo si l'administraves; s'omet si no en tens cap o ja està tancat. Un codi tancat sense administrador es reobre sota teu en comptes de rebutjar-se. |
| `/leave` | participant | Surt de l'esdeveniment actual. Si ets qui l'administra, un altre participant assumeix el rol automàticament (prioritzant els de confiança i, si no, qui hagi aportat més), o es tanca com a inacabat si no hi ha ningú apte — el mateix traspàs passa si en surts creant-ne o unint-te a un altre en comptes de fer `/leave`. |
| `/current` | tothom | Mostra l'esdeveniment actual: nom, codi, patró, nombre de participants i qui l'administra. |
| `<posició> <valor>` (o `/submit <posició> <valor>`) | participant | Reporta el valor trobat en una posició. |
| `<posició>` sola (o `/submit <posició>`) | participant | Elimina el teu propi report en aquella posició, si n'hi ha. |
| `/status` | participant | Mostra l'estat actual del passcode quan ho vulguis; també trasllada les properes actualitzacions en directe a aquest nou missatge, per si l'anterior ha quedat molt amunt a la conversa. |
| `/resolve <posició> [<valor \| @usuari>]` | administrador/a de l'esdeveniment | Tria el valor correcte quan hi ha discrepància; sense valor, llista els valors reportats (amb el desglossament de suports de confiança) com a botons per resoldre. |
| `/resolve` (sense arguments) | administrador/a de l'esdeveniment | Repassa totes les posicions encara en discrepància, una per una; quan ja no en queda cap, remet a `/verify` — el consens per si sol mai tanca l'esdeveniment. |
| `/unresolve <posició>` | administrador/a de l'esdeveniment | Reobre una posició resolta. |
| `/trust <usuari>` | administrador/a de l'esdeveniment | Marca un participant com a de confiança, perquè el seu suport es destaqui a la llista de candidats de `/resolve`. |
| `/troll <usuari>` | administrador/a de l'esdeveniment | Descarta les aportacions d'un participant i deixa d'actualitzar-lo (només aquest esdeveniment). |
| `/untrust <usuari>` | administrador/a de l'esdeveniment | Treu la marca de confiança d'un participant; si estava marcat troll, també li actualitza el missatge d'estat de cop. |
| `/kick <usuari>` | administrador/a de l'esdeveniment | Expulsa un participant de l'esdeveniment. |
| `/promote <usuari>` | administrador/a de l'esdeveniment | Cedeix el rol d'administrador/a a un altre participant ja unit a l'esdeveniment; també el marca de confiança, igual que `/newevent` fa amb qui crea l'esdeveniment. |
| `/claim` | participant | Intenta assumir el càrrec d'administrador si l'actual porta 30+ minuts inactiu; té 5 minuts per acceptar-ho, rebutjar-ho o no respondre abans que es faci efectiu. |
| `/verify <passcode>` | administrador/a de l'esdeveniment | L'única manera de tancar un esdeveniment: enganxa un passcode confirmat correcte a la pantalla de bescanvi del joc; resol totes les posicions a partir d'ell alhora, congela l'esdeveniment i anuncia el passcode final a tothom. |
| `/events` | tothom | Llista tots els esdeveniments en què has participat, actuals o passats. |

Cada jugador veu els missatges del bot en el seu propi idioma, establert
un cop amb `/language` i recordat a partir de llavors.

## Estat del projecte

**En marxa**, a [`@ifs_relay_bot`](https://t.me/ifs_relay_bot) a
Telegram. Totes les comandes descrites més amunt estan implementades i
desplegades. Consulta [`CLAUDE.md`](CLAUDE.md) (en anglès) per al
disseny tècnic complet (model de dades, algorisme de resolució de
conflictes, arquitectura d'internacionalització) si vols contribuir-hi.

## Arquitectura

- **Runtime:** Cloudflare Workers, rebent les actualitzacions de Telegram
  via webhook.
- **Framework del bot:** [grammY](https://grammy.dev).
- **Base de dades:** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Llenguatge:** TypeScript.
- **Domini:** `ifspasscoderelay.grifwl.blue`.

## Guia d'instal·lació

Aquests són passos que es fan un sol cop per aixecar la infraestructura
del bot — un cop per a tot el projecte, no un cop per IFS. Els passos 1,
3 i 4 no requereixen que existeixi encara el codi de l'aplicació; els
passos 2 i 5 necessiten un Worker desplegat, així que van al final, un
cop comenci la implementació.

### 1. Crear el bot de Telegram

1. Obre una conversa amb [@BotFather](https://t.me/BotFather) a Telegram.
2. Envia `/newbot`, tria un nom per mostrar i un nom d'usuari únic acabat
   en `bot` (p.ex. `IfsPasscodeRelayBot`).
3. BotFather respon amb un **token del bot** — tracta'l com una
   contrasenya (qui el tingui pot enviar missatges fent-se passar pel
   bot). Es guarda com a secret de Cloudflare al pas 4; mai es puja a
   aquest repositori.
4. Encara parlant amb BotFather, configura el perfil públic del bot:
   - `/setuserpic` — puja una imatge de perfil.
   - `/setdescription` — la descripció llarga que es mostra a la
     pantalla buida del xat, abans que ningú hi hagi parlat.
   - `/setabouttext` — la biografia curta de la pàgina de perfil.
   - `/setjoingroups` → *Disable*. El bot està pensat per a xats privats
     d'1 a 1 — el missatge d'estat en viu de cada participant s'edita in
     situ, cosa que només té sentit en un xat amb ell i el bot tots
     sols — així que l'ús en grups es queda desactivat.

   No cal `/setcommands`: el bot registra la seva pròpia llista de
   comandes directament des del codi, via el `setMyCommands` de la Bot
   API, així que Telegram mostra els suggeriments d'autocompletar
   automàticament i mai es poden desincronitzar d'una llista mantinguda
   a mà a BotFather.

#### Descripció i text "about" suggerits

Estableix primer la versió en anglès amb `/setdescription` i
`/setabouttext` — és la que fa servir BotFather com a alternativa per a
qualsevol idioma de client de Telegram sense traducció pròpia. Després,
des dels mateixos menús, afegeix les versions `ca`/`es`/`fr` de sota com
a descripcions per idioma.

| Idioma | `/setdescription` (llarga) | `/setabouttext` (curta) |
|---|---|---|
| `en` | Collaboratively build your Ingress First Saturday event's redeemable passcode in real time. Report the character you found and its position — the bot keeps everyone's passcode in sync, flags disagreements, and announces the final result. Available in English, Català, Castellano and Français. Send /help to start, or /newevent to create one for your IFS. | Real-time collaborative passcode relay for Ingress First Saturday events. |
| `ca` | Construeix en temps real, de manera col·laborativa, el passcode bescanviable del teu esdeveniment Ingress First Saturday. Reporta el caràcter que has trobat i la seva posició — el bot manté el passcode sincronitzat per a tothom, marca les discrepàncies i anuncia el resultat final. Disponible en català, anglès, castellà i francès. Envia /help per començar, o /newevent per crear-ne un pel teu IFS. | Relleu col·laboratiu en temps real del passcode d'un Ingress First Saturday. |
| `es` | Construye en tiempo real, de forma colaborativa, el passcode canjeable de tu evento Ingress First Saturday. Reporta el carácter que has encontrado y su posición — el bot mantiene el passcode sincronizado para todos, marca las discrepancias y anuncia el resultado final. Disponible en español, inglés, catalán y francés. Envía /help para empezar, o /newevent para crear uno para tu IFS. | Relevo colaborativo en tiempo real del passcode de un Ingress First Saturday. |
| `fr` | Construisez en temps réel, de façon collaborative, le passcode échangeable de votre événement Ingress First Saturday. Signalez le caractère trouvé et sa position — le bot garde le passcode synchronisé pour tout le monde, signale les désaccords et annonce le résultat final. Disponible en français, anglais, catalan et espagnol. Envoyez /help pour commencer, ou /newevent pour en créer un pour votre IFS. | Relais collaboratif en temps réel du passcode d'un Ingress First Saturday. |

### 2. Crear el Worker de Cloudflare i la base de dades D1

Cal un compte de Cloudflare amb la zona `grifwl.blue` ja afegida, i
[wrangler](https://developers.cloudflare.com/workers/wrangler/) instal·lat
(`npm install -g wrangler`, o fer servir `npx wrangler`).

1. `wrangler login` per autenticar la CLI.
2. `wrangler d1 create ifs-passcode-relay` crea la base de dades D1 i
   mostra un `database_id` — guarda'l, anirà al binding
   `[[d1_databases]]` (anomenat `DB`) de `wrangler.toml` un cop existeixi
   el codi.
3. Un cop existeixi l'esquelet de l'aplicació, `wrangler deploy` publica
   el Worker per primer cop.

### 3. Assignar el subdomini

El bot viu a **`ifspasscoderelay.grifwl.blue`**. Com que la zona
`grifwl.blue` ja és al mateix compte de Cloudflare que es fa servir per
desplegar, no cal cap pas manual al tauler — es declara com a [Custom
Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
directament a `wrangler.toml`:

```toml
routes = [
  { pattern = "ifspasscoderelay.grifwl.blue", custom_domain = true }
]
```

`wrangler deploy` provisiona llavors el registre DNS i el certificat TLS
automàticament. El tauler només fa falta com a alternativa si la zona
necessita mai una atenció manual (p.ex. si resulta que viu en un compte
de Cloudflare diferent d'aquell amb què `wrangler` ha iniciat sessió).

### 4. Publicar el token del bot com a secret

1. `wrangler secret put BOT_TOKEN` i enganxa el token del pas 1 quan es
   demani — això el guarda xifrat a Cloudflare, exposat al Worker com a
   `env.BOT_TOKEN`, i mai es puja al repositori.
2. Per al desenvolupament local, posa el mateix valor a `.dev.vars` (ja
   exclòs de git) com a `BOT_TOKEN=...`.
3. Genera també una cadena aleatòria per fer servir com a secret del
   webhook (p.ex. `openssl rand -hex 32`) i guarda-la de la mateixa
   manera, com a `TELEGRAM_WEBHOOK_SECRET` — el Worker la fa servir per
   rebutjar qualsevol petició que no vingui realment de Telegram (vegeu
   el pas 5).

### 5. Apuntar Telegram cap al Worker (webhook)

Un cop el Worker estigui desplegat i accessible a la seva URL pública:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ifspasscoderelay.grifwl.blue/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Telegram inclourà llavors aquest mateix secret a la capçalera
`X-Telegram-Bot-Api-Secret-Token` de cada actualització que enviï; el
Worker ha de comprovar que coincideix abans de processar res, i rebutjar
la petició si no és així — això és el que evita que ningú altre pugui
enviar actualitzacions falses a la URL pública del webhook. Comprova que
el webhook està registrat amb:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### 6. Configurar el tauler privat d'administració

Hi ha un tauler privat, de només lectura, a `/admin` (p.ex.
`https://ifspasscoderelay.grifwl.blue/admin`), per inspeccionar les
dades en viu de D1 sense obrir una sessió interactiva de `wrangler d1
execute`. Va protegit amb contrasenya, i les dades que pertanyen a un
esdeveniment concret (participants, reports, candidats, resolucions,
marques de confiança, negociacions de `/claim`) només es mostren un cop
n'esculls un al desplegable — les taules globals (esdeveniments,
usuaris, paraules conegudes, creacions d'esdeveniment pendents) sempre
es veuen. Res s'actualitza sol: cada vista és una instantània del moment
en què l'has carregat o actualitzat per última vegada, amb un botó
d'actualitzar manual per tornar a consultar quan vulguis.

1. Genera una contrasenya i una clau de signatura aleatòria separada per
   a les seves cookies de sessió (p.ex. `openssl rand -hex 24` per a la
   contrasenya, `openssl rand -hex 32` per a la clau), i publica totes
   dues igual que el token del bot: `wrangler secret put
   ADMIN_DASHBOARD_PASSWORD` i `wrangler secret put
   ADMIN_SESSION_SECRET`.
2. Per al desenvolupament local, afegeix els mateixos dos valors a
   `.dev.vars` com a `ADMIN_DASHBOARD_PASSWORD=...` i
   `ADMIN_SESSION_SECRET=...`.

## Llicència

MIT.
