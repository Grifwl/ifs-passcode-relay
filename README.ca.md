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
vista compartida i en viu del codi a mesura que s'omple — sense haver de
recollir captures de pantalla manualment en un grup de xat.

## Com funciona, des del punt de vista d'un jugador

1. Qui organitza el relleu de passcode d'un IFS crea un esdeveniment amb
   `/newevent` i obté un codi curt per compartir amb els assistents (per
   exemple, en un grup de WhatsApp). Per defecte, es dona per fet que el
   passcode segueix el patró `XXX99*999XX` (tres lletres, dos números,
   una paraula sencera, tres números, dues lletres) — qui crea
   l'esdeveniment pot establir-ne un altre si aquell IFS fa servir un
   altre format.
2. Cada assistent envia `/join <codi>` al bot. Un agent només pot estar
   contribuint activament a un esdeveniment alhora.
3. Quan trobes un valor, simplement envies la seva posició i el valor:
   `6 CIPHER` reporta que la posició 6 (la paraula) és `CIPHER`; `7 3`
   reporta que la posició 7 és el número `3`. No cal recordar cap
   comanda. Les lletres es mostren en majúscules, però les pots escriure
   com vulguis.
4. El bot manté un únic missatge per participant actualitzat amb l'estat
   actual del codi, editant-lo cada cop que algú reporta alguna cosa
   nova — no inunda el xat amb un missatge nou per cada report.
5. Si dues persones reporten valors diferents per a la mateixa posició,
   totes dues es conserven: el bot mostra cada possible codi complet en
   un bloc fàcil de copiar, amb quantes persones el donen per bo — i, en
   els menys donats per bons, qui els ha reportat, perquè qui ha creat
   l'esdeveniment pugui detectar un error o un troll. Si el que envies
   no encaixa amb la posició esperada, o contradiu el que ja hi ha, el
   bot et demana confirmació abans de registrar-ho.
6. Qui ha creat l'esdeveniment resol una discrepància amb `/resolve`, i
   pot marcar un participant com a de confiança o com a troll si cal.
   Marcar algú com a troll, només per a aquell esdeveniment, descarta la
   resta de les seves aportacions i deixa d'enviar-li actualitzacions —
   tampoc rebrà el passcode final quan es tanqui l'esdeveniment.
7. Quan l'esdeveniment s'acaba, qui l'ha creat el tanca amb
   `/closeevent`, que envia el passcode final com a missatge **nou** a
   tots els participants — no només una edició — perquè a ningú se li
   escapi encara que no hagi estat seguint-ho activament.

### Referència de comandes

| Comanda | Qui la pot fer servir | Què fa |
|---|---|---|
| `/start`, `/help` | tothom | Introducció i llista de comandes. |
| `/language <codi>` | tothom | Estableix el teu idioma (`en`, `ca`, `es`, `fr`). |
| `/newevent <nom> [\| <patró>]` | tothom | Crea un nou esdeveniment IFS i n'obté el codi d'accés. |
| `/sharetext <codi> [idioma]` | tothom | Obté un text llest per compartir convidant a unir-s'hi, opcionalment en un idioma diferent del teu. |
| `/join <codi>` | tothom | Uneix-te a un esdeveniment. |
| `/leave` | participant | Surt de l'esdeveniment actual. |
| `/myevent` | tothom | Mostra a quin esdeveniment estàs, si n'hi ha. |
| `<posició> <valor>` (o `/submit <posició> <valor>`) | participant | Reporta el valor trobat en una posició. |
| `/status` (o `/code`) | participant | Mostra l'estat actual del codi quan ho vulguis. |
| `/resolve <posició> <valor \| @usuari>` | creador de l'esdeveniment | Tria el valor correcte quan hi ha discrepància. |
| `/unresolve <posició>` | creador de l'esdeveniment | Reobre una posició resolta. |
| `/trust <usuari>` | creador de l'esdeveniment | Marca un participant com a de confiança. |
| `/troll <usuari>` | creador de l'esdeveniment | Descarta les aportacions d'un participant i deixa d'actualitzar-lo (només aquest esdeveniment). |
| `/untrust <usuari>` | creador de l'esdeveniment | Treu la marca de confiança d'un participant. |
| `/kick <usuari>` | creador de l'esdeveniment | Expulsa un participant de l'esdeveniment. |
| `/closeevent` | creador de l'esdeveniment | Congela l'esdeveniment i anuncia el codi final a tothom. |
| `/events` | tothom | Llista els esdeveniments que has creat. |

Cada jugador veu els missatges del bot en el seu propi idioma, establert
un cop amb `/language` i recordat a partir de llavors.

## Estat del projecte

Aquest projecte és actualment en **fase de disseny**. El model
d'interacció descrit més amunt està tancat, però encara no s'ha escrit
codi de l'aplicació. Consulta [`CLAUDE.md`](CLAUDE.md) (en anglès) per al
disseny tècnic complet (model de dades, algorisme de resolució de
conflictes, arquitectura d'internacionalització) si vols contribuir-hi.

## Arquitectura (prevista)

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
| `en` | Collaboratively build your Ingress First Saturday event's redeemable passcode in real time. Report the character you found and its position — the bot keeps everyone's code in sync, flags disagreements, and announces the final result. Available in English, Català, Castellano and Français. Send /help to start, or /newevent to create one for your IFS. | Real-time collaborative passcode relay for Ingress First Saturday events. |
| `ca` | Construeix en temps real, de manera col·laborativa, el passcode bescanviable del teu esdeveniment Ingress First Saturday. Reporta el caràcter que has trobat i la seva posició — el bot manté el codi sincronitzat per a tothom, marca les discrepàncies i anuncia el resultat final. Disponible en català, anglès, castellà i francès. Envia /help per començar, o /newevent per crear-ne un pel teu IFS. | Relleu col·laboratiu en temps real del passcode d'un Ingress First Saturday. |
| `es` | Construye en tiempo real, de forma colaborativa, el passcode canjeable de tu evento Ingress First Saturday. Reporta el carácter que has encontrado y su posición — el bot mantiene el código sincronizado para todos, marca las discrepancias y anuncia el resultado final. Disponible en español, inglés, catalán y francés. Envía /help para empezar, o /newevent para crear uno para tu IFS. | Relevo colaborativo en tiempo real del passcode de un Ingress First Saturday. |
| `fr` | Construisez en temps réel, de façon collaborative, le passcode échangeable de votre événement Ingress First Saturday. Signalez le caractère trouvé et sa position — le bot garde le code synchronisé pour tout le monde, signale les désaccords et annonce le résultat final. Disponible en français, anglais, catalan et espagnol. Envoyez /help pour commencer, ou /newevent pour en créer un pour votre IFS. | Relais collaboratif en temps réel du passcode d'un Ingress First Saturday. |

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

## Llicència

MIT.
