# Pla de proves manuals amb usuaris reals

Aquest document defineix un pla de proves per validar **totes** les
comandes i **tots** els fluxos descrits a `CLAUDE.md`, fent servir comptes
reals de Telegram contra el bot desplegat (`@ifs_relay_bot`). No és una
suite automatitzada: és un guió pas a pas perquè un grup de persones el
segueixi en directe.

Els participants es refereixen sempre com **Agent A**, **Agent B**,
**Agent C** i **Agent D** — cadascun és una persona diferent amb el seu
propi compte de Telegram (comptes diferents, no xats diferents del mateix
compte, perquè el bot identifica per `user_id` de Telegram).

**Patrons usats en aquest pla:** només dos, en cap cas patrons amb més
d'un slot de paraula (`*`):

- El **per defecte**: `XXX99*999XX`.
- Un d'**invertit** (lletres i dígits intercanviats posició a posició,
  mantenint la paraula al centre, posició 6): `999XX*XXX99`.

Per aquest motiu, l'escenari de `/verify` amb **més d'una combinació
coincident** (que, segons `CLAUDE.md`, només és possible amb un patró de
dos o més slots `*`) queda **deliberadament fora d'abast** d'aquest pla.
És l'única branca de comportament documentada a `CLAUDE.md` que aquest
guió no exercita.

## Nombre mínim de participants: 4

No n'hi ha prou amb 2 o 3. Les proves de successió d'administrador
(`/leave` sense `/promote` previ) necessiten, **en un mateix moment**,
quatre rols simultanis i diferenciats dins del mateix esdeveniment:

1. Qui marxa i era l'administrador (**A**).
2. Un participant marcat `trusted` amb **poques** aportacions.
3. Un participant **no marcat** (neutral) amb **més** aportacions que
   l'anterior — per confirmar que "trusted" guanya igualment.
4. Un participant marcat `troll` amb **encara més** aportacions que els
   altres dos — per confirmar que queda exclòs del càlcul malgrat tenir
   el nombre més alt de contribucions.

Amb només 3 persones no es pot aïllar alhora l'efecte de "trusted preval
sobre troll amb més aportacions" i "troll queda exclòs encara que
guanyaria per aportacions". Per tant, **4 agents és el mínim real**. Els
rols de C i D es reassignen a cada esdeveniment (la confiança és pròpia
de cada esdeveniment, es reinicia sola en crear-ne un de nou), així que
no calen més de 4 persones en tot el pla, ni tan sols per a les proves
de `/claim` (que necessiten com a mínim 2 aspirants a més de
l'administrador — cobert per B i C).

Si el grup només té 2 o 3 persones disponibles, es pot fer una passada
reduïda saltant-se la Fase 7 (successió amb desempat/exclusió de troll) i
la part de `/claim` amb pool de més d'un aspirant — però aleshores **no**
es cobreixen totes les comandes en tots els escenaris.

## Preparació prèvia

- Els 4 comptes de Telegram han de ser nous per al bot (o cal fer
  `/leave` de qualsevol esdeveniment previ abans de començar) per no
  arrossegar estat d'una prova anterior.
- Cada agent hauria de tenir el client de Telegram en un idioma diferent
  del navegador/sistema per poder comprovar que `language_code` es
  detecta bé la primera vegada (opcional, però aprofita per provar la
  detecció automàtica descrita a Internacionalització).
- Algú ha d'anar prenent nota de qui fa `/verify` amb quin passcode, per
  no perdre el fil — les paraules dels slots `*` es couen entre els
  mateixos agents, així que cal apuntar-les en algun lloc fora del bot
  (paper, xat extern) tal com passaria en un IFS real.

### Buidar la base de dades abans i després de les proves

El projecte inclou `scripts/reset-db.sql`, pensat exactament per a
això: esborra totes les files de totes les taules (incloent-hi les de
`/claim`) i reinicia els comptadors `AUTOINCREMENT`, de manera que els
primers esdeveniments que es creïn després tornen a tenir `id` 1, 2,
3... Ja hi ha una comanda `npm` que l'executa contra la base de dades
real que fa servir `@ifs_relay_bot`:

```bash
npm run db:reset:remote
```

**Abans de començar** les proves cal executar-la un cop, perquè el
grup comenci amb la base de dades completament buida. Com que la
taula `users` també queda buida, cada agent haurà de tornar a enviar
`/start` fins i tot si ja havia fet servir el bot abans — això, de
pas, permet que la Fase 0 (detecció d'idioma) es provi sempre des de
zero.

**En acabar** les proves cal tornar a executar exactament la mateixa
comanda, per deixar la base tal com estava abans de la sessió, sense
cap dels esdeveniments, usuaris ni reports generats durant les proves.

Si en algun moment cal provar contra la rèplica local de
`wrangler dev` en lloc del bot desplegat, la comanda equivalent és
`npm run db:reset:local`.

### Dashboard local de seguiment (opcional)

`npm run testing:dashboard` aixeca, només en local (mai desplegat), una
pàgina a `http://localhost:4173` que fa polling contra la D1 **real**
i guia el grup pas a pas per aquest document: mostra la comanda exacta
a copiar per a l'agent que toqui (pensada per enganxar-la al xat del
Meet perquè cadascú la reenganxi al seu Telegram), el canvi de base de
dades que s'hi espera i, sota, el contingut sencer de totes les taules
en viu. Quan el canvi arriba a D1 avança sol al pas següent; els passos
que no deixen cap rastre a la base (contingut d'un missatge, botons,
etc.) cal marcar-los manualment amb "Fet ✅" un cop comprovats a
Telegram. Cal indicar-hi primer, al capdamunt, l'`@usuari` de Telegram
(o el `user_id`, visible a la taula `users` un cop hagi fet `/start`)
de cadascun dels agents A/B/C/D perquè pugui identificar qui és qui.

Cobreix totes les Fases 0-12.

### Simular inactivitat de l'administrador (sense esperar)

`/claim` exigeix 30 minuts d'inactivitat de l'administrador abans de
poder-se invocar, i dona fins a 5 minuts de marge de resposta un cop
oberta la negociació. En lloc d'esperar aquests temps reals, es pot
alterar directament la base de dades D1 amb `wrangler d1 execute`. El
bot desplegat només escriu contra la base **remota** (el binding `DB`
declarat a `wrangler.toml`, base de dades `ifs-passcode-relay`) — no hi
ha cap `wrangler dev` pel mig quan es prova contra `@ifs_relay_bot`
real —, així que cal fer servir sempre `--remote`:

```bash
# Fer que l'administrador de qualsevol esdeveniment actiu aparegui com
# si portés 31 minuts sense interactuar amb el bot:
npx wrangler d1 execute ifs-passcode-relay --remote --command "UPDATE participants SET last_active_at = datetime('now', '-31 minutes') WHERE user_id IN (SELECT admin_user_id FROM events WHERE status = 'active');"
```

```bash
# Un cop oberta la negociació (després del primer /claim vàlid), fer
# que sembli que ja han passat els 5 minuts de marge de resposta a
# qualsevol negociació oberta:
npx wrangler d1 execute ifs-passcode-relay --remote --command "UPDATE admin_claims SET initiated_at = datetime('now', '-6 minutes');"
```

Aquestes dues comandes són genèriques a propòsit — no cal indicar-hi
cap codi d'esdeveniment ni identificador de Telegram — perquè durant
una sessió de proves no hi ha cap esdeveniment real en curs: la
primera afecta l'administrador de **tots** els esdeveniments actius en
aquell moment, i la segona, totes les negociacions de `/claim`
obertes en aquell moment. Si mai s'executessin amb esdeveniments reals
d'un IFS en marxa, caldria tornar a restringir-les per `event_id`
perquè no n'afectessin l'administrador real.

Aquesta és la manera amb què es fa la Fase 9 en aquest pla — **no cal
esperar cap dels dos temps reals** en cap moment.

## Resum d'esdeveniments a crear

| # | Nom suggerit | Patró | Objectiu principal |
|---|---|---|---|
| 1 | `Proves Principal` | per defecte (`XXX99*999XX`) | Flux complet: submit, resolve, trust, kick, promote, verify amb match únic (queda `abandoned` a la Fase 7a.2 quan tothom se'n va a l'Event 2; es revifa a la Fase 10.1) |
| 2 | `Proves Successio A` | per defecte | `/leave` — trusted preval per sobre d'aportacions |
| 3 | `Proves Successio B` | per defecte | `/leave` — empat + exclusió de troll amb més aportacions |
| 4 | `Proves Abandonat A` | per defecte | `/leave` sense ningú elegible (tothom troll) |
| 5 | `Proves Abandonat B` | per defecte | `/leave` sense ningú més a l'esdeveniment |
| 6 | `Proves Claim Keep` | per defecte | `/claim` — l'administrador prem "Mantenir el rol" |
| 7 | `Proves Claim Handover` | per defecte | `/claim` — l'administrador prem "Cedir el rol", amb pool de 2 aspirants |
| 8 | `Proves Claim Timeout` | per defecte | `/claim` — sense resposta, resolució per temps + condició de cursa |
| 9 | `Proves Patró Invertit` | `999XX*XXX99` | Comprova el patró invertit (tipus intercanviats) i, sobre aquest mateix esdeveniment, el límit de 16 variants a `/status` i el límit de seguretat (2000) a `/verify` |

Es creen en l'ordre en què apareixen a les Fases 7-11 — no és arbitrari:
com que cap agent fa mai `/leave` explícit entre un esdeveniment i el
següent a partir de la Fase 7, qui crea o s'uneix a cadascun encara
pertany a l'anterior, i això dispara les confirmacions i successions
descrites a cada fase (vegeu la nota a l'inici de la Fase 7).

---

## FASE 0 — Onboarding individual (cada agent, per separat)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 0.1 | A, B, C, D | Enviar `/start` | Missatge de benvinguda en l'idioma detectat automàticament del client de Telegram (`en`/`ca`/`es`/`fr`/`gl`/`eu`, o `en` si no és cap d'aquests) |
| 0.2 | A, B, C, D | Enviar `/help` | Llista de comandes disponibles, en el mateix idioma |
| 0.3 | A, B, C, D | Enviar `/language xx`, on `xx` és un idioma diferent del que cada agent ja tenia detectat al pas 0.1 — triant, entre els 4 agents, una combinació de 4 idiomes diferents entre si d'entre els 6 suportats (`en`/`ca`/`es`/`fr`/`gl`/`eu`) sempre que sigui possible | Confirmació en el **nou** idioma; els missatges ja enviats no canvien |
| 0.4 | A; després A, B, C, D | Repetir `/language` amb un codi no suportat (p. ex. `/language de`); tot seguit, cadascú estableix amb `/language <codi>` l'idioma amb què vol continuar la resta de les proves | Codi no suportat: missatge d'error / ús, sense canviar l'idioma actual. Idioma final: cadascú pot quedar-se amb el del pas 0.3, tornar al seu original (pas 0.1), o triar-ne un altre — incloent-hi no fer res, per mantenir el del pas 0.3 |
| 0.5 | A, B, C, D | Enviar `/current` sense estar en cap esdeveniment | Missatge indicant que no es pertany a cap esdeveniment |
| 0.6 | A, B, C, D | Enviar `/events` sense haver participat mai en cap esdeveniment | Llista buida amb el missatge corresponent — l'única finestra de tot aquest pla en què **cap** dels quatre agents hi ha participat encara; a partir de la Fase 1 tots quatre en van acumulant (vegeu Fase 12), així que aquest és l'únic moment on es pot comprovar el cas buit |

Per triar la combinació del pas 0.3 (a mà, sense el dashboard): cada `xx` ha de ser diferent del que l'agent ja tenia; si els 4 agents no tenen tots exactament el mateix idioma de partida, es pot repartir 4 dels 6 idiomes suportats, un per agent (p. ex. amb una rotació cíclica: qui tenia `ca` passa a `es`, qui tenia `es` passa a `fr`, etc.); si els 4 ja coincidien exactament en el mateix idioma, no hi ha cap combinació que cobreixi 4 idiomes diferents — n'hi ha prou que cadascú trïi qualsevol altre. El dashboard (vegeu més avall) ho calcula i ho mostra automàticament.

---

## FASE 1 — Creació de l'esdeveniment principal i share text (Event 1)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 1.1 | A | `/newevent Proves Principal` (sense patró) | Es crea l'esdeveniment amb el patró per defecte `XXX99*999XX`; **abans** d'unir-s'hi s'envia automàticament el text per compartir (bloc + esment del bot + codi), en dos missatges separats (bloc + nota en cursiva amb botons d'idioma) |
| 1.2 | A | Comprovar els botons EN/CA/ES/FR del segon missatge | Només apareixen els idiomes **diferents** de l'actual d'A, tots en una sola fila |
| 1.3 | A | Prémer un dels botons d'idioma (p. ex. `ES`) | S'envia un **nou** parell de missatges (bloc + nota), ara en espanyol, i el botó `ES` ja no hi surt (n'hi ha 3 dels altres idiomes) |
| 1.4 | A | `/current` | Mostra el nom, el codi, el patró, 1 participant i A com a administrador actual (marcat "(tu)") |
| 1.5 | A | `/newevent Proves Principal` (mateix nom, un altre cop) i confirmar amb **Sí** que vol deixar Event 1 | Com que A encara és a Event 1 i aquest segueix actiu/sense resoldre, `/newevent` demana confirmació abans de crear res (vegeu CLAUDE.md "Succession on leaving an event") — provar també de respondre que **no** primer en un assaig i comprovar que llavors **no es crea cap esdeveniment nou**, abans de tornar-ho a fer confirmant que sí. En confirmar, es crea un **segon** esdeveniment nou amb un codi diferent (el nom duplicat no és un conflicte, confirma que `name` no és únic); anotar aquest codi com a "Event 1b" — es fa servir a la Fase 2. Com que `/newevent` també uneix el creador com a participant (vegeu Fase 1.1), això trasllada A cap a Event 1b. Com que A n'era l'administrador d'Event 1 i aquest encara no té cap altre participant (la Fase 2 encara no ha començat), aquest traspàs dispara la successió: com que no hi ha ningú a qui cedir el rol, **Event 1 queda tancat com a `abandoned`** i A en rep avís explícit |
| 1.6 | A | `/sharetext` (sense arguments) | Regenera el text per al codi de l'esdeveniment **actual** d'A (ara Event 1b), en el seu idioma actual |
| 1.7 | A | `/sharetext <codi> fr` | Regenera el text per a aquell codi concret en francès, independentment de l'idioma actual d'A |
| 1.8 | A | Provar `/newevent` amb un patró invàlid, p. ex. `/newevent Proves X | XY1` | Rebutjat (el patró només admet `X`, `9`, `*`) |
| 1.9 | A | `/join <codi Event 1>` i confirmar amb **Sí** el canvi que es proposa | Com que Event 1 està tancat com a `abandoned` (pas 1.5), el codi el **reviu** en comptes de rebutjar-lo (vegeu CLAUDE.md "Reviving an abandoned event"): es reobre (`status = active`, `closed_reason = NULL`) i A en torna a ser l'administrador (marcat `trusted`, com faria `/newevent`). El diàleg de confirmació ho indica explícitament (avisa que reobrirà l'esdeveniment i et farà administrador/a) — nota: com que Event 1 i Event 1b tenen el mateix nom (pas 1.5), el diàleg mostrarà el mateix nom a banda i banda, això és esperat. Com que A n'era també l'administrador d'Event 1b i hi queda sense cap altre participant, aquest canvi tanca Event 1b com a `abandoned` pel mateix motiu — és inofensiu, ja no es fa servir. Aquest és l'únic pas d'aquest pla que **accepta** (Sí) un canvi d'esdeveniment; la 2.5 en prova el rebuig (No) |

---

## FASE 2 — Unir-se i primeres comandes

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 2.1 | B | `/join <codi Event 1>` | S'uneix; rep un missatge d'estat en viu (guarda `status_message_id`) i el nudge cap a `/sharetext` (sense codi ni idioma) |
| 2.2 | C | `/join <codi Event 1>` | Igual que B |
| 2.3 | D | `/join <codi Event 1>` | Igual que B |
| 2.4 | B | `/join <codi inexistent>` | Error de codi no trobat, sense afectar l'esdeveniment actual de B |
| 2.5 | B | `/join <codi Event 1b>` (el duplicat de la Fase 1.5) | Com que Event 1b ja està tancat com a `abandoned` (efecte secundari del pas 1.9), la confirmació que es dispara és la variant que avisa que acceptar-la el reviuria i el faria administrador (vegeu 1.9) — respondre que **no** i confirmar que B segueix a Event 1, sense que Event 1b es reobri |
| 2.6 | A, B, C, D | `/current` | Tots quatre veuen 4 participants i A com a administrador actual; només A hi veu el marcador "(tu)" |

---

## FASE 3 — Enviament de posicions

Pattern de referència: `XXX99*999XX` → posicions 1-3 lletres, 4-5
dígits, 6 paraula, 7-9 dígits, 10-11 lletres.

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 3.1 | B | `1 A` (forma curta, sense `/submit`) | Acceptat sense confirmació (ningú més ho ha reportat encara) |
| 3.2 | B | `1 A` (repetir exactament el mateix) | Resposta de no-op curta; no s'escriu res nou |
| 3.3 | B | `1 B` (canviar el seu propi valor a la posició 1) | Autocorrecció: sense confirmació, s'esborra el report anterior de B i es desa el nou; l'acusament de rebut esmenta **tots dos** valors (nou i antic) |
| 3.4 | B | `1` (posició sola, sense valor) | Elimina el report actual de B a la posició 1; el missatge confirma quin valor s'ha tret |
| 3.5 | B | `1` una altra vegada (ja no en té cap) | El bot indica que B no tenia cap report en aquesta posició |
| 3.6 | B | `/submit 2 K` | Equivalent explícit a `2 K`; acceptat |
| 3.7 | C | `2 Z` (valor **diferent** al de B per a la mateixa posició), confirmant amb **Sí** quan es dispari la confirmació Sí/No ("aquesta posició ja té un valor diferent d'un altre agent") | S'afegeix `Z` com a candidat addicional a la posició 2 (no substitueix el de B); ara la posició 2 té 2 candidats |
| 3.8 | D | `2 Z` (mateix valor que C, però D encara no havia reportat res allà) | **No** hi ha confirmació per desacord (coincideix amb un candidat existent), s'afegeix D com a suport addicional del mateix candidat `Z` |
| 3.9 | C | `4 X` (posició 4 és un dígit segons el patró, `X` no ho és), confirmant amb **No** | Es dispara la confirmació Sí/No pel *tipus* (soft-check); en confirmar amb No, res es desa i `4` segueix sense report de C |
| 3.10 | C | `4 X` una altra vegada, ara confirmar amb **Sí** | S'accepta igualment, malgrat no encaixar amb el tipus esperat de la posició |
| 3.11 | B | `4 Y` (lletra diferent tant de `X` —la de C— com del tipus esperat) | El missatge de confirmació esmenta **totes dues** condicions alhora (desacord amb C i tipus incorrecte) |
| 3.12 | B, C, D | Cadascú envia, un missatge per posició: `5 7`, `6 GLYPH`, `7 3`, `8 4`, `9 5`, `10 Q`, `11 R` (els mateixos valors els tres, sense desacord) | Cada posició queda amb un únic candidat, suportat pels tres; deixa **una** posició encara en conflicte (la 2, ja treballada a 3.7/3.8) per a la Fase 4 — la posició 9 es reobrirà deliberadament a la Fase 4.10 quan C hi canviï de valor |

---

## FASE 4 — `/status`, `/resolve`, `/unresolve`

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 4.1 | A | `/status` | Mostra el progrés i totes les combinacions possibles del passcode com a blocs monoespaiats, cadascun amb el recompte de suports; com que només hi ha una posició en conflicte (2 candidats), hi ha 2 combinacions, per sota del límit de 16 |
| 4.2 | B | `/status` una altra vegada | Es reenvia com a missatge **nou** i `status_message_id` de B queda repuntat cap a aquest; les properes actualitzacions en viu editaran aquest nou missatge, no l'antic |
| 4.3 | A | `/resolve 2` (sense valor) | Llista els candidats de la posició 2 (p. ex. `K` amb 1 suport, `Z` amb 2 suports) amb un botó per candidat, en ordre de més a menys suportat; com que A és `trusted` per defecte i no ha reportat aquí, cap candidat mostra desglossament de confiança encara |
| 4.4 | A | `/trust B` abans de continuar (avançant una mica la Fase 5) i tornar a `/resolve 2` | Ara el candidat suportat per B mostra el desglossament `n (m)` amb `m ≥ 1` de confiança |
| 4.5 | A | Prémer el botó del candidat `Z` | Es resol la posició 2 a `Z`; missatge de confirmació; l'estat en viu de tots els participants (excepte trolls, encara cap) s'actualitza per edició |
| 4.6 | A | `/resolve 2` una altra vegada (ja resolta) | Encara llista els candidats vius (la vista no té en compte l'estat de resolució) i permet canviar-lo a un altre valor sense passar per `/unresolve` |
| 4.7 | A | `/unresolve 2` | La posició torna a quedar oberta |
| 4.8 | A | `/resolve 2 K` (valor directe) | Resol directament sense passar pel llistat de botons |
| 4.9 | A | `/resolve 4 @C` | Resol la posició 4 amb el valor que va reportar C (el de la Fase 3.10) |
| 4.10 | B, C, A | Abans de continuar, B envia `9 5` (reafirma el valor ja consensuat a la Fase 3.12 — no-op) i C envia `9 8` (autocorrecció, ja que difereix del seu propi report anterior, sense confirmació); llavors A fa `/resolve` (sense arguments), ja amb **dues** posicions en desacord (2 i 9) | Els nous valors de B i C obren un segon conflicte a la posició 9; el `/resolve` comença el recorregut mostrant la primera posició en conflicte amb botons `resolveall:...` |
| 4.11 | A | Prémer un botó del pas anterior | Resol aquella posició **i** immediatament envia la següent posició encara en conflicte, sense que calgui tornar a escriure `/resolve` |
| 4.12 | A | Repetir fins que no quedin conflictes | El bot indica que ja no hi ha cap desacord pendent, i **no** ofereix cap drecera per tancar l'esdeveniment — remet a `/verify` |
| 4.13 | A | `/resolve 99` (posició fora de rang del patró) | Error d'ús / posició invàlida |
| 4.14 | A | `/resolve 6 GLYPH` (posició de paraula, `*`; `GLYPH` és el valor de consens reportat pels tres a la Fase 3.12 — la posició 6 no ha estat mai en conflicte) | Funciona igual que per a lletres/dígits — les paraules també es resolen per posició |

---

## FASE 5 — Confiança i moderació

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 5.1 | A | `/troll D` | D queda marcat `troll` per a aquest esdeveniment |
| 5.2 | D | Enviar un report a la posició 3, l'única que segueix buida (ningú l'ha tocada des de la Fase 3): `3 M` | S'accepta a `passcode_reports`, però **no** compta a `passcode_candidates` ni a les variants; el missatge d'estat en viu de D **no** es torna a actualitzar a partir d'ara (el seu missatge queda congelat) |
| 5.3 | A | `/resolve 3` (sense valor) | El candidat de D (`M`) **no** apareix al llistat, encara que existeixi el report a la base de dades |
| 5.4 | B, C | `/status` | Segueixen rebent actualitzacions amb normalitat; D és l'única persona que ha deixat de rebre-les |
| 5.5 | A | `/untrust D` | D torna a l'estat neutral; com que estava marcat `troll`, el seu missatge d'estat es refresca **de seguida** (una sola edició) amb l'estat actual del passcode, posant-lo al dia de tot el que s'havia perdut mentre ho era |
| 5.6 | A | `/resolve 3` (sense valor) | El candidat de D (`M`) torna a aparèixer al llistat |
| 5.7 | B, C, D | `/status` | Tots reben l'actualització amb normalitat, D inclòs — el seu missatge ja estava al dia des del pas 5.5, i a partir d'ara torna a rebre-les com qualsevol altre participant |
| 5.8 | A | `/trust C` | C queda marcat `trusted` |
| 5.9 | A | `/untrust C` | Torna a neutral; comprovar que això **no** dispara cap resolució automàtica de res |
| 5.10 | A | `/kick D` | D deixa de ser participant; el seu slot queda lliure |
| 5.11 | D | Intentar `3 P` (enviar un report sense ser participant) | Rebutjat — cal ser participant actiu per poder reportar |
| 5.12 | D | `/join <codi Event 1>` | D torna a entrar com a participant nou (la fila `participants` és nova; la fila `event_trust` d'abans, si en quedava alguna, no s'esborra amb `/kick`) |
| 5.13 | A | `/resolve <alguna posició on D acaba de tornar a reportar>` | Com que `event_trust` **no** es neteja amb `/kick`, si D encara tingués una fila `troll` d'abans, els seus nous reports seguirien sense comptar fins que A fes `/untrust D` explícitament — confirmar aquest detall si s'havia deixat D com a `troll` abans del `/kick` |

---

## FASE 6 — `/promote`

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 6.1 | A | `/promote B` | B esdevé l'administrador; queda marcat `trusted` (com faria `/newevent` amb el seu creador); **no** hi ha cap confirmació Sí/No |
| 6.2 | A, B | Comprovar notificacions | A rep una resposta directa confirmant el traspàs; B rep un missatge nou, en el seu propi idioma, anunciant que ara administra l'esdeveniment |
| 6.3 | A | Comprovar el seu propi flag de confiança | A **manté** el que tenia abans (ja era `trusted` de quan va crear l'esdeveniment); segueix sent participant normal |
| 6.4 | A | Provar una comanda d'administrador, p. ex. `/kick C` | Rebutjada — A ja no és l'administrador |
| 6.5 | B | `/promote A` | Retorna el rol a A, confirmant que l'operació és reversible sense fricció |

---

## FASE 7 — Successió automàtica per `/leave` (Events 2 i 3)

Fins ara, cada `/newevent` o `/join` del pla queia sempre en un moment en
què l'agent que el feia **no pertanyia a cap altre esdeveniment actiu**
— per això la confirmació de canvi no s'hi havia disparat mai encara
(no hi havia res a deixar). A partir d'aquí, el pla deixa de tenir
aquesta cura a propòsit: en diversos punts de les Fases 7-11, l'agent
que fa `/newevent` o `/join` sí que pertany encara a un esdeveniment
anterior actiu, així que la confirmació de canvi salta de debò (vegeu
CLAUDE.md "Succession on leaving an event"); si a més n'és
l'administrador, en acceptar-la es dispara la successió automàtica. És
una prova addicional deliberada del mateix mecanisme, ara disparat per
`/newevent`/`/join` en comptes de per `/leave`, i el resultat es
documenta explícitament allà on té conseqüències. Quan l'esdeveniment
d'origen ja estava **tancat** (per exemple, perquè s'ha abandonat un
pas abans), el canvi es fa directament sense cap confirmació — el pla
ho assenyala només quan sí que en cal una.

### 7a. Trusted preval per sobre d'aportacions (Event 2)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 7a.1 | A | `/newevent Proves Successio A`, confirmant amb **Sí** que vol deixar Event 1 (encara actiu des de la Fase 1-6) | Com que Event 1 segueix actiu i A n'és l'administrador amb un pool `trusted` no buit (només B, des de la Fase 4.4), la successió promociona **B** com a nou administrador d'Event 1 — un cas real de successió disparada per `/newevent`, no per `/leave`. Tot seguit es crea Event 2; A n'és administrador i trusted |
| 7a.2 | B, C, D | `/join <codi>` (el d'Event 2), **en aquest ordre** (B, després C, després D), cadascun confirmant el canvi respecte Event 1 | Els tres s'uneixen a Event 2 (neutral cadascun). Com que els tres eren encara participants d'Event 1 (ara administrat per B) i el deixen un darrere l'altre en aquest mateix ordre, Event 1 es va buidant fins que no hi queda ningú i acaba **tancant-se com a `abandoned`** — igual que li va passar a la Fase 1.5. Com que D és qui el deixa l'últim, hi queda registrat com el seu darrer administrador (`admin_user_id = D`), encara que mai hagi arribat a fer-hi res com a tal — es revifarà abans de la Fase 10 |
| 7a.3 | A | `/trust B` | B queda trusted |
| 7a.4 | B | Reportar **1 sola** posició: `1 A` | Poques aportacions |
| 7a.5 | C | Reportar **3** posicions: `2 B`, `3 C`, `4 1` | Més aportacions que B, però sense trust |
| 7a.6 | A | `/leave` | A surt; com que hi ha un pool `trusted` no buit (només B), el successor **ha de ser B**, malgrat que C té més aportacions |
| 7a.7 | A, B | Comprovar notificacions | A rep confirmació de qui ha pres el relleu; B rep l'avís separat |

### 7b. Empat + exclusió de troll amb més aportacions (Event 3)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 7b.1 | A | `/newevent Proves Successio B` | Nou esdeveniment (trust es reinicia, és independent de l'Event 2); A no pertany a cap esdeveniment actiu en aquest moment, així que no hi ha confirmació |
| 7b.2 | B, C, D | `/join <codi>` (el d'Event 3), **en aquest ordre** (B, després C, després D), cadascun confirmant el canvi respecte Event 2 | S'uneixen a Event 3, neutrals. B encara administrava Event 2 (successió de 7a.6); en deixar-lo primer, com que el pool `trusted` hi és buit, la successió promociona algun dels que hi queden. C i D també el deixen tot seguit, en aquest mateix ordre, així que —igual que a 7a.2— Event 2 acaba buidant-se del tot i **tancant-se com a `abandoned`**, registrat sota `admin_user_id = D` (el darrer a marxar-ne) |
| 7b.3 | A | `/troll D` | D marcat troll |
| 7b.4 | D | Reportar **4** posicions (el nombre més alt de tots): `1 D`, `2 E`, `3 F`, `4 2` | Malgrat ser el que més aporta, ha de quedar exclòs |
| 7b.5 | B, C | Reportar exactament **2** posicions cadascun (empat entre ells), a posicions diferents perquè no hi hagi desacord: B `5 3` i `7 5`; C `8 6` i `9 7` | Cap trusted, cap troll entre ells dos |
| 7b.6 | A | `/leave` | Pool `trusted` buit → cau al pool no-troll (B, C; D exclòs) → guanya qui té més aportacions dins d'aquest pool: B i C empatats → desempat aleatori, l'administrador resultant ha de ser **B o C**, mai D |
| 7b.7 | A, guanyador | Comprovar notificacions i que el nou administrador queda `trusted` automàticament | Igual que a `/promote` |

---

## FASE 8 — Abandonament d'esdeveniment (Events 4 i 5)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 8.1 | A | `/newevent Proves Abandonat A` | Nou esdeveniment |
| 8.2 | B | `/join <codi>` (el d'Event 4), confirmant el canvi si es demana | Únic altre participant. B encara pertanyia a Event 3 (Fase 7b.2), que segueix actiu; si en aquell moment n'era l'administrador (depèn del desempat aleatori de la Fase 7b.6), aquest pas hi dispara successió; si no ho era, és només un canvi normal. Cap dels dos casos afecta la resta d'aquesta fase, i no cal fer-ne seguiment |
| 8.3 | A | `/troll B` | Ara **tots** els participants que no són l'administrador estan trollejats |
| 8.4 | A | `/leave` | No hi ha ningú elegible → l'esdeveniment es tanca com `abandoned` (no `completed`); A rep un missatge que ho explica; **no** s'envia cap passcode final a ningú |
| 8.5 | A | `/newevent Proves Abandonat B` | Nou esdeveniment, ningú més s'hi uneix |
| 8.6 | A | `/leave` (sol a l'esdeveniment) | Mateix resultat: es tanca com `abandoned` immediatament, sense passar per cap càlcul de pool |
| 8.7 | A | `/events` | Ambdós esdeveniments abandonats apareixen amb `status = closed` a la llista (vegeu Fase 12 per a la comprovació completa) |

---

## FASE 9 — `/claim` (Events 6, 7 i 8)

Cada mini-escenari fa servir les comandes SQL descrites a "Simular
inactivitat de l'administrador" en lloc d'esperar 30 minuts (i, a 9c,
també la d'`admin_claims.initiated_at` en lloc dels 5 minuts
addicionals). No cal cap espera real en tota la fase.

### 9a. L'administrador manté el rol (Event 6)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 9a.1 | A | `/newevent Proves Claim Keep`, B s'hi uneix | Preparació |
| 9a.2 | B | Intentar `/claim` immediatament | Rebutjat: l'administrador (A) encara no porta prou temps inactiu |
| 9a.3 | — | Executar la comanda genèrica `UPDATE participants SET last_active_at = ...` | Simula 31 minuts d'inactivitat de l'administrador (A) sense esperar-los |
| 9a.4 | B | `/claim` | Ara sí: s'obre la negociació; A rep un missatge amb botons "Mantenir el rol" / "Cedir el rol" |
| 9a.5 | A | Prémer **"Mantenir el rol"** | La negociació es descarta; A segueix sent administrador; res canvia |
| 9a.6 | B | `/claim` una altra vegada tot seguit | Torna a ser rebutjat: prémer el botó és activitat real d'A, així que el rellotge d'inactivitat s'ha reiniciat de debò (aquesta vegada sense truc de base de dades) |

### 9b. Cessió explícita amb pool de 2 aspirants (Event 7)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 9b.1 | A | `/newevent Proves Claim Handover`, confirmant el canvi respecte Event 6 (actiu des de la Fase 9a); tot seguit B i C s'hi uneixen, **en aquest ordre**, B confirmant també el canvi respecte Event 6 | Preparació. A (administrador d'Event 6) i B (participant neutral) el deixen tots dos en aquest pas; com que B és qui el deixa l'últim, Event 6 acaba **tancant-se com a `abandoned`**, registrat sota `admin_user_id = B` (independentment de si B hi arriba a quedar transitòriament promocionat abans de marxar-ne ell mateix). C s'uneix directament des d'Event 3 (Fase 7b.2), on n'havia acabat sent l'administrador després de la successió de 8.2; com que l'únic altre participant que hi queda és D (marcat `troll` des de 7b.3, exclòs de qualsevol pool), no hi ha ningú elegible per succeir-lo i **Event 3 també es tanca com a `abandoned`**, sota `admin_user_id = C` |
| 9b.2 | B | Reportar `1 A` (1 posició); C reportar `2 B` i `3 C` (2 posicions) | Perquè el desempat per aportacions dins del pool de `/claim` es pugui comprovar més endavant |
| 9b.3 | — | Executar la `UPDATE` de `last_active_at` sobre l'administrador (A) | Simula la inactivitat |
| 9b.4 | B | `/claim` | Obre la negociació; A notificat |
| 9b.5 | C | `/claim` (durant la mateixa negociació oberta) | S'afegeix al pool de candidats **sense** tornar a notificar A |
| 9b.6 | A | Prémer **"Cedir el rol"** | Es tria un successor entre B i C amb la mateixa regla que `/leave` (trusted preferit, després aportacions): com que cap dels dos és trusted, hauria de guanyar **C**, que té més aportacions; el guanyador queda `trusted` i notificat; el missatge original d'A s'edita per confirmar el resultat |

### 9c. Temps esgotat + condició de cursa (Event 8)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 9c.1 | A | `/newevent Proves Claim Timeout`, confirmant el canvi respecte Event 7 (actiu, on A n'és participant no-administrador des de la Fase 9b.6); tot seguit B s'hi uneix, confirmant també el canvi respecte Event 7 | Preparació. Ni A ni B n'eren l'administrador d'Event 7 (C ho és, des de 9b.6), així que cap dels dos dispara successió en marxar-ne — només hi queda **C**, que hi segueix tranquil·lament com a únic participant i administrador, sense tancar-se |
| 9c.2 | — | Executar la `UPDATE` de `last_active_at` sobre l'administrador (A) | Simula la inactivitat |
| 9c.3 | B | `/claim` | Obre negociació; A notificat; queda pendent el botó "Mantenir el rol" / "Cedir el rol" al xat d'A |
| 9c.4 | — | Executar la comanda genèrica `UPDATE admin_claims SET initiated_at = ...` | Simula que ja han passat els 5 minuts de marge sense esperar-los |
| 9c.5 | B | `/claim` una altra vegada | Aquesta crida és la que **dispara** la resolució pendent en favor del pool acumulat (només B); B esdevé administrador i queda `trusted` |
| 9c.6 | A | Prémer, **després** del pas anterior, el botó "Mantenir el rol" del missatge original (ara obsolet) | Ha de trobar que la negociació ja no existeix i informar-ho amb gràcia, sense duplicar cap resolució ni deixar l'estat inconsistent |

---

## FASE 10 — Tancament amb `/verify` (Event 1)

Retornant a l'Event 1 (Fases 1-6), amb totes les posicions ja resoltes o
amb candidats vius coneguts. Com que a la Fase 7a.2 en van marxar tots
els participants originals (B, C i D es van passar a Event 2), Event 1
va quedar tancat com a `abandoned` — cal revifar-lo abans de poder-hi
fer res més.

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 10.1 | A | `/join <codi Event 1>`, confirmant el canvi (respecte Event 8, on A és participant no-administrador des de la Fase 9c.1) i acceptant que reviurà Event 1 | Com que Event 1 està tancat com a `abandoned` des de la Fase 7a.2, el codi el revifa en comptes de rebutjar-lo (igual que a la Fase 1.9): es reobre (`status = active`, `closed_reason = NULL`) i A en torna a ser l'administrador, marcat `trusted`. Totes les dades de posicions, candidats i resolucions de les Fases 3-4 romanen intactes — revifar un esdeveniment només canvia `status`/`admin_user_id`/`closed_reason`, mai els reports |
| 10.2 | A | Construir, fora del bot, un passcode que **no** coincideixi amb cap combinació possible (p. ex. agafar una combinació vàlida i alterar-ne un caràcter) i fer `/verify <aquest passcode>` | Cap combinació coincideix; el bot ho informa explícitament i **no** resol ni tanca res; l'esdeveniment segueix obert |
| 10.3 | A | Recopilar, fora del bot, una combinació completa vàlida (una per cada posició, agafant els valors ja acordats/resolts) | Preparació manual, tal com faria un jugador real al taulell de canvi del joc |
| 10.4 | A | `/verify <passcode construït al pas anterior>` (com a administrador vigent) | Coincideix amb exactament una combinació: resol totes les posicions implicades (fins i tot les que no estaven en disputa), tanca l'esdeveniment com `completed`, i envia un missatge **nou** (no una edició) amb el passcode final a tots els participants **excepte** els trolls actuals |
| 10.5 | A | `/status` després de tancat | Ha de reflectir que l'esdeveniment ja no és actiu (o rebutjar la comanda amb un missatge adequat, segons el comportament implementat per a esdeveniments tancats) |
| 10.6 | A | Comprovar que ha rebut el missatge nou del passcode final | És l'únic participant d'Event 1 en aquest punt — B, C i D se'n van anar tots a la Fase 7a.2 i mai hi han tornat — així que no hi ha ningú més a qui comprovar-ho |

---

## FASE 11 — Patró invertit i límits de variants/seguretat (Event 9)

Patró `999XX*XXX99`: posicions 1-3 dígits, 4-5 lletres, 6 paraula, 7-9
lletres, 10-11 dígits — el mateix disseny que el patró per defecte però
amb lletres i dígits intercanviats, per comprovar que el soft-check de
tipus i el càlcul de límits funcionen igual amb un patró diferent del
per defecte, no només per casualitat d'aquell patró concret.

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 11.1 | A | `/newevent Proves Patró Invertit | 999XX*XXX99` | Nou esdeveniment |
| 11.2 | B | `/join <codi>` (el d'Event 9), confirmant el canvi respecte Event 8 | S'uneix a Event 9. B n'era l'únic participant restant a Event 8 i també l'administrador (des de la Fase 9c.5) — A ja se n'havia anat a la Fase 10.1 per revifar Event 1 — així que en marxar-ne no hi queda ningú elegible i **Event 8 es tanca com a `abandoned`**, sota `admin_user_id = B` |
| 11.3 | A | `1 X` (posició 1 espera un dígit, `X` no ho és) | Es dispara la confirmació Sí/No pel tipus, igual que a la Fase 3 però ara amb els tipus intercanviats; confirmar amb **Sí** |
| 11.4 | A | Reportar un valor del tipus correcte a **cada** posició (1-11): `1 5`, `2 1`, `3 2`, `4 A`, `5 B`, `6 ALPHA`, `7 C`, `8 D`, `9 E`, `10 9`, `11 8` | Preparació per a l'estrès de variants |
| 11.5 | B | Reportar, a **les 5 primeres posicions només** (1-5), un valor diferent del d'A a cadascuna, del tipus correcte: `1 7`, `2 3`, `3 4`, `4 X`, `5 Y` | 5 posicions amb 2 candidats cadascuna = 2⁵ = 32 combinacions possibles, per sobre del límit de renderització (16) |
| 11.6 | A | `/status` | En comptes de llistar les 32 combinacions, mostra un resum (progrés + quines posicions segueixen en conflicte) i convida a fer `/resolve` d'algunes abans de tornar-ho a intentar |
| 11.7 | B | Reportar també a les 6 posicions restants (6-11) un valor diferent del d'A, del tipus correcte: `6 BETA`, `7 F`, `8 G`, `9 H`, `10 0`, `11 1` | Ara les 11 posicions tenen 2 candidats cadascuna = 2¹¹ = 2048 combinacions, per sobre també del límit de seguretat intern (2000) |
| 11.8 | A | `/verify 512ABALPHACDE98` (la combinació de les pròpies dades d'A del pas 11.4; el contingut exacte és irrellevant, ja rebutjat abans de comparar-lo amb res) | Com que el nombre brut de combinacions supera el límit de seguretat abans fins i tot de comparar-les, el bot demana explícitament que es resolguin algunes posicions manualment primer, en lloc d'intentar-ho i penjar-se o trigar excessivament |
| 11.9 | A | `/resolve` (sense arguments) diverses vegades fins reduir prou el nombre de posicions en conflicte | Un cop per sota del límit, `/status` torna a mostrar combinacions concretes i `/verify` torna a poder-se intentar amb normalitat |

---

## FASE 12 — `/events`

`/events` llista **tots** els esdeveniments en què l'agent ha
participat mai — l'actual (si n'hi ha) primer, i després cada altre en
què va deixar de ser-hi, del més recent al més antic — provinents de
`participant_history` (vegeu CLAUDE.md "Data model"), no de qui n'és
l'`admin_user_id`. Com que cap agent ha fet mai un `/leave` "net" (sense
encadenar-lo immediatament amb el següent `/newevent`/`/join`) a partir
de la Fase 7, els quatre acaben acumulant-ne uns quants — per això calia
comprovar el cas de la llista buida abans, a la Fase 0.6:

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 12.1 | A | `/events` | **10** esdeveniments: Event 1 (`completed`), Event 1b, Event 2, Event 3, Event 4, Event 5, Event 6, Event 7 i Event 8, tots com a passats, i **Event 9** com l'actual (`active`, des d'11.1) — literalment tots els esdeveniments creats en aquest pla |
| 12.2 | B | `/events` | **8** esdeveniments: Event 1, 2, 3, 4, 6, 7, 8 com a passats, i **Event 9** com l'actual (des d'11.2) — mai ha tocat Event 1b ni Event 5 |
| 12.3 | C | `/events` | **4** esdeveniments: Event 1, 2, 3 com a passats, i **Event 7** com l'actual (des de 9b.1 — no l'ha deixat des de llavors) |
| 12.4 | D | `/events` | **3** esdeveniments: Event 1, 2 com a passats (Event 1 hi apareix una sola vegada tot i haver-lo deixat dues, per la fila de `/kick` a 5.10 i pel canvi a 7a.2), i **Event 3** com l'actual (des de 7b.2 — mai l'ha deixat) |

---

## Matriu de cobertura (comanda → on es prova)

| Comanda | Fase(s) |
|---|---|
| `/start`, `/help` | 0 |
| `/language` | 0, 1 |
| `/newevent` (per defecte, patró personalitzat, patró invàlid, nom duplicat, confirmació de sortida amb rebuig i acceptació, successió sobre l'esdeveniment anterior) | 1, 7, 8, 9, 11 |
| `/sharetext` (sense args, amb codi, amb idioma, botons) | 1 |
| `/join` (codi vàlid, invàlid, canvi d'esdeveniment acceptat i rebutjat, revifada d'un esdeveniment abandonat, successió sobre l'esdeveniment anterior) | 1, 2, 7, 8, 9, 10, 11 |
| `/leave` (normal, amb successió, abandonament) | 6 (implícit a 6.5 no), 7, 8 |
| `/current` | 0, 1, 2 |
| `<posició> <valor>` / `/submit` (nou, no-op, autocorrecció, desacord, tipus incorrecte, ambdós alhora) | 3, 11 |
| `<posició>` sola / `/submit <posició>` (eliminar) | 3 |
| `/status` (normal, relocalització, límit de 16) | 4, 11 |
| `/resolve <posició> <valor>` | 4 |
| `/resolve <posició> @user` | 4 |
| `/resolve <posició>` (llistat amb botons, amb desglossament de confiança) | 4 |
| `/resolve` (recorregut complet, missatge de "res en conflicte") | 4, 11 |
| `/unresolve` | 4 |
| `/trust`, `/troll`, `/untrust` (efectes en candidats i broadcast) | 5 |
| `/kick` | 5 |
| `/promote` (i reversió) | 6 |
| `/claim` (rebutjat per poc temps, negociació, keep, handover, timeout, cursa, pool de 2+) | 9 |
| `/verify` (sense match, match únic que tanca, límit de seguretat) | 10, 11 |
| `/events` (sense cap, amb esdeveniments) | 0, 12 |

Amb l'excepció ja assenyalada de l'ambigüitat de `/verify` amb dos
slots de paraula (fora d'abast per decisió, no per oblit), un cop
completades totes les fases, la resta de comandes de la taula de
referència de `CLAUDE.md` han estat exercides en tots els escenaris
descrits al document (èxit, conflicte, límit i frontera).

Una branca que aquest pla **no** exercita explícitament: revifar un
esdeveniment abandonat amb `/join` quan qui l'executa **no** és a cap
altre esdeveniment (sense diàleg de confirmació pel mig). Als passos
1.9/2.5, qui reviu sempre ja és a un altre esdeveniment actiu, així que
només es prova la variant amb confirmació. Es podria afegir provant
`/join` amb el codi d'Event 1b des d'un cinquè compte net (sense cap
esdeveniment previ), però amb els 4 agents mínims ja definits no hi ha
cap agent lliure per fer-ho sense interferir amb la resta del pla.
