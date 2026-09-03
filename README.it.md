<!-- Languages: [English](README.md) | [Català](README.ca.md) | [Castellano](README.es.md) | [Français](README.fr.md) | [Galego](README.gl.md) | [Euskara](README.eu.md) | [Português](README.pt.md) | Italiano | [Deutsch](README.de.md) -->

# IFS Passcode Relay

Un bot Telegram che permette ai partecipanti di un evento
**Ingress First Saturday (IFS)** di costruire insieme, in tempo reale,
il passcode riscattabile dell'evento.

**Lingue:** [English](README.md) · [Català](README.ca.md) · [Castellano](README.es.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Euskara](README.eu.md) · [Português](README.pt.md) · Italiano · [Deutsch](README.de.md)

## Cos'è questo?

Ingress First Saturday è un evento ricorrente in presenza del gioco
mobile [Ingress](https://ingress.com). Durante l'evento, ai giocatori
vengono mostrate le immagini di una serie di portali; visitarli sul
posto ed esaminarne i contenuti multimediali rivela un carattere.
Concatenando i caratteri nell'ordine giusto si ottiene un passcode
riscattabile nel negozio del gioco per un pacchetto di oggetti IFS.

Più eventi IFS possono svolgersi contemporaneamente, ognuno con il
proprio passcode. Questo bot permette a chiunque partecipi a un IFS
specifico di segnalare il carattere trovato e la posizione a cui
appartiene, mantenendo una vista condivisa e in tempo reale del
passcode man mano che si completa — niente più raccolta manuale di
screenshot in una chat di gruppo.

## Come funziona, dal punto di vista di un giocatore

1. Chi organizza la staffetta del passcode per un dato IFS crea un
   evento con `/newevent` e ottiene un codice breve da condividere con
   i partecipanti (ad es. in un gruppo WhatsApp) — il bot invia subito
   un messaggio di invito pronto da incollare con quel codice, e chi lo
   crea si unisce automaticamente all'evento — come suo amministratore —
   dato che essere l'organizzatore non lo esime dal cacciare portali
   anche lui. Inizia anche contrassegnato come affidabile per il proprio
   evento, allo stesso modo in cui `/trust` contrassegnerebbe chiunque
   altro. Per impostazione predefinita, il passcode dovrebbe seguire il
   pattern `XXX99*999XX` (tre lettere, due cifre, una parola intera, tre
   cifre, due lettere) — chi crea l'evento può impostare un pattern
   diverso se quell'IFS usa un'altra forma. Il nome dell'evento non deve
   essere unico: eseguire `/newevent` due volte con lo stesso nome
   esatto non è un errore, crea semplicemente due eventi separati con
   due codici di accesso diversi. Dato che i partecipanti vedono solo il
   nome quando scelgono quale codice seguire, rendilo abbastanza
   specifico da distinguere eventi IFS con lo stesso nome — es.
   `/newevent Barcelona 2026-08`, includendo anno e mese, invece di un
   semplice `/newevent Barcelona` che entra in collisione con ogni altro
   IFS di Barcellona. Se sei attualmente in un altro evento ancora non
   risolto (non ancora chiuso), ti viene chiesto prima di confermare —
   che tu lo amministri o no — dato che creare questo lascerà indietro
   quello; rifiutare non crea nulla. Se quell'evento era già chiuso, o
   non eri in nessuno, viene creato immediatamente senza chiedere. In
   ogni caso, se amministravi quello che hai lasciato, il ruolo viene
   ceduto per primo, allo stesso modo in cui farebbe `/leave` (vedi
   punto 6 sotto).
2. Ogni altro partecipante invia `/join <codice>` al bot, che lo invita
   anche a eseguire `/sharetext` nel caso voglia aiutare a diffonderlo
   anche lui. Un agente può contribuire attivamente a un solo evento
   alla volta, quindi unirsi a uno diverso mentre quello attuale non è
   ancora risolto chiede prima di confermare il cambio — e, se
   amministravi quell'altro, ne cede il ruolo allo stesso modo. Se il
   tuo evento attuale è già chiuso, o non ne hai uno, `/join` ti fa
   passare immediatamente senza chiedere. Se il codice a cui ti stai
   unendo appartiene a un evento che è stato chiuso perché il suo
   amministratore precedente se n'è andato senza nessuno idoneo ad
   assumere il ruolo, `/join` lo riapre e ti rende il suo amministratore
   invece di rifiutare il codice.
3. Quando trovi un valore, invii semplicemente la sua posizione e il
   valore: `6 GLYPH` segnala che la posizione 6 (la parola) è `GLYPH`;
   `7 3` segnala che la posizione 7 è la cifra `3`. Non serve ricordare
   nessun comando. Le lettere vengono mostrate in maiuscolo, ma puoi
   digitarle come preferisci.
4. Il bot mantiene un unico messaggio per partecipante aggiornato con
   lo stato attuale del passcode, modificandolo sul posto ogni volta che
   qualcuno segnala qualcosa di nuovo — non intasa la chat con un nuovo
   messaggio per ogni segnalazione.
5. Se due persone diverse segnalano valori diversi per la stessa
   posizione, entrambi vengono mantenuti: il bot mostra ogni possibile
   passcode completo risultante nel proprio blocco facile da copiare,
   con quante persone lo sostengono ciascuno — e, per quelli meno
   sostenuti, chi li ha segnalati, così l'amministratore dell'evento può
   individuare un errore o un troll. Se ciò che invii non corrisponde
   alla posizione prevista, o contraddice ciò che **qualcun altro** ha
   già segnalato, il bot ti chiede di confermare prima di registrarlo.
   Correggere la tua **propria** segnalazione precedente è diverso: non
   serve conferma, il tuo valore precedente lì viene semplicemente
   sostituito — e il bot ti dice qual era quel valore precedente, nel
   caso la correzione stessa fosse stata un errore e tu voglia
   rimandarlo. Se quel vecchio valore era l'unica cosa a mantenere una
   posizione in disaccordo, il disaccordo si risolve da solo
   immediatamente. Hai segnalato un valore alla posizione sbagliata, o
   ancora non la conosci davvero? Invia solo il numero di posizione
   senza nient'altro dopo (o `/submit <posizione>`) per rimuovere la tua
   segnalazione lì — senza conferma, e il bot nomina il valore che ha
   rimosso così puoi annullare anche questo se serve.
6. L'amministratore dell'evento risolve un disaccordo con `/resolve
   <posizione> <valore>` — oppure, eseguito solo come
   `/resolve <posizione>`, il bot elenca i valori segnalati per quella
   posizione con quante persone sostengono ciascuno — e, se qualcuno di
   quei sostenitori è contrassegnato come affidabile, quanti di loro —
   e mostra un pulsante per valore (il più sostenuto per primo) per
   risolvere con un solo tocco. Eseguire `/resolve` da solo, senza
   argomenti, ripercorre invece tutte le posizioni ancora in disaccordo
   una alla volta: risolvi quella mostrata tramite i suoi pulsanti e il
   bot invia subito la successiva, finché non segnala che non ne restano
   più. Quel messaggio non offre mai una scorciatoia per chiudere
   l'evento, anche se a quel punto ogni posizione ha già un valore
   stabilito — chi segnala che concorda tra loro non è la stessa cosa
   del passcode che funziona davvero, quindi il bot rimanda
   l'amministratore a `/verify` (vedi sotto). L'amministratore può anche
   contrassegnare un partecipante come affidabile o come troll se
   necessario. Contrassegnare qualcuno come troll, solo per quell'evento,
   scarta il resto delle sue segnalazioni e smette di inviargli
   ulteriori aggiornamenti — incluso il passcode finale quando l'evento
   si chiude.

   Quando restano solo poche posizioni in disaccordo, può essere più
   veloce provare direttamente alcuni dei blocchi di passcode renderizzati
   nella schermata di riscatto del gioco. Una volta che uno di essi viene
   confermato corretto lì, l'amministratore lo incolla di nuovo con
   `/verify <passcode>` e il bot scopre, per tutte le posizioni in una
   volta, quale valore segnalato lo ha prodotto.
7. `/verify <passcode>` è l'**unico** modo per completare e chiudere un
   evento — non esiste un comando separato per "chiudere". Anche se ogni
   posizione è già concorde, quell'accordo non è stato testato contro il
   gioco stesso, quindi l'amministratore deve copiare un passcode
   candidato, incollarlo nel negozio, confermare che viene accettato, e
   incollare esattamente quello stesso passcode in `/verify`. Una volta
   che corrisponde, il bot risolve tutte le posizioni a partire da esso
   e invia il passcode finale come messaggio **nuovo** a ogni
   partecipante — non solo una modifica — così nessuno se lo perde anche
   se non stava seguendo attivamente.

### Riferimento dei comandi

| Comando | Chi può usarlo | Cosa fa |
|---|---|---|
| `/start`, `/help` | chiunque | Introduzione ed elenco dei comandi. |
| `/language <codice>` | chiunque | Imposta la tua lingua (`en`, `ca`, `es`, `fr`, `gl`, `eu`, `pt`, `it`, `de`). |
| `/newevent <nome> [\| <pattern>]` | chiunque | Crea un nuovo evento IFS e ottiene il suo codice di accesso; ti unisce automaticamente e ti contrassegna come affidabile. Il `\|` qui separa il nome dal pattern, non significa "scegli l'uno o l'altro" — es. `/newevent Barcelona 2026-08 \| XXX99*999XX`. Chiede conferma prima se il tuo evento attuale non è ancora risolto (rifiutare non crea nulla); quello viene ceduto per primo, come `/leave`. |
| `/sharetext [codice] [lingua]` | chiunque | Ottiene un testo pronto da incollare per invitare persone a unirsi. `codice` è di default il tuo evento attuale, `lingua` la tua — già inviato automaticamente una volta da `/newevent`. |
| `/join <codice>` | chiunque | Unisciti a un evento — chiede conferma prima solo se il tuo evento attuale non è ancora risolto, cedendolo se lo amministravi; saltato se non ne hai uno o è già chiuso. Un codice chiuso senza amministratore si riapre sotto di te invece di essere rifiutato. |
| `/leave` | partecipante | Lascia il tuo evento attuale. Se sei l'amministratore, un altro partecipante assume automaticamente il ruolo (preferendo gli affidabili, poi chi ha contribuito di più), oppure l'evento viene chiuso come incompiuto se nessuno è idoneo — la stessa cessione avviene se lo lasci creando o unendoti a un altro evento. |
| `/current` | chiunque | Mostra l'evento attuale: nome, codice di accesso, pattern, numero di partecipanti e amministratore attuale. |
| `<posizione> <valore>` (o `/submit <posizione> <valore>`) | partecipante | Segnala il valore trovato a una posizione. |
| `<posizione>` da sola (o `/submit <posizione>`) | partecipante | Rimuove la tua segnalazione a quella posizione, se presente. |
| `/status` | partecipante | Mostra lo stato attuale del passcode su richiesta; sposta anche i prossimi aggiornamenti in tempo reale su questo nuovo messaggio, nel caso quello precedente sia scorso molto in alto nella chat. |
| `/resolve <posizione> [<valore \| @utente>]` | amministratore dell'evento | Sceglie il valore corretto quando c'è disaccordo; senza valore, elenca i valori segnalati (con il dettaglio dei sostenitori affidabili) come pulsanti da risolvere. |
| `/resolve` (senza argomenti) | amministratore dell'evento | Ripercorre tutte le posizioni ancora in disaccordo, una alla volta; una volta esaurite, rimanda a `/verify` — il consenso da solo non chiude mai l'evento. |
| `/unresolve <posizione>` | amministratore dell'evento | Riapre una posizione risolta. |
| `/trust <utente>` | amministratore dell'evento | Contrassegna un partecipante come affidabile, così il suo sostegno viene evidenziato nell'elenco di candidati di `/resolve`. |
| `/troll <utente>` | amministratore dell'evento | Scarta le segnalazioni di un partecipante e smette di aggiornarlo (solo per questo evento). |
| `/untrust <utente>` | amministratore dell'evento | Rimuove il contrassegno di affidabilità di un partecipante; se era stato trollato, lo aggiorna anche con un nuovo messaggio di stato. |
| `/kick <utente>` | amministratore dell'evento | Rimuove un partecipante dall'evento. |
| `/promote <utente>` | amministratore dell'evento | Cede il ruolo di amministratore a un altro partecipante già nell'evento; viene anche contrassegnato come affidabile, allo stesso modo in cui `/newevent` fa per il proprio amministratore. |
| `/claim` | partecipante | Prova ad assumere il ruolo di amministratore se quello attuale è silenzioso da 30+ minuti; ha 5 minuti per accettare, rifiutare o non rispondere prima che avvenga. |
| `/verify <passcode>` | amministratore dell'evento | L'unico modo per chiudere un evento: incolla un passcode confermato corretto nella schermata di riscatto del gioco; risolve tutte le posizioni a partire da esso in una volta, blocca l'evento e annuncia il passcode finale a tutti. |
| `/events` | chiunque | Elenca tutti gli eventi a cui hai partecipato, attuali o passati. |

Ogni giocatore vede i messaggi del bot nella propria lingua, impostata
una volta con `/language` e ricordata da quel momento in poi.

## Stato del progetto

**In funzione**, su [`@ifs_relay_bot`](https://t.me/ifs_relay_bot) su
Telegram. Ogni comando descritto sopra è implementato e distribuito.
Consulta [`CLAUDE.md`](CLAUDE.md) (in inglese) per il design tecnico
completo (modello dati, algoritmo di risoluzione dei conflitti,
architettura i18n) se vuoi contribuire.

## Architettura

- **Runtime:** Cloudflare Workers, che riceve gli aggiornamenti Telegram
  via webhook.
- **Framework del bot:** [grammY](https://grammy.dev).
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Linguaggio:** TypeScript.
- **Dominio:** `ifspasscoderelay.grifwl.blue`.

## Guida all'installazione

Questi sono passaggi una tantum per mettere in piedi l'infrastruttura
del bot — fatti una volta per l'intero progetto, non una volta per ogni
evento IFS. I passaggi 1, 3 e 4 non richiedono che il codice
dell'applicazione esista già; i passaggi 2 e 5 necessitano di un Worker
distribuito, quindi vengono per ultimi, una volta iniziata
l'implementazione.

### 1. Creare il bot Telegram

1. Apri una chat con [@BotFather](https://t.me/BotFather) su Telegram.
2. Invia `/newbot`, scegli un nome visualizzato e uno username univoco
   che termini in `bot` (es. `IfsPasscodeRelayBot`).
3. BotFather risponde con un **token del bot** — trattalo come una
   password (chiunque lo abbia può inviare messaggi come il bot). Viene
   salvato come secret di Cloudflare al passaggio 4 qui sotto, mai
   caricato su questo repository.
4. Ancora parlando con BotFather, configura il profilo pubblico del
   bot:
   - `/setuserpic` — carica un'immagine del profilo.
   - `/setdescription` — la descrizione lunga mostrata nella schermata
     vuota della chat del bot, prima che qualcuno gli abbia parlato.
   - `/setabouttext` — la bio breve mostrata nella sua pagina profilo.
   - `/setjoingroups` → *Disable*. Il bot è costruito attorno a chat
     private 1:1 — il messaggio di stato in tempo reale di ogni
     partecipante viene modificato sul posto, il che ha senso solo in
     una chat con lui e il bot da soli — quindi l'uso nei gruppi resta
     disattivato.

   Non serve `/setcommands`: il bot registra il proprio elenco di
   comandi direttamente dal codice tramite il `setMyCommands` della Bot
   API, quindi Telegram mostra i suggerimenti di completamento
   automatico automaticamente e non possono mai disallinearsi da un
   elenco mantenuto manualmente su BotFather.

#### Descrizione e testo "about" suggeriti

Imposta prima la versione inglese con `/setdescription` e
`/setabouttext` — è quella su cui BotFather ripiega per qualsiasi lingua
del client Telegram senza una propria traduzione. Poi, dagli stessi
menu, aggiungi le versioni `ca`/`es`/`fr`/`gl`/`eu`/`pt`/`it`/`de` qui
sotto come descrizioni per lingua.

| Lingua | `/setdescription` (lunga) | `/setabouttext` (breve) |
|---|---|---|
| `en` | Collaboratively build your Ingress First Saturday event's redeemable passcode in real time. Report the character you found and its position — the bot keeps everyone's passcode in sync, flags disagreements, and announces the final result. Available in English, Català, Castellano, Français, Galego, Euskara, Português, Italiano and Deutsch. Send /help to start, or /newevent to create one for your IFS. | Real-time collaborative passcode relay for Ingress First Saturday events. |
| `ca` | Construeix en temps real, de manera col·laborativa, el passcode bescanviable del teu esdeveniment Ingress First Saturday. Reporta el caràcter que has trobat i la seva posició — el bot manté el passcode sincronitzat per a tothom, marca les discrepàncies i anuncia el resultat final. Disponible en català, anglès, castellà, francès, gallec, basc, portuguès, italià i alemany. Envia /help per començar, o /newevent per crear-ne un pel teu IFS. | Relleu col·laboratiu en temps real del passcode d'un Ingress First Saturday. |
| `es` | Construye en tiempo real, de forma colaborativa, el passcode canjeable de tu evento Ingress First Saturday. Reporta el carácter que has encontrado y su posición — el bot mantiene el passcode sincronizado para todos, marca las discrepancias y anuncia el resultado final. Disponible en español, inglés, catalán, francés, gallego, euskera, portugués, italiano y alemán. Envía /help para empezar, o /newevent para crear uno para tu IFS. | Relevo colaborativo en tiempo real del passcode de un Ingress First Saturday. |
| `fr` | Construisez en temps réel, de façon collaborative, le passcode échangeable de votre événement Ingress First Saturday. Signalez le caractère trouvé et sa position — le bot garde le passcode synchronisé pour tout le monde, signale les désaccords et annonce le résultat final. Disponible en français, anglais, catalan, espagnol, galicien, basque, portugais, italien et allemand. Envoyez /help pour commencer, ou /newevent pour en créer un pour votre IFS. | Relais collaboratif en temps réel du passcode d'un Ingress First Saturday. |
| `gl` | Constrúe en tempo real, de forma colaborativa, o passcode canxeable do teu evento Ingress First Saturday. Reporta o carácter que atopaches e a súa posición — o bot mantén o passcode sincronizado para todos, marca as discrepancias e anuncia o resultado final. Dispoñible en galego, inglés, catalán, castelán, francés, éuscaro, portugués, italiano e alemán. Envía /help para empezar, ou /newevent para crear un para o teu IFS. | Relevo colaborativo en tempo real do passcode dun Ingress First Saturday. |
| `eu` | Osatu denbora errealean, elkarlanean, zure Ingress First Saturday ekitaldiaren pasakode kanjeagarria. Jakinarazi aurkitu duzun karakterea eta bere posizioa — botak guztien pasakodea sinkronizatuta mantentzen du, desadostasunak markatzen ditu eta azken emaitza iragartzen du. Euskaraz, ingelesez, katalanez, gaztelaniaz, frantsesez, galizieraz, portugesez, italieraz eta alemanez eskuragarri. Bidali /help hasteko, edo /newevent zure IFS-rako bat sortzeko. | Ingress First Saturday ekitaldien pasakode-errelebo kolaboratiboa, denbora errealean. |
| `pt` | Construa em tempo real, de forma colaborativa, o passcode resgatável do seu evento Ingress First Saturday. Reporte o caractere que encontrou e sua posição — o bot mantém o passcode sincronizado para todos, sinaliza discrepâncias e anuncia o resultado final. Disponível em português, inglês, catalão, castelhano, francês, galego, basco, italiano e alemão. Envie /help para começar, ou /newevent para criar um para o seu IFS. | Revezamento colaborativo em tempo real do passcode de um Ingress First Saturday. |
| `it` | Costruisci in tempo reale, in modo collaborativo, il passcode riscattabile del tuo evento Ingress First Saturday. Segnala il carattere che hai trovato e la sua posizione — il bot mantiene il passcode sincronizzato per tutti, segnala i disaccordi e annuncia il risultato finale. Disponibile in italiano, inglese, catalano, spagnolo, francese, galiziano, basco, portoghese e tedesco. Invia /help per iniziare, o /newevent per crearne uno per il tuo IFS. | Staffetta collaborativa in tempo reale del passcode di un Ingress First Saturday. |
| `de` | Baue in Echtzeit, gemeinsam mit anderen, den einlösbaren Passcode deines Ingress-First-Saturday-Events. Melde das gefundene Zeichen und seine Position — der Bot hält den Passcode für alle synchron, markiert Uneinigkeiten und verkündet das Endergebnis. Verfügbar auf Deutsch, Englisch, Katalanisch, Spanisch, Französisch, Galicisch, Baskisch, Portugiesisch und Italienisch. Sende /help zum Starten, oder /newevent, um eines für dein IFS zu erstellen. | Kollaborative Echtzeit-Passcode-Staffel für Ingress-First-Saturday-Events. |

### 2. Creare il Worker Cloudflare e il database D1

Richiede un account Cloudflare con la zona `grifwl.blue` già aggiunta,
e [wrangler](https://developers.cloudflare.com/workers/wrangler/)
installato (`npm install -g wrangler`, oppure usa `npx wrangler`).

1. `wrangler login` per autenticare la CLI.
2. `wrangler d1 create ifs-passcode-relay` crea il database D1 e
   stampa un `database_id` — conservalo, andrà nel binding
   `[[d1_databases]]` (chiamato `DB`) di `wrangler.toml` una volta che
   il codice esiste.
3. Una volta che lo scheletro dell'applicazione esiste, `wrangler
   deploy` pubblica il Worker per la prima volta.

### 3. Assegnare il sottodominio

Il bot vive su **`ifspasscoderelay.grifwl.blue`**. Dato che la zona
`grifwl.blue` è già sullo stesso account Cloudflare usato per il
deploy, questo non richiede alcun passaggio manuale nella dashboard —
dichiarala come [Custom
Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
direttamente in `wrangler.toml`:

```toml
routes = [
  { pattern = "ifspasscoderelay.grifwl.blue", custom_domain = true }
]
```

`wrangler deploy` provvede quindi automaticamente al record DNS e al
certificato TLS. La dashboard serve solo come ripiego se la zona ha mai
bisogno di attenzione manuale (es. se risulta vivere su un account
Cloudflare diverso da quello a cui `wrangler` è autenticato).

### 4. Pubblicare il token del bot come secret

1. `wrangler secret put BOT_TOKEN` e incolla il token del passaggio 1
   quando richiesto — questo lo salva crittografato su Cloudflare,
   esposto al Worker come `env.BOT_TOKEN`, e mai caricato sul
   repository.
2. Per lo sviluppo locale, metti lo stesso valore in `.dev.vars` (già
   nel gitignore) come `BOT_TOKEN=...`.
3. Genera anche una stringa casuale da usare come secret del webhook
   (es. `openssl rand -hex 32`) e salvala allo stesso modo, come
   `TELEGRAM_WEBHOOK_SECRET` — il Worker la usa per rifiutare qualsiasi
   richiesta che non provenga davvero da Telegram (vedi passaggio 5).

### 5. Puntare Telegram verso il Worker (webhook)

Una volta che il Worker è distribuito e raggiungibile al suo URL
pubblico:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ifspasscoderelay.grifwl.blue/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Telegram include quindi lo stesso secret in un header
`X-Telegram-Bot-Api-Secret-Token` su ogni aggiornamento che consegna; il
Worker deve verificare che corrisponda prima di elaborare qualsiasi
cosa, e rifiutare la richiesta in caso contrario — questo è ciò che
impedisce a chiunque altro di inviare aggiornamenti falsi all'URL
pubblico del webhook. Verifica che il webhook sia registrato con:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### 6. Configurare la dashboard amministrativa privata

Una dashboard privata, di sola lettura, vive su `/admin` (es.
`https://ifspasscoderelay.grifwl.blue/admin`), per ispezionare i dati
D1 in tempo reale senza una sessione interattiva di
`wrangler d1 execute`. È protetta da password, e i dati appartenenti a
un evento specifico (partecipanti, segnalazioni, candidati, risoluzioni,
contrassegni di affidabilità, negoziazioni di claim) vengono mostrati
solo dopo aver scelto quell'evento da un menu a tendina — le tabelle
globali (eventi, utenti, parole conosciute, creazioni di eventi in
sospeso) sono sempre visibili. Niente si aggiorna automaticamente: ogni
vista è un'istantanea del momento in cui l'hai caricata o aggiornata
l'ultima volta, con un pulsante di aggiornamento manuale per
interrogare di nuovo su richiesta.

1. Genera una password e una chiave di firma casuale separata per i
   suoi cookie di sessione (es. `openssl rand -hex 24` per la password,
   `openssl rand -hex 32` per la chiave), poi pubblica entrambe allo
   stesso modo del token del bot: `wrangler secret put
   ADMIN_DASHBOARD_PASSWORD` e `wrangler secret put
   ADMIN_SESSION_SECRET`.
2. Per lo sviluppo locale, aggiungi gli stessi due valori a
   `.dev.vars` come `ADMIN_DASHBOARD_PASSWORD=...` e
   `ADMIN_SESSION_SECRET=...`.

## Licenza

MIT.
