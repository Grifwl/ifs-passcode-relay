<!-- Languages: [English](README.md) | [Català](README.ca.md) | [Castellano](README.es.md) | [Français](README.fr.md) | [Galego](README.gl.md) | Euskara -->

# IFS Passcode Relay

**Ingress First Saturday (IFS)** ekitaldi bateko partaideei ekitaldiaren
pasakode kanjeagarria denbora errealean elkarlanean osatzeko aukera
ematen dien Telegram bot bat.

**Hizkuntzak:** [English](README.md) · [Català](README.ca.md) · [Castellano](README.es.md) · [Français](README.fr.md) · [Galego](README.gl.md) · Euskara

## Zer da hau?

Ingress First Saturday Ingress joko mugikorraren aldizkako aurrez
aurreko ekitaldi bat da. Ekitaldian zehar, jokalariei portal-sorta baten
irudiak erakusten zaizkie; horiek lekuan bertan bisitatu eta euren
multimedia-edukia aztertzeak karaktere bat agerian jartzen du.
Karaktereak ordena zuzenean kateatuz, jokoaren dendan IFS gai-sorta
baten truke kanjeatu daitekeen pasakode bat lortzen da.

Aldi berean hainbat IFS egon daitezke martxan, bakoitzak bere
pasakodearekin. Bot honek IFS zehatz batera doazen guztiei aurkitutako
karakterea eta dagokion posizioa jakinarazteko aukera ematen die, eta
pasakodearen ikuspegi partekatu eta zuzeneko bat mantentzen du bete
ahala — talde-txat batean eskuz pantaila-argazkiak bildu beharrik gabe.

## Nola funtzionatzen du, jokalari baten ikuspuntutik

1. IFS baten pasakode-errelebua antolatzen duenak `/newevent` bidez
   sortzen du ekitaldia, eta partaideekin (adib. WhatsApp talde batean)
   partekatzeko kode labur bat lortzen du — botak berehala bidaltzen du
   kode horrekin itsasteko prest dagoen gonbidapen-testu bat, eta
   ekitaldia sortzen duena automatikoki batzen zaio — haren
   administratzaile gisa —, antolatzailea izateak ez baitu portalak
   ehizatzetik salbuesten. Halaber, hasieratik bere ekitaldirako
   fidagarritzat markatuta hasten da, `/trust`-ek beste edonorekin
   egingo lukeen bezala. Lehenetsita, pasakodeak `XXX99*999XX` eredua
   jarraitzen duela onartzen da (hiru letra, bi zenbaki, hitz oso bat,
   hiru zenbaki, bi letra) — ekitaldia sortzen duenak beste eredu bat
   ezar dezake IFS horrek beste formatu bat erabiltzen badu.
   Ekitaldiaren izenak ez du bakarra izan behar: `/newevent` bi aldiz
   izen berdin-berdinarekin exekutatzea ez da errore bat, bi ekitaldi
   bereizi sortzen ditu bi batzeko kode ezberdinekin. Partaideek izena
   bakarrik ikusten dutenez zein kode jarraitu erabakitzeko orduan,
   komeni da izen berdina duten IFS ekitaldiak bereizteko nahiko
   zehatza izatea — adibidez, `/newevent Barcelona 2026-08`, urtea eta
   hilabetea barne, Bartzelonako beste edozein IFS-rekin talka egiten
   duen `/newevent Barcelona` soil baten ordez. Oraindik ebatzi gabeko
   (itxi gabeko) beste ekitaldi batean bazaude, lehenik berrespena
   eskatzen dizu — administratzen duzun ala ez kontuan hartu gabe —, hau
   sortzeak hura atzean uzten baitu; ezetz esaten baduzu, ez da ezer
   sortzen. Ekitaldi hori jada itxita bazegoen, edo ez bazinen inon ere,
   berehala sortzen da galdetu gabe. Edonola ere, uzten duzuna
   administratzen bazenuen, lehenik lagatzen da, `/leave`-k egingo
   lukeen bezala (ikus 6. puntua behean).
2. Gainerako partaideek `/join <kodea>` bidaltzen diote botari, honek
   `/sharetext` exekutatzera ere gonbidatzen dituelarik hura zabaltzen
   laguntzeko interesa badute. Agente batek aldi berean ekitaldi bakar
   batean bakarrik parte har dezake aktiboki, beraz uneko ekitaldia
   oraindik ebatzi gabe dagoen bitartean beste batera batzeak lehenik
   aldaketa berresteko eskatzen du — eta, aurrekoa administratzen
   bazenuen, berdin lagatzen du. Zure uneko ekitaldia jada itxita
   badago, edo ez baduzu bat ere, `/join`-ek berehala aldatzen zaitu
   galdetu gabe. Batzen zaren kodea, aurreko administratzaileak
   erreleboa hartzeko inor egokirik gabe utzitako ekitaldi batena bada,
   `/join`-ek berrirekitzen du eta zu bihurtzen zaitu haren
   administratzaile, kodea ukatu ordez.
3. Balio bat aurkitzen duzunean, posizioa eta balioa bidaltzen dituzu,
   besterik gabe: `6 GLYPH` bidaliz 6 posizioa (hitza) `GLYPH` dela
   jakinarazten da; `7 3` bidaliz 7 posizioa `3` zenbakia dela
   jakinarazten da. Ez da komandorik gogoratu behar. Letrak maiuskulaz
   erakusten dira, baina nahi duzun bezala idatz ditzakezu.
4. Botak partaide bakoitzeko mezu bakar bat mantentzen du eguneratuta
   pasakodearen uneko egoerarekin, norbaitek zerbait berri jakinarazten
   duen bakoitzean editatuz — ez du txata mezu berriekin gainezkatzen
   jakinarazpen bakoitzeko.
5. Bi pertsona ezberdinek posizio berarentzat balio ezberdinak
   jakinarazten badituzte, biak mantentzen dira: botak posible den
   pasakode oso bakoitza kopiatzeko erraza den bloke batean erakusten
   du, zenbat pertsonak babesten duten adieraziz — eta, gutxien
   babestutakoetan, nork jakinarazi dituen, ekitaldiaren
   administratzaileak errore bat edo troll bat antzeman dezan. Bidaltzen
   duzuna espero den posizioarekin bat ez badator, edo beste norbaitek
   jada jakinarazitako zerbaiten aurka badoa, botak berrespena eskatzen
   dizu erregistratu aurretik. Zure aurreko jakinarazpen bera zuzentzea
   ezberdina da: ez da berrespenik behar, posizio horretako zure aurreko
   balioa zuzenean ordezkatzen da — eta botak esaten dizu zein zen balio
   hori, zuzenketa bera errore bat izan bada eta atzera bidali nahi
   baduzu. Balio hori bazen desadostasun bat mantentzen zuen bakarra,
   desadostasuna berehala desagertzen da.
   Posizio okerrean bidali duzu balio bat, edo oraindik ez dakizu ziur?
   Bidali posizio-zenbakia bakarrik, ondoren ezer gabe (edo `/submit
   <posizioa>`), posizio horretan zure jakinarazpena kentzeko —
   berrespenik gabe, eta botak zein balio kendu duen esaten dizu, hori
   ere desegin nahi baduzu.
6. Ekitaldia administratzen duenak desadostasun bat ebazten du
   `/resolve <posizioa> <balioa>` bidez — edo, `/resolve <posizioa>`
   soilik idatzita, botak posizio horretarako jakinarazitako balioak
   zerrendatzen ditu, bakoitza zenbat jendek babesten duen adieraziz —
   eta, babes horietako bat fidagarria bada, zenbat diren — eta balio
   bakoitzeko botoi bat erakusten du (gehien babestua lehenengo) sakatuz
   ebazteko. `/resolve` bakarrik, argumenturik gabe idaztea,
   desadostasunean dauden posizio guztiak banan-banan errepasatzen du
   horren ordez: erakusten dena bere botoiekin ebaztean, botak berehala
   bidaltzen du hurrengoa, bat ere geratzen ez den arte. Ohar horrek ez
   du inoiz ekitaldia isteko lasterbiderik eskaintzen, une horretan
   posizio guztiek jada balio ezarri bat izan arren — jakinarazten
   dutenak elkarren artean ados egotea ez da pasakodeak benetan
   funtzionatzearen gauza bera, beraz botak administratzailea
   `/verify`-ra bidaltzen du (ikus behean). Ekitaldia administratzen
   duenak partaide bat fidagarritzat edo troll gisa ere marka dezake
   behar izanez gero. Norbait troll gisa markatzeak, ekitaldi horretarako
   bakarrik, haren gainerako ekarpenak baztertzen ditu eta eguneraketak
   bidaltzeari uzten dio — ez du azken pasakodea ere jasoko ekitaldia
   itxi denean.

   Desadostasunean posizio gutxi geratzen direnean, azkarragoa izan
   daiteke jokoaren trukatze-pantailan errenderizatutako
   pasakode-blokeetako batzuk zuzenean probatzea. Horietako bat han
   zuzentzat berresten denean, ekitaldia administratzen duenak `/verify
   <passcode>` bidez itsasten du berriro, eta botak posizio guztientzat
   batera aurkitzen du zein jakinarazitako balio sortu duen.
7. `/verify <passcode>` ekitaldi bat osatu eta ixteko modu bakarra da —
   ez dago "isteko" komando bereizirik. Posizio guztiak jada bat etorri
   arren, adostasun hori ez da jokoaren aurka egiaztatu, beraz
   administratzaileak pasakode hautagai bat kopiatu, dendan itsatsi,
   onartzen dela berretsi, eta pasakode hori bera `/verify`-n itsatsi
   behar du. Bat datorrenean, botak posizio guztiak hortik ebazten ditu
   eta azken pasakodea mezu berri gisa bidaltzen die partaide guztiei —
   edizio bat bakarrik ez —, inori ez zaion ihes egin diezaion, aktiboki
   jarraitu ez badu ere.

### Komandoen erreferentzia

| Komandoa | Nork erabil dezake | Zer egiten du |
|---|---|---|
| `/start`, `/help` | edonork | Sarrera eta komandoen zerrenda. |
| `/language <kodea>` | edonork | Zure hizkuntza ezartzen du (`en`, `ca`, `es`, `fr`, `gl`, `eu`). |
| `/newevent <izena> [\| <eredua>]` | edonork | IFS ekitaldi berri bat sortzen du eta bere batzeko kodea ematen dizu; automatikoki batzen zaitu eta fidagarritzat markatzen zaitu. Hemen `\|`-k izena eta eredua bereizten ditu, ez du "bata edo bestea aukeratu" esan nahi — adib. `/newevent Barcelona 2026-08 \| XXX99*999XX`. Zure uneko ekitaldia oraindik ebatzi gabe badago, lehenik berrespena eskatzen du (ezetz esateak ez du ezer sortzen); hura lehenik lagatzen da, `/leave`-k egingo lukeen bezala. |
| `/sharetext [kodea] [hizkuntza]` | edonork | Batzera gonbidatzeko partekatzeko prest dagoen testua lortzen du. `kodea`-ren lehenetsia zure uneko ekitaldia da, `hizkuntza`-rena zeurea — jada automatikoki behin bidalia `/newevent`-etik. |
| `/join <kodea>` | edonork | Ekitaldi batera batzen zaitu — zure uneko ekitaldia oraindik ebatzi gabe badago bakarrik eskatzen du berrespena, administratzen bazenuen lagatuz; ez du ezer eskatzen bat ere ez baduzu edo jada itxita badago. Administratzailerik gabe itxitako kode bat zure kargura berrirekitzen da, ukatu ordez. |
| `/leave` | partaidea | Uneko ekitaldia uzten du. Administratzailea bazara, beste partaide batek automatikoki hartzen du rola (lehenik fidagarriak, bestela gehien ekarri duena), edo ekitaldia amaitu gabe ixten da inor egokirik ez badago — beste ekitaldi bat sortu edo horretara batuz irtenez gero `/leave` egin ordez, lagapen bera gertatzen da. |
| `/current` | edonork | Uneko ekitaldia erakusten du: izena, kodea, eredua, partaide kopurua eta nork administratzen duen. |
| `<posizioa> <balioa>` (edo `/submit <posizioa> <balioa>`) | partaidea | Posizio batean aurkitutako balioa jakinarazten du. |
| `<posizioa>` bakarrik (edo `/submit <posizioa>`) | partaidea | Posizio horretan zure jakinarazpena kentzen du, badago. |
| `/status` | partaidea | Pasakodearen uneko egoera nahi duzunean erakusten du; gainera, hurrengo zuzeneko eguneraketak mezu berri honetara lekualdatzen ditu, aurrekoa elkarrizketan gora asko igo bada. |
| `/resolve <posizioa> [<balioa \| @erabiltzailea>]` | ekitaldiaren administratzailea | Desadostasuna dagoenean balio zuzena aukeratzen du; balio gabe, jakinarazitako balioak (fidagarrien babes-banaketarekin) botoi gisa zerrendatzen ditu, ebazteko. |
| `/resolve` (argumenturik gabe) | ekitaldiaren administratzailea | Desadostasunean dauden posizio guztiak banan-banan errepasatzen ditu; bat ere geratzen ez denean, `/verify` aholkatzen du — adostasunak berak ez du inoiz ekitaldia ixten. |
| `/unresolve <posizioa>` | ekitaldiaren administratzailea | Ebatzitako posizio bat berrirekitzen du. |
| `/trust <erabiltzailea>` | ekitaldiaren administratzailea | Partaide bat fidagarritzat markatzen du, haren babesa `/resolve`-ren hautagai-zerrendan azpimarra dadin. |
| `/troll <erabiltzailea>` | ekitaldiaren administratzailea | Partaide baten ekarpenak baztertzen ditu eta eguneratzeari uzten dio (ekitaldi honetan bakarrik). |
| `/untrust <erabiltzailea>` | ekitaldiaren administratzailea | Partaide bati fidagarritasun-marka kentzen dio; troll gisa markatuta bazegoen, egoera-mezua ere bat-batean eguneratzen dio. |
| `/kick <erabiltzailea>` | ekitaldiaren administratzailea | Partaide bat ekitaldiatik kanporatzen du. |
| `/promote <erabiltzailea>` | ekitaldiaren administratzailea | Administratzaile rola ekitaldian jada dagoen beste partaide bati ematen dio; fidagarritzat ere markatzen du, `/newevent`-ek bere administratzailearekin egiten duen bezala. |
| `/claim` | partaidea | Unekoa 30+ minutu inaktibo egon bada, administratzaile kargua hartzen saiatzen da; 5 minutu ditu onartzeko, ukatzeko edo ez erantzuteko, hori gauzatu aurretik. |
| `/verify <passcode>` | ekitaldiaren administratzailea | Ekitaldi bat ixteko modu bakarra: jokoaren trukatze-pantailan zuzentzat berretsi den pasakode bat itsasten du; hortik posizio guztiak batera ebazten ditu, ekitaldia izoztu eta azken pasakodea guztiei iragartzen die. |
| `/events` | edonork | Parte hartu duzun ekitaldi guztiak zerrendatzen ditu, unekoak zein iraganekoak. |

Jokalari bakoitzak botaren mezuak bere hizkuntzan ikusten ditu,
`/language` bidez behin ezarrita eta hortik aurrera gogoratuta.

## Proiektuaren egoera

**Martxan**, [`@ifs_relay_bot`](https://t.me/ifs_relay_bot) izenarekin
Telegramen. Goian deskribatutako komando guztiak inplementatuta eta
zabalduta daude. Ikusi [`CLAUDE.md`](CLAUDE.md) (ingelesez) diseinu
tekniko osorako (datu-eredua, gatazkak ebazteko algoritmoa,
internazionalizazio-arkitektura) laguntzeko asmoa baduzu.

## Arkitektura

- **Runtime:** Cloudflare Workers, Telegramen eguneraketak webhook bidez
  jasoz.
- **Boten framework-a:** [grammY](https://grammy.dev).
- **Datu-basea:** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Hizkuntza:** TypeScript.
- **Domeinua:** `ifspasscoderelay.grifwl.blue`.

## Instalazio-gida

Hauek boten azpiegitura behin bakarrik jasotzeko urratsak dira —
proiektu osorako behin, ez IFS bakoitzeko behin. 1, 3 eta 4 urratsek ez
dute aplikazioaren kodea existitzea eskatzen; 2 eta 5 urratsek Worker
bat zabaldua behar dute, beraz azkenean joaten dira, inplementazioa hasi
ondoren.

### 1. Sortu Telegram bota

1. Ireki elkarrizketa bat [@BotFather](https://t.me/BotFather)-ekin
   Telegramen.
2. Bidali `/newbot`, aukeratu erakusteko izen bat eta `bot`-ez amaitzen
   den erabiltzaile-izen bakarra (adib. `IfsPasscodeRelayBot`).
3. BotFather-ek **bot-token** batekin erantzuten du — tratatu pasahitz
   bat bezala (izan dezakeen edonork botaren izenean mezuak bidal
   ditzake). 4. urratsean Cloudflare-ko sekretu gisa gordetzen da; ez da
   inoiz biltegi honetara igotzen.
4. BotFather-ekin hitz egiten jarraituz, konfiguratu botaren profil
   publikoa:
   - `/setuserpic` — igo profil-argazki bat.
   - `/setdescription` — inork oraindik harekin hitz egin ez duen
     txataren pantaila hutsean erakusten den deskribapen luzea.
   - `/setabouttext` — profil-orriaren biografia laburra.
   - `/setjoingroups` → *Disable*. Bota banakako txat pribatuetarako
     pentsatuta dago — partaide bakoitzaren zuzeneko egoera-mezua
     lekuan bertan editatzen da, eta horrek zentzua du bakarrik harekin
     eta botarekin soilik dagoen txat batean — beraz talde-erabilera
     desaktibatuta geratzen da.

   Ez da `/setcommands` behar: botak bere komando-zerrenda kodetik
   zuzenean erregistratzen du, Bot APIaren `setMyCommands` bidez, beraz
   Telegramek automatikoki erakusten ditu autobetetze-iradokizunak eta
   ezin dira inoiz BotFather-en eskuz mantendutako zerrenda batetik
   desinkronizatu.

#### Deskribapen eta "about" testu iradokiak

Ezarri lehenengo ingelesezko bertsioa `/setdescription` eta
`/setabouttext` bidez — hori da BotFather-ek erabiltzen duena euren
itzulpenik ez duen Telegram bezero-hizkuntza guztietarako. Ondoren, menu
berdinetatik, gehitu beheko `ca`/`es`/`fr`/`gl`/`eu` bertsioak
hizkuntzako deskribapen gisa.

| Hizkuntza | `/setdescription` (luzea) | `/setabouttext` (laburra) |
|---|---|---|
| `en` | Collaboratively build your Ingress First Saturday event's redeemable passcode in real time. Report the character you found and its position — the bot keeps everyone's passcode in sync, flags disagreements, and announces the final result. Available in English, Català, Castellano, Français, Galego and Euskara. Send /help to start, or /newevent to create one for your IFS. | Real-time collaborative passcode relay for Ingress First Saturday events. |
| `ca` | Construeix en temps real, de manera col·laborativa, el passcode bescanviable del teu esdeveniment Ingress First Saturday. Reporta el caràcter que has trobat i la seva posició — el bot manté el passcode sincronitzat per a tothom, marca les discrepàncies i anuncia el resultat final. Disponible en català, anglès, castellà, francès, gallec i basc. Envia /help per començar, o /newevent per crear-ne un pel teu IFS. | Relleu col·laboratiu en temps real del passcode d'un Ingress First Saturday. |
| `es` | Construye en tiempo real, de forma colaborativa, el passcode canjeable de tu evento Ingress First Saturday. Reporta el carácter que has encontrado y su posición — el bot mantiene el passcode sincronizado para todos, marca las discrepancias y anuncia el resultado final. Disponible en español, inglés, catalán, francés, gallego y euskera. Envía /help para empezar, o /newevent para crear uno para tu IFS. | Relevo colaborativo en tiempo real del passcode de un Ingress First Saturday. |
| `fr` | Construisez en temps réel, de façon collaborative, le passcode échangeable de votre événement Ingress First Saturday. Signalez le caractère trouvé et sa position — le bot garde le passcode synchronisé pour tout le monde, signale les désaccords et annonce le résultat final. Disponible en français, anglais, catalan, espagnol, galicien et basque. Envoyez /help pour commencer, ou /newevent pour en créer un pour votre IFS. | Relais collaboratif en temps réel du passcode d'un Ingress First Saturday. |
| `gl` | Constrúe en tempo real, de forma colaborativa, o passcode canxeable do teu evento Ingress First Saturday. Reporta o carácter que atopaches e a súa posición — o bot mantén o passcode sincronizado para todos, marca as discrepancias e anuncia o resultado final. Dispoñible en galego, inglés, catalán, castelán, francés e éuscaro. Envía /help para empezar, ou /newevent para crear un para o teu IFS. | Relevo colaborativo en tempo real do passcode dun Ingress First Saturday. |
| `eu` | Osatu denbora errealean, elkarlanean, zure Ingress First Saturday ekitaldiaren pasakode kanjeagarria. Jakinarazi aurkitu duzun karakterea eta bere posizioa — botak guztien pasakodea sinkronizatuta mantentzen du, desadostasunak markatzen ditu eta azken emaitza iragartzen du. Euskaraz, ingelesez, katalanez, gaztelaniaz, frantsesez eta galizieraz eskuragarri. Bidali /help hasteko, edo /newevent zure IFS-rako bat sortzeko. | Ingress First Saturday ekitaldien pasakode-errelebo kolaboratiboa, denbora errealean. |

### 2. Sortu Cloudflare Worker-a eta D1 datu-basea

Jada gehitutako `grifwl.blue` zona duen Cloudflare kontu bat eta
[wrangler](https://developers.cloudflare.com/workers/wrangler/)
instalatuta behar ditu (`npm install -g wrangler`, edo `npx wrangler`
erabili).

1. `wrangler login` CLI autentifikatzeko.
2. `wrangler d1 create ifs-passcode-relay`-k D1 datu-basea sortzen du
   eta `database_id` bat erakusten du — gorde ezazu, kodea existitu
   ondoren `wrangler.toml`-eko `[[d1_databases]]` binding-era joango da
   (`DB` izenarekin).
3. Aplikazioaren eskeletoa existitu bezain laster, `wrangler deploy`-k
   Worker-a lehen aldiz argitaratzen du.

### 3. Esleitu azpi-domeinua

Bota **`ifspasscoderelay.grifwl.blue`**-n bizi da. `grifwl.blue` zona
zabaltzeko erabiltzen den Cloudflare kontu berean dagoenez, ez da
panelean eskuzko urratsik behar — zuzenean [Custom
Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
gisa deklaratzen da `wrangler.toml`-en:

```toml
routes = [
  { pattern = "ifspasscoderelay.grifwl.blue", custom_domain = true }
]
```

`wrangler deploy`-k orduan automatikoki hornitzen ditu DNS erregistroa
eta TLS ziurtagiria. Panela alternatiba gisa bakarrik behar da zonak
inoiz eskuzko arreta behar badu (adib. `wrangler` saioa hasita duen
kontutik ezberdin den Cloudflare kontu batean bizi dela ateratzen bada).

### 4. Argitaratu bot-tokena sekretu gisa

1. `wrangler secret put BOT_TOKEN` eta itsatsi 1. urratseko tokena
   eskatzen denean — honek Cloudflaren zifratuta gordetzen du,
   Worker-ari `env.BOT_TOKEN` gisa erakutsita, eta ez da inoiz
   biltegira igotzen.
2. Garapen lokalerako, jarri balio bera `.dev.vars`-en (jada git-etik
   kanpo) `BOT_TOKEN=...` gisa.
3. Sortu ere kate aleatorio bat webhook-aren sekretu gisa erabiltzeko
   (adib. `openssl rand -hex 32`) eta gorde modu berean,
   `TELEGRAM_WEBHOOK_SECRET` gisa — Worker-ak Telegramendik benetan
   datorren eskaera bat ez den edozein baztertzeko erabiltzen du (ikus
   5. urratsa).

### 5. Zuzendu Telegram Worker-erantz (webhook)

Worker-a zabaldu eta bere URL publikoan eskuragarri dagoenean:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ifspasscoderelay.grifwl.blue/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Telegramek orduan sekretu bera bidaltzen duen eguneraketa bakoitzaren
`X-Telegram-Bot-Api-Secret-Token` goiburuan sartuko du; Worker-ak bat
datorrela egiaztatu behar du ezer prozesatu aurretik, eta bestela
eskaera baztertu — horrek eragozten du beste edonork webhook-aren URL
publikora eguneraketa faltsurik bidaltzea. Egiaztatu webhook-a
erregistratuta dagoela honekin:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### 6. Konfiguratu administrazio-panel pribatua

Irakurtzeko soilik den panel pribatu bat dago `/admin`-en (adib.
`https://ifspasscoderelay.grifwl.blue/admin`), D1-eko datu zuzenak
`wrangler d1 execute` saio interaktiborik ireki gabe ikuskatzeko.
Pasahitz batez babestuta dago, eta ekitaldi zehatz bati dagozkion
datuak (partaideak, jakinarazpenak, hautagaiak, ebazpenak,
fidagarritasun-markak, `/claim` negoziazioak) goitibeherako batetik bat
aukeratu ondoren bakarrik erakusten dira — taula orokorrak (ekitaldiak,
erabiltzaileak, hitz ezagunak, zain dauden ekitaldi-sorrerak) beti
ikusgai daude. Ezerk ez du bere kabuz eguneratzen: ikuspegi bakoitza
azkenekoz kargatu edo eguneratu zenuen unearen argazki bat da, nahi
duzunean berriro kontsultatzeko eguneratze-botoi eskuzko batekin.

1. Sortu pasahitz bat eta bere saio-cookieetarako sinatze-gako aleatorio
   bereizi bat (adib. `openssl rand -hex 24` pasahitzarako, `openssl
   rand -hex 32` gakoerako), eta argitaratu biak bot-tokenaren modu
   berean: `wrangler secret put ADMIN_DASHBOARD_PASSWORD` eta `wrangler
   secret put ADMIN_SESSION_SECRET`.
2. Garapen lokalerako, gehitu bi balio berdinak `.dev.vars`-i
   `ADMIN_DASHBOARD_PASSWORD=...` eta `ADMIN_SESSION_SECRET=...` gisa.

## Lizentzia

MIT.
