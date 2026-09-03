<!-- Languages: [English](README.md) | [Català](README.ca.md) | [Castellano](README.es.md) | [Français](README.fr.md) | [Galego](README.gl.md) | [Euskara](README.eu.md) | [Português](README.pt.md) | [Italiano](README.it.md) | Deutsch -->

# IFS Passcode Relay

Ein Telegram-Bot, mit dem Teilnehmer eines
**Ingress First Saturday (IFS)**-Events den einlösbaren Passcode des
Events gemeinsam in Echtzeit zusammensetzen.

**Sprachen:** [English](README.md) · [Català](README.ca.md) · [Castellano](README.es.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Euskara](README.eu.md) · [Português](README.pt.md) · [Italiano](README.it.md) · Deutsch

## Worum geht es hier?

Ingress First Saturday ist eine wiederkehrende Präsenzveranstaltung für
das Mobile Game [Ingress](https://ingress.com). Dabei erhalten die
Spieler Bilder einer Reihe von Portalen; wer sie vor Ort besucht und
ihre Medien untersucht, findet jeweils ein Zeichen. Werden die Zeichen
in der richtigen Reihenfolge aneinandergereiht, ergibt sich ein
Passcode, der im Spiel-Shop gegen ein IFS-Item-Paket eingelöst werden
kann.

Mehrere IFS-Events können gleichzeitig stattfinden, jedes mit eigenem
Passcode. Dieser Bot lässt alle Teilnehmer eines bestimmten IFS das
gefundene Zeichen und dessen Position melden und hält eine geteilte
Live-Ansicht des Passcodes, während er sich füllt — kein manuelles
Sammeln von Screenshots in einer Gruppenchat mehr nötig.

## So funktioniert es aus Sicht eines Spielers

1. Wer die Passcode-Staffel für ein bestimmtes IFS organisiert, erstellt
   ein Event mit `/newevent` und erhält einen kurzen Beitrittscode zum
   Teilen mit den Teilnehmern (z. B. in einer WhatsApp-Gruppe) — der Bot
   sendet sofort eine fertige Einladungsnachricht mit diesem Code, und
   die erstellende Person tritt dem Event automatisch bei — als dessen
   Administrator —, da die Organisation nicht davon befreit, selbst auch
   Portale zu jagen. Sie beginnt außerdem als vertrauenswürdig für ihr
   eigenes Event markiert, genau wie `/trust` jede andere Person markieren
   würde. Standardmäßig wird erwartet, dass der Passcode dem Muster
   `XXX99*999XX` folgt (drei Buchstaben, zwei Ziffern, ein ganzes Wort,
   drei Ziffern, zwei Buchstaben) — die erstellende Person kann ein
   anderes Muster festlegen, falls dieses IFS eine andere Form verwendet.
   Der Name des Events muss nicht eindeutig sein: `/newevent` zweimal mit
   demselben Namen auszuführen ist kein Fehler, es erstellt einfach zwei
   getrennte Events mit zwei unterschiedlichen Beitrittscodes. Da
   Teilnehmer beim Auswählen, welchem Code sie folgen, nur den Namen
   sehen, sollte er spezifisch genug sein, um gleichnamige IFS-Events zu
   unterscheiden — z. B. `/newevent Barcelona 2026-08` mit Jahr und
   Monat, statt eines bloßen `/newevent Barcelona`, das mit jedem
   anderen Barcelona-IFS kollidiert. Bist du gerade in einem anderen,
   noch nicht geklärten (nicht geschlossenen) Event, wirst du zuerst um
   Bestätigung gebeten — egal ob du es verwaltest oder nicht —, da das
   Erstellen dieses Events jenes zurücklässt; Ablehnen erstellt gar
   nichts. War jenes Event bereits geschlossen, oder warst du in keinem,
   wird ohne Nachfrage sofort erstellt. So oder so: Warst du Administrator
   des verlassenen Events, wird die Rolle zuerst übergeben, genau wie es
   `/leave` tun würde (siehe Schritt 6 unten).
2. Jeder andere Teilnehmer sendet `/join <Code>` an den Bot, der auch
   dazu einlädt, selbst `/sharetext` auszuführen, falls er ebenfalls
   beim Verbreiten helfen möchte. Ein Agent kann jeweils nur zu einem
   Event aktiv beitragen, daher wird beim Wechsel zu einem anderen,
   während das aktuelle noch nicht geklärt ist, zuerst um Bestätigung
   des Wechsels gebeten — und, falls du jenes andere verwaltet hast,
   wird die Rolle genauso übergeben. Ist dein aktuelles Event bereits
   geschlossen, oder hast du keines, wechselt `/join` dich sofort ohne
   Nachfrage. Gehört der Code, dem du beitrittst, zu einem Event, das
   geschlossen wurde, weil sein vorheriger Administrator es verlassen
   hat, ohne dass jemand geeignet war, die Rolle zu übernehmen, öffnet
   `/join` es wieder und macht dich zu seinem Administrator, statt den
   Code abzulehnen.
3. Wenn du einen Wert findest, sendest du einfach dessen Position und
   Wert: `6 GLYPH` meldet, dass Position 6 (das Wort) `GLYPH` ist; `7 3`
   meldet, dass Position 7 die Ziffer `3` ist. Du musst dir keinen
   Befehl merken. Buchstaben werden in Großbuchstaben angezeigt, du
   kannst sie aber eingeben, wie du möchtest.
4. Der Bot hält pro Teilnehmer eine einzige Nachricht mit dem aktuellen
   Stand des Passcodes aktuell und bearbeitet sie an Ort und Stelle,
   sobald jemand etwas Neues meldet — er überflutet die Chat nicht mit
   einer neuen Nachricht pro Meldung.
5. Melden zwei verschiedene Personen unterschiedliche Werte für dieselbe
   Position, werden beide behalten: Der Bot zeigt jede daraus
   resultierende vollständige Passcode-Möglichkeit in einem eigenen,
   leicht zu kopierenden Block, mit der Anzahl der Personen, die sie
   jeweils unterstützen — und bei den am wenigsten unterstützten, wer sie
   gemeldet hat, damit der Administrator des Events einen Fehler oder
   einen Troll erkennen kann. Passt das Gesendete nicht zur erwarteten
   Position, oder widerspricht es dem, was **jemand anderes** bereits
   gemeldet hat, bittet der Bot um Bestätigung, bevor er es erfasst. Die
   Korrektur der **eigenen** früheren Meldung ist anders: keine
   Bestätigung nötig, der bisherige Wert dort wird einfach ersetzt — und
   der Bot sagt dir, welcher Wert das war, falls die Korrektur selbst ein
   Fehler war und du ihn zurücksenden möchtest. War dieser alte Wert das
   Einzige, was eine Position uneinig hielt, löst sich die Uneinigkeit
   sofort von selbst auf. An die falsche Position gemeldet, oder kennst
   du sie noch gar nicht wirklich? Sende nur die Positionsnummer ohne
   alles danach (oder `/submit <Position>`), um deine eigene Meldung dort
   zu entfernen — ohne Bestätigung, und der Bot nennt den entfernten
   Wert, damit du auch das bei Bedarf rückgängig machen kannst.
6. Der Administrator des Events klärt eine Uneinigkeit mit `/resolve
   <Position> <Wert>` — oder, nur als `/resolve <Position>` ausgeführt,
   listet der Bot die für diese Position gemeldeten Werte auf, mit der
   Anzahl der Personen, die jeden unterstützen — und, falls einer dieser
   Unterstützer als vertrauenswürdig markiert ist, wie viele davon —
   und zeigt pro Wert einen Button (am meisten unterstützt zuerst), um
   mit einem einzigen Tipp zu klären. Wird `/resolve` allein, ohne
   Argumente, ausgeführt, geht es stattdessen alle noch uneinigen
   Positionen einzeln durch: Klärst du die angezeigte über ihre Buttons,
   sendet der Bot sofort die nächste, bis er meldet, dass keine mehr
   übrig sind. Diese Nachricht bietet nie eine Abkürzung zum Schließen
   des Events an, selbst wenn bis dahin jede Position bereits einen
   festgelegten Wert hat — dass sich Meldende einig sind, ist nicht
   dasselbe, wie dass der Passcode tatsächlich funktioniert, daher
   verweist der Bot den Administrator stattdessen auf `/verify` (siehe
   unten). Der Administrator kann einen Teilnehmer bei Bedarf auch als
   vertrauenswürdig oder als Troll markieren. Jemanden als Troll zu
   markieren, nur für dieses Event, verwirft dessen restliche Meldungen
   und stoppt weitere Aktualisierungen an ihn — einschließlich des
   finalen Passcodes, wenn das Event geschlossen wird.

   Bleiben nur noch wenige Positionen uneinig, kann es schneller sein,
   einfach ein paar der gerenderten Passcode-Blöcke direkt am
   Einlöse-Bildschirm des Spiels auszuprobieren. Sobald einer davon dort
   als korrekt bestätigt wird, fügt der Administrator ihn mit
   `/verify <passcode>` wieder ein, und der Bot findet für alle
   Positionen auf einmal heraus, welcher gemeldete Wert ihn ergeben hat.
7. `/verify <passcode>` ist der **einzige** Weg, ein Event abzuschließen
   und zu schließen — es gibt keinen separaten "Schließen"-Befehl. Selbst
   wenn bereits jede Position übereinstimmt, wurde diese Übereinstimmung
   nicht gegen das Spiel selbst getestet, daher muss der Administrator
   einen Kandidaten-Passcode kopieren, im Shop einfügen, die Annahme
   bestätigen und genau diesen Passcode in `/verify` einfügen. Sobald er
   passt, klärt der Bot alle Positionen daraus und sendet den finalen
   Passcode als **neue** Nachricht an jeden Teilnehmer — nicht nur eine
   Bearbeitung —, damit niemand ihn verpasst, selbst wenn er nicht aktiv
   mitverfolgt hat.

### Befehlsübersicht

| Befehl | Wer kann ihn nutzen | Was er tut |
|---|---|---|
| `/start`, `/help` | jeder | Einführung und Befehlsliste. |
| `/language <Code>` | jeder | Legt deine eigene Sprache fest (`en`, `ca`, `es`, `fr`, `gl`, `eu`, `pt`, `it`, `de`). |
| `/newevent <Name> [\| <Muster>]` | jeder | Erstellt ein neues IFS-Event und liefert dessen Beitrittscode; tritt dir automatisch bei und markiert dich als vertrauenswürdig dafür. Das `\|` hier trennt den Namen vom Muster, es bedeutet nicht "wähle das eine oder das andere" — z. B. `/newevent Barcelona 2026-08 \| XXX99*999XX`. Fragt zuerst nach Bestätigung, wenn dein aktuelles Event noch nicht geklärt ist (Ablehnen erstellt nichts); dieses wird zuerst übergeben, genau wie `/leave`. |
| `/sharetext [Code] [Sprache]` | jeder | Liefert einen fertigen Einladungstext. `Code` ist standardmäßig dein aktuelles Event, `Sprache` deine eigene — bereits einmal automatisch von `/newevent` gesendet. |
| `/join <Code>` | jeder | Einem Event beitreten — fragt nur nach Bestätigung, wenn dein aktuelles Event noch nicht geklärt ist, und übergibt es dabei, falls du es verwaltet hast; wird übersprungen, wenn du keines hast oder es bereits geschlossen ist. Ein ohne Administrator geschlossener Code wird unter dir wiedereröffnet, statt abgelehnt zu werden. |
| `/leave` | Teilnehmer | Verlässt dein aktuelles Event. Bist du Administrator, übernimmt automatisch ein anderer Teilnehmer die Rolle (zuerst vertrauenswürdige, sonst wer am meisten beigetragen hat), oder das Event wird als unvollendet geschlossen, wenn niemand geeignet ist — dieselbe Übergabe geschieht, wenn du es stattdessen durch Erstellen oder Beitreten eines anderen Events verlässt. |
| `/current` | jeder | Zeigt das aktuelle Event: Name, Beitrittscode, Muster, Teilnehmerzahl und aktuellen Administrator. |
| `<Position> <Wert>` (oder `/submit <Position> <Wert>`) | Teilnehmer | Meldet den an einer Position gefundenen Wert. |
| `<Position>` allein (oder `/submit <Position>`) | Teilnehmer | Entfernt deine eigene Meldung an dieser Position, falls vorhanden. |
| `/status` | Teilnehmer | Zeigt den aktuellen Stand des Passcodes auf Abruf; verschiebt außerdem künftige Live-Updates auf diese neue Nachricht, falls die vorherige weit nach oben in der Chat gerutscht ist. |
| `/resolve <Position> [<Wert \| @Nutzer>]` | Administrator des Events | Wählt den richtigen Wert bei Uneinigkeit; ohne Wert werden gemeldete Werte (mit Aufschlüsselung vertrauenswürdiger Unterstützer) als Buttons zum Klären aufgelistet. |
| `/resolve` (ohne Argumente) | Administrator des Events | Geht alle noch uneinigen Positionen einzeln durch; sind keine mehr übrig, verweist es auf `/verify` — Konsens allein schließt das Event nie ab. |
| `/unresolve <Position>` | Administrator des Events | Öffnet eine geklärte Position wieder. |
| `/trust <Nutzer>` | Administrator des Events | Markiert einen Teilnehmer als vertrauenswürdig, sodass seine Unterstützung in der Kandidatenliste von `/resolve` hervorgehoben wird. |
| `/troll <Nutzer>` | Administrator des Events | Verwirft die Meldungen eines Teilnehmers und aktualisiert ihn nicht mehr (nur für dieses Event). |
| `/untrust <Nutzer>` | Administrator des Events | Entfernt die Vertrauensmarkierung eines Teilnehmers; war er getrollt, bringt es ihn auch mit einer neuen Statusnachricht auf den aktuellen Stand. |
| `/kick <Nutzer>` | Administrator des Events | Entfernt einen Teilnehmer aus dem Event. |
| `/promote <Nutzer>` | Administrator des Events | Überträgt die Administratorrolle an einen anderen, bereits im Event befindlichen Teilnehmer; markiert ihn ebenfalls als vertrauenswürdig, genau wie `/newevent` es für den eigenen Administrator tut. |
| `/claim` | Teilnehmer | Versucht, die Administratorrolle zu übernehmen, wenn der aktuelle Administrator seit 30+ Minuten ruhig ist; er hat 5 Minuten Zeit, zuzustimmen, abzulehnen oder nicht zu reagieren, bevor es vollzogen wird. |
| `/verify <passcode>` | Administrator des Events | Der einzige Weg, ein Event zu schließen: füge einen am Einlöse-Bildschirm des Spiels als korrekt bestätigten Passcode ein; klärt daraus alle Positionen auf einmal, friert das Event ein und verkündet allen den finalen Passcode. |
| `/events` | jeder | Listet alle Events auf, an denen du teilgenommen hast, aktuelle oder vergangene. |

Jeder Spieler sieht die Nachrichten des Bots in seiner eigenen Sprache,
einmal mit `/language` festgelegt und ab dann gemerkt.

## Projektstatus

**Live**, unter [`@ifs_relay_bot`](https://t.me/ifs_relay_bot) auf
Telegram. Jeder oben beschriebene Befehl ist implementiert und
bereitgestellt. Siehe [`CLAUDE.md`](CLAUDE.md) (auf Englisch) für das
vollständige technische Design (Datenmodell, Konfliktlösungsalgorithmus,
i18n-Architektur), falls du beitragen möchtest.

## Architektur

- **Laufzeitumgebung:** Cloudflare Workers, empfängt Telegram-Updates
  per Webhook.
- **Bot-Framework:** [grammY](https://grammy.dev).
- **Datenbank:** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Sprache:** TypeScript.
- **Domain:** `ifspasscoderelay.grifwl.blue`.

## Einrichtungsanleitung

Dies sind einmalige Schritte, um die Bot-Infrastruktur aufzusetzen —
einmal für das gesamte Projekt, nicht einmal pro IFS-Event. Die
Schritte 1, 3 und 4 erfordern nicht, dass der Anwendungscode bereits
existiert; die Schritte 2 und 5 benötigen einen bereitgestellten
Worker, daher kommen sie zuletzt, sobald die Implementierung beginnt.

### 1. Den Telegram-Bot erstellen

1. Öffne einen Chat mit [@BotFather](https://t.me/BotFather) auf
   Telegram.
2. Sende `/newbot`, wähle einen Anzeigenamen und einen eindeutigen
   Benutzernamen, der auf `bot` endet (z. B. `IfsPasscodeRelayBot`).
3. BotFather antwortet mit einem **Bot-Token** — behandle es wie ein
   Passwort (wer es hat, kann Nachrichten als der Bot senden). Es wird
   in Schritt 4 unten als Cloudflare-Secret gespeichert, niemals in
   dieses Repository committet.
4. Immer noch im Gespräch mit BotFather, richte das öffentliche Profil
   des Bots ein:
   - `/setuserpic` — ein Profilbild hochladen.
   - `/setdescription` — die lange Beschreibung, die auf dem leeren
     Chat-Bildschirm des Bots angezeigt wird, bevor jemand mit ihm
     gesprochen hat.
   - `/setabouttext` — die kurze Bio auf seiner Profilseite.
   - `/setjoingroups` → *Disable*. Der Bot ist um private 1:1-Chats
     herum gebaut — die Live-Statusnachricht jedes Teilnehmers wird an
     Ort und Stelle bearbeitet, was nur in einem Chat allein mit ihm und
     dem Bot sinnvoll ist — daher bleibt die Nutzung in Gruppen
     deaktiviert.

   `/setcommands` ist nicht nötig: Der Bot registriert seine eigene
   Befehlsliste direkt aus dem Code über das `setMyCommands` der Bot
   API, sodass Telegram automatisch Autovervollständigungsvorschläge
   anzeigt und diese nie von einer manuell gepflegten BotFather-Liste
   abweichen können.

#### Empfohlene Beschreibung und "About"-Text

Lege zuerst die englische Version mit `/setdescription` und
`/setabouttext` fest — darauf greift BotFather für jede
Telegram-Client-Sprache zurück, für die keine eigene Übersetzung
existiert. Füge dann über dieselben Menüs die Versionen
`ca`/`es`/`fr`/`gl`/`eu`/`pt`/`it`/`de` unten als sprachspezifische
Beschreibungen hinzu.

| Sprache | `/setdescription` (lang) | `/setabouttext` (kurz) |
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

### 2. Den Cloudflare Worker und die D1-Datenbank erstellen

Erfordert ein Cloudflare-Konto mit bereits hinzugefügter Zone
`grifwl.blue` und installiertem
[wrangler](https://developers.cloudflare.com/workers/wrangler/)
(`npm install -g wrangler`, oder `npx wrangler` verwenden).

1. `wrangler login`, um die CLI zu authentifizieren.
2. `wrangler d1 create ifs-passcode-relay` erstellt die D1-Datenbank
   und gibt eine `database_id` aus — behalte sie, sie kommt in
   `wrangler.toml`s `[[d1_databases]]`-Binding (namens `DB`), sobald
   der Code existiert.
3. Sobald das Anwendungsgerüst existiert, veröffentlicht
   `wrangler deploy` den Worker zum ersten Mal.

### 3. Die Subdomain zuweisen

Der Bot lebt unter **`ifspasscoderelay.grifwl.blue`**. Da die Zone
`grifwl.blue` bereits im selben Cloudflare-Konto ist, das für das
Deployment verwendet wird, ist kein manueller Schritt im Dashboard
nötig — deklariere sie direkt in `wrangler.toml` als [Custom
Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/):

```toml
routes = [
  { pattern = "ifspasscoderelay.grifwl.blue", custom_domain = true }
]
```

`wrangler deploy` richtet dann automatisch den DNS-Eintrag und das
TLS-Zertifikat dafür ein. Das Dashboard wird nur als Rückfalloption
benötigt, falls die Zone jemals manuelle Aufmerksamkeit braucht (z. B.
falls sie sich als in einem anderen Cloudflare-Konto befindlich
herausstellt als dem, bei dem `wrangler` angemeldet ist).

### 4. Das Bot-Token als Secret veröffentlichen

1. `wrangler secret put BOT_TOKEN` und füge das Token aus Schritt 1 ein,
   wenn danach gefragt wird — dies speichert es verschlüsselt bei
   Cloudflare, dem Worker als `env.BOT_TOKEN` zugänglich gemacht, und
   niemals ins Repository committet.
2. Für die lokale Entwicklung denselben Wert in `.dev.vars` (bereits in
   .gitignore) als `BOT_TOKEN=...` eintragen.
3. Erzeuge zudem eine zufällige Zeichenfolge als Webhook-Secret (z. B.
   `openssl rand -hex 32`) und speichere sie auf dieselbe Weise als
   `TELEGRAM_WEBHOOK_SECRET` — der Worker nutzt sie, um jede Anfrage
   abzulehnen, die nicht wirklich von Telegram stammt (siehe Schritt 5).

### 5. Telegram auf den Worker zeigen lassen (Webhook)

Sobald der Worker bereitgestellt und unter seiner öffentlichen URL
erreichbar ist:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ifspasscoderelay.grifwl.blue/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Telegram fügt dieses gleiche Secret dann in einem
`X-Telegram-Bot-Api-Secret-Token`-Header bei jedem gelieferten Update
hinzu; der Worker muss prüfen, ob es übereinstimmt, bevor er irgendetwas
verarbeitet, und die Anfrage andernfalls ablehnen — das verhindert, dass
irgendjemand sonst gefälschte Updates an die öffentliche Webhook-URL
senden kann. Prüfe, ob der Webhook registriert ist, mit:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### 6. Das private Admin-Dashboard einrichten

Ein privates, schreibgeschütztes Dashboard lebt unter `/admin` (z. B.
`https://ifspasscoderelay.grifwl.blue/admin`), um die Live-D1-Daten
ohne eine interaktive `wrangler d1 execute`-Sitzung zu inspizieren. Es
ist passwortgeschützt, und Daten, die zu einem bestimmten Event gehören
(Teilnehmer, Meldungen, Kandidaten, Klärungen, Vertrauensmarkierungen,
Claim-Verhandlungen), werden erst angezeigt, nachdem du dieses Event aus
einem Dropdown ausgewählt hast — globale Tabellen (Events, Nutzer,
bekannte Wörter, ausstehende Eventerstellungen) sind immer sichtbar.
Nichts aktualisiert sich automatisch: Jede Ansicht ist eine Momentaufnahme
vom Zeitpunkt des letzten Ladens oder Aktualisierens, mit einem manuellen
Aktualisierungsbutton, um bei Bedarf erneut abzufragen.

1. Erzeuge ein Passwort und einen separaten zufälligen Signaturschlüssel
   für seine Sitzungscookies (z. B. `openssl rand -hex 24` für das
   Passwort, `openssl rand -hex 32` für den Schlüssel), und
   veröffentliche beide auf dieselbe Weise wie das Bot-Token: `wrangler
   secret put ADMIN_DASHBOARD_PASSWORD` und `wrangler secret put
   ADMIN_SESSION_SECRET`.
2. Für die lokale Entwicklung dieselben zwei Werte in `.dev.vars` als
   `ADMIN_DASHBOARD_PASSWORD=...` und `ADMIN_SESSION_SECRET=...`
   hinzufügen.

## Lizenz

MIT.
