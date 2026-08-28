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
es cobreixen totes les comandes en tots els escenaris, que és el que has
demanat.

## Preparació prèvia

- Els 4 comptes de Telegram han de ser nous per al bot (o cal fer
  `/leave` de qualsevol esdeveniment previ abans de començar) per no
  arrossegar estat d'una prova anterior.
- Cada agent hauria de tenir el client de Telegram en un idioma diferent
  del navegador/sistema per poder comprovar que `language_code` es
  detecta bé la primera vegada (opcional, però aprofita per provar la
  detecció automàtica descrita a Internacionalització).
- Algú ha d'anar prenent nota de qui fa `/verify` amb quin codi, per no
  perdre el fil — els codis de paraula (`*`) es couen entre els mateixos
  agents, així que cal apuntar-los en algun lloc fora del bot (paper,
  xat extern) tal com passaria en un IFS real.

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
# Fer que l'administrador actual de l'esdeveniment de codi <CODI>
# aparegui com si portés 31 minuts sense interactuar amb el bot:
npx wrangler d1 execute ifs-passcode-relay --remote --command "UPDATE participants SET last_active_at = datetime('now', '-31 minutes') WHERE event_id = (SELECT id FROM events WHERE code = '<CODI>') AND user_id = (SELECT admin_user_id FROM events WHERE code = '<CODI>');"
```

```bash
# Un cop oberta la negociació (després del primer /claim vàlid), fer
# que sembli que ja han passat els 5 minuts de marge de resposta:
npx wrangler d1 execute ifs-passcode-relay --remote --command "UPDATE admin_claims SET initiated_at = datetime('now', '-6 minutes') WHERE event_id = (SELECT id FROM events WHERE code = '<CODI>');"
```

Cal substituir `<CODI>` pel codi de l'esdeveniment cada vegada (el que
dona `/myevent` o el que es va compartir en crear-lo). No cal conèixer
l'identificador numèric de Telegram de l'administrador: la subconsulta
`SELECT admin_user_id FROM events WHERE code = ...` ja el resol.

Aquesta és la manera amb què es fa la Fase 9 en aquest pla — **no cal
esperar cap dels dos temps reals** en cap moment.

## Resum d'esdeveniments a crear

| # | Nom suggerit | Patró | Objectiu principal |
|---|---|---|---|
| 1 | `Proves Principal` | per defecte (`XXX99*999XX`) | Flux complet: submit, resolve, trust, kick, promote, verify amb match únic |
| 2 | `Proves Successio A` | per defecte | `/leave` — trusted preval per sobre d'aportacions |
| 3 | `Proves Successio B` | per defecte | `/leave` — empat + exclusió de troll amb més aportacions |
| 4 | `Proves Abandonat A` | per defecte | `/leave` sense ningú elegible (tothom troll) |
| 5 | `Proves Abandonat B` | per defecte | `/leave` sense ningú més a l'esdeveniment |
| 6 | `Proves Claim Keep` | per defecte | `/claim` — l'administrador prem "Mantenir el rol" |
| 7 | `Proves Claim Handover` | per defecte | `/claim` — l'administrador prem "Cedir el rol", amb pool de 2 aspirants |
| 8 | `Proves Claim Timeout` | per defecte | `/claim` — sense resposta, resolució per temps + condició de cursa |
| 9 | `Proves Patró Invertit` | `999XX*XXX99` | Comprova el patró invertit (tipus intercanviats) i, sobre aquest mateix esdeveniment, el límit de 16 variants a `/status` i el límit de seguretat (2000) a `/verify` |

Es poden crear en qualsevol ordre.

---

## FASE 0 — Onboarding individual (cada agent, per separat)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 0.1 | A, B, C, D | Enviar `/start` | Missatge de benvinguda en l'idioma detectat automàticament del client de Telegram (`en`/`ca`/`es`/`fr`, o `en` si no és cap d'aquests) |
| 0.2 | A, B, C, D | Enviar `/help` | Llista de comandes disponibles, en el mateix idioma |
| 0.3 | A, B, C, D | Enviar `/language xx` amb un idioma diferent de l'actual | Confirmació en el **nou** idioma; els missatges ja enviats no canvien |
| 0.4 | A | Repetir `/language` amb un codi no suportat (p. ex. `/language de`) | Missatge d'error / ús, sense canviar l'idioma actual |
| 0.5 | A, B, C, D | Enviar `/myevent` sense estar en cap esdeveniment | Missatge indicant que no es pertany a cap esdeveniment |

---

## FASE 1 — Creació de l'esdeveniment principal i share text (Event 1)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 1.1 | A | `/newevent Proves Principal` (sense patró) | Es crea l'esdeveniment amb el patró per defecte `XXX99*999XX`; **abans** d'unir-s'hi s'envia automàticament el text per compartir (bloc + esment del bot + codi), en dos missatges separats (bloc + nota en cursiva amb botons d'idioma) |
| 1.2 | A | Comprovar els botons EN/CA/ES/FR del segon missatge | Només apareixen els idiomes **diferents** de l'actual d'A, tots en una sola fila |
| 1.3 | A | Prémer un dels botons d'idioma (p. ex. `ES`) | S'envia un **nou** parell de missatges (bloc + nota), ara en espanyol, i el botó `ES` ja no hi surt (n'hi ha 3 dels altres idiomes) |
| 1.4 | A | `/myevent` | Mostra que A és participant de l'esdeveniment i n'és l'administrador |
| 1.5 | A | `/newevent Proves Principal` (mateix nom, un altre cop) | Es crea un **segon** esdeveniment nou amb un codi diferent (el nom duplicat no és un conflicte) — **esborrar aquest esdeveniment duplicat de les notes**, no s'usa més; només confirma que `name` no és únic |
| 1.6 | A | `/sharetext` (sense arguments) | Regenera el text per al codi de l'esdeveniment **actual** d'A, en el seu idioma actual |
| 1.7 | A | `/sharetext <codi> fr` | Regenera el text per a aquell codi concret en francès, independentment de l'idioma actual d'A |
| 1.8 | A | Provar `/newevent` amb un patró invàlid, p. ex. `/newevent Proves X | XY1` | Rebutjat (el patró només admet `X`, `9`, `*`) |

---

## FASE 2 — Unir-se i primeres comandes

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 2.1 | B | `/join <codi Event 1>` | S'uneix; rep un missatge d'estat en viu (guarda `status_message_id`) i el nudge cap a `/sharetext` (sense codi ni idioma) |
| 2.2 | C | `/join <codi Event 1>` | Igual que B |
| 2.3 | D | `/join <codi Event 1>` | Igual que B |
| 2.4 | B | `/join <codi inexistent>` | Error de codi no trobat, sense afectar l'esdeveniment actual de B |
| 2.5 | B | `/join <codi d'un altre esdeveniment>`* | Es dispara la confirmació "ja ets en un esdeveniment, vols canviar?"; respondre que **no** i confirmar que B segueix a Event 1 |
| 2.6 | A, B, C, D | `/myevent` | Cadascú veu el seu rol correcte (A = administrador, B/C/D = participants) |

\* Cap altre esdeveniment existeix encara en aquest punt del pla: es pot
fer aquest pas més tard (per exemple amb l'esdeveniment de la Fase 7) i
tornar aquí — l'important és provar la confirmació de canvi
d'esdeveniment un cop en algun moment del pla.

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
| 3.7 | C | `2 Z` (valor **diferent** al de B per a la mateixa posició) | Es dispara confirmació Sí/No: "aquesta posició ja té un valor diferent d'un altre agent" |
| 3.8 | C | Confirmar amb **Sí** | S'afegeix `Z` com a candidat addicional a la posició 2 (no substitueix el de B); ara la posició 2 té 2 candidats |
| 3.9 | D | `2 Z` (mateix valor que C, però D encara no havia reportat res allà) | **No** hi ha confirmació per desacord (coincideix amb un candidat existent), s'afegeix D com a suport addicional del mateix candidat `Z` |
| 3.10 | C | `4 X` (posició 4 és un dígit segons el patró, `X` no ho és) | Es dispara confirmació Sí/No pel *tipus* (soft-check) |
| 3.11 | C | Confirmar amb **No** | Res es desa; `4` segueix sense report de C |
| 3.12 | C | `4 X` una altra vegada, ara confirmar amb **Sí** | S'accepta igualment, malgrat no encaixar amb el tipus esperat de la posició |
| 3.13 | B | Provar una posició que sigui alhora desacord **i** tipus incorrecte alhora (p. ex. posició 4 amb una lletra diferent de la de C) | El missatge de confirmació esmenta **totes dues** condicions alhora |
| 3.14 | B, C, D | Omplir la resta de posicions (5, 6 —paraula—, 7, 8, 9, 10, 11) amb valors **consistents** entre ells (sense desacord), deixant **una** posició encara en conflicte (p. ex. la 2, ja treballada) per a la Fase 4 | Prepara el terreny per a `/resolve` i per al `/status` amb un conflicte pendent |

---

## FASE 4 — `/status`, `/resolve`, `/unresolve`

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 4.1 | A | `/status` (o `/code`) | Mostra el progrés i totes les combinacions possibles com a blocs de codi monoespaiat, cadascun amb el recompte de suports; com que només hi ha una posició en conflicte (2 candidats), hi ha 2 combinacions, per sota del límit de 16 |
| 4.2 | B | `/status` una altra vegada | Es reenvia com a missatge **nou** i `status_message_id` de B queda repuntat cap a aquest; les properes actualitzacions en viu editaran aquest nou missatge, no l'antic |
| 4.3 | A | `/resolve 2` (sense valor) | Llista els candidats de la posició 2 (p. ex. `K` amb 1 suport, `Z` amb 2 suports) amb un botó per candidat, en ordre de més a menys suportat; com que A és `trusted` per defecte i no ha reportat aquí, cap candidat mostra desglossament de confiança encara |
| 4.4 | A | `/trust B` abans de continuar (avançant una mica la Fase 5) i tornar a `/resolve 2` | Ara el candidat suportat per B mostra el desglossament `n (m)` amb `m ≥ 1` de confiança |
| 4.5 | A | Prémer el botó del candidat `Z` | Es resol la posició 2 a `Z`; missatge de confirmació; l'estat en viu de tots els participants (excepte trolls, encara cap) s'actualitza per edició |
| 4.6 | A | `/resolve 2` una altra vegada (ja resolta) | Encara llista els candidats vius (la vista no té en compte l'estat de resolució) i permet canviar-lo a un altre valor sense passar per `/unresolve` |
| 4.7 | A | `/unresolve 2` | La posició torna a quedar oberta |
| 4.8 | A | `/resolve 2 K` (valor directe) | Resol directament sense passar pel llistat de botons |
| 4.9 | A | `/resolve 4 @C` | Resol la posició 4 amb el valor que va reportar C (el de la Fase 3.12) |
| 4.10 | A | `/resolve` (sense arguments), amb **almenys dues** posicions encara en desacord (crear-ne una altra de nova entre B i C si cal, p. ex. la posició 9) | Comença el recorregut: mostra la primera posició en conflicte amb botons `resolveall:...` |
| 4.11 | A | Prémer un botó del pas anterior | Resol aquella posició **i** immediatament envia la següent posició encara en conflicte, sense que calgui tornar a escriure `/resolve` |
| 4.12 | A | Repetir fins que no quedin conflictes | El bot indica que ja no hi ha cap desacord pendent, i **no** ofereix cap drecera per tancar l'esdeveniment — remet a `/verify` |
| 4.13 | A | `/resolve 99` (posició fora de rang del patró) | Error d'ús / posició invàlida |
| 4.14 | A | `/resolve 6` (posició de paraula, `*`) amb un valor de paraula reportat prèviament | Funciona igual que per a lletres/dígits — les paraules també es resolen per posició |

---

## FASE 5 — Confiança i moderació

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 5.1 | A | `/troll D` | D queda marcat `troll` per a aquest esdeveniment |
| 5.2 | D | Enviar un nou report vàlid, p. ex. `5 3` | S'accepta a `passcode_reports`, però **no** compta a `passcode_candidates` ni a les variants; el missatge d'estat en viu de D **no** es torna a actualitzar a partir d'ara (el seu missatge queda congelat) |
| 5.3 | A | `/resolve 5` (sense valor) | El candidat de D **no** apareix al llistat, encara que existeixi el report a la base de dades |
| 5.4 | B, C | `/status` | Segueixen rebent actualitzacions amb normalitat; D és l'única persona que ha deixat de rebre-les |
| 5.5 | A | `/untrust D` | D torna a l'estat neutral |
| 5.6 | A | `/resolve 5` (sense valor) | El candidat de D torna a aparèixer al llistat |
| 5.7 | B, C, D | `/status` | D torna a rebre actualitzacions **a partir d'ara**, però no se li reenvien retroactivament les que es va perdre mentre era troll |
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

### 7a. Trusted preval per sobre d'aportacions (Event 2)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 7a.1 | A | `/newevent Proves Successio A` | Nou esdeveniment; A administrador i trusted |
| 7a.2 | B, C, D | `/join <codi>` | Els tres s'uneixen (neutral cadascun) |
| 7a.3 | A | `/trust B` | B queda trusted |
| 7a.4 | B | Reportar **1 sola** posició | Poques aportacions |
| 7a.5 | C | Reportar **3** posicions | Més aportacions que B, però sense trust |
| 7a.6 | A | `/leave` | A surt; com que hi ha un pool `trusted` no buit (només B), el successor **ha de ser B**, malgrat que C té més aportacions |
| 7a.7 | A, B | Comprovar notificacions | A rep confirmació de qui ha pres el relleu; B rep l'avís separat |

### 7b. Empat + exclusió de troll amb més aportacions (Event 3)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 7b.1 | A | `/newevent Proves Successio B` | Nou esdeveniment (trust es reinicia, és independent de l'Event 2) |
| 7b.2 | B, C, D | `/join <codi>` | S'uneixen neutrals |
| 7b.3 | A | `/troll D` | D marcat troll |
| 7b.4 | D | Reportar **4** posicions (el nombre més alt de tots) | Malgrat ser el que més aporta, ha de quedar exclòs |
| 7b.5 | B, C | Reportar exactament **2** posicions cadascun (empat entre ells) | Cap trusted, cap troll entre ells dos |
| 7b.6 | A | `/leave` | Pool `trusted` buit → cau al pool no-troll (B, C; D exclòs) → guanya qui té més aportacions dins d'aquest pool: B i C empatats → desempat aleatori, l'administrador resultant ha de ser **B o C**, mai D |
| 7b.7 | A, guanyador | Comprovar notificacions i que el nou administrador queda `trusted` automàticament | Igual que a `/promote` |

---

## FASE 8 — Abandonament d'esdeveniment (Events 4 i 5)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 8.1 | A | `/newevent Proves Abandonat A` | Nou esdeveniment |
| 8.2 | B | `/join <codi>` | Únic altre participant |
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
| 9a.3 | — | Executar la `UPDATE participants SET last_active_at = ...` sobre l'administrador (A) d'aquest esdeveniment | Simula 31 minuts d'inactivitat sense esperar-los |
| 9a.4 | B | `/claim` | Ara sí: s'obre la negociació; A rep un missatge amb botons "Mantenir el rol" / "Cedir el rol" |
| 9a.5 | A | Prémer **"Mantenir el rol"** | La negociació es descarta; A segueix sent administrador; res canvia |
| 9a.6 | B | `/claim` una altra vegada tot seguit | Torna a ser rebutjat: prémer el botó és activitat real d'A, així que el rellotge d'inactivitat s'ha reiniciat de debò (aquesta vegada sense truc de base de dades) |

### 9b. Cessió explícita amb pool de 2 aspirants (Event 7)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 9b.1 | A | `/newevent Proves Claim Handover`, B i C s'hi uneixen | Preparació |
| 9b.2 | B | Reportar, p. ex., 1 posició; C reportar 2 posicions | Perquè el desempat per aportacions dins del pool de `/claim` es pugui comprovar més endavant |
| 9b.3 | — | Executar la `UPDATE` de `last_active_at` sobre l'administrador (A) | Simula la inactivitat |
| 9b.4 | B | `/claim` | Obre la negociació; A notificat |
| 9b.5 | C | `/claim` (durant la mateixa negociació oberta) | S'afegeix al pool de candidats **sense** tornar a notificar A |
| 9b.6 | A | Prémer **"Cedir el rol"** | Es tria un successor entre B i C amb la mateixa regla que `/leave` (trusted preferit, després aportacions): com que cap dels dos és trusted, hauria de guanyar **C**, que té més aportacions; el guanyador queda `trusted` i notificat; el missatge original d'A s'edita per confirmar el resultat |

### 9c. Temps esgotat + condició de cursa (Event 8)

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 9c.1 | A | `/newevent Proves Claim Timeout`, B s'hi uneix | Preparació |
| 9c.2 | — | Executar la `UPDATE` de `last_active_at` sobre l'administrador (A) | Simula la inactivitat |
| 9c.3 | B | `/claim` | Obre negociació; A notificat; queda pendent el botó "Mantenir el rol" / "Cedir el rol" al xat d'A |
| 9c.4 | — | Executar la `UPDATE admin_claims SET initiated_at = ...` sobre aquest esdeveniment | Simula que ja han passat els 5 minuts de marge sense esperar-los |
| 9c.5 | B | `/claim` una altra vegada | Aquesta crida és la que **dispara** la resolució pendent en favor del pool acumulat (només B); B esdevé administrador i queda `trusted` |
| 9c.6 | A | Prémer, **després** del pas anterior, el botó "Mantenir el rol" del missatge original (ara obsolet) | Ha de trobar que la negociació ja no existeix i informar-ho amb gràcia, sense duplicar cap resolució ni deixar l'estat inconsistent |

---

## FASE 10 — Tancament amb `/verify` (Event 1)

Retornant a l'Event 1 (Fases 1-6), amb totes les posicions ja resoltes o
amb candidats vius coneguts.

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 10.1 | A | Construir, fora del bot, un codi que **no** coincideixi amb cap combinació possible (p. ex. agafar una combinació vàlida i alterar-ne un caràcter) i fer `/verify <aquest codi>` | Cap combinació coincideix; el bot ho informa explícitament i **no** resol ni tanca res; l'esdeveniment segueix obert |
| 10.2 | A | Recopilar, fora del bot, una combinació completa vàlida (una per cada posició, agafant els valors ja acordats/resolts) | Preparació manual, tal com faria un jugador real al taulell de canvi del joc |
| 10.3 | A | `/verify <codi construït al pas anterior>` (com a administrador vigent) | Coincideix amb exactament una combinació: resol totes les posicions implicades (fins i tot les que no estaven en disputa), tanca l'esdeveniment com `completed`, i envia un missatge **nou** (no una edició) amb el passcode final a tots els participants **excepte** els trolls actuals |
| 10.4 | A | `/status` després de tancat | Ha de reflectir que l'esdeveniment ja no és actiu (o rebutjar la comanda amb un missatge adequat, segons el comportament implementat per a esdeveniments tancats) |
| 10.5 | B, C | Comprovar que han rebut el missatge nou del passcode final | Sí, tots dos, ja que cap dels dos és troll en aquest punt |

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
| 11.2 | B | `/join <codi>` | S'uneix |
| 11.3 | A | `1 X` (posició 1 espera un dígit, `X` no ho és) | Es dispara la confirmació Sí/No pel tipus, igual que a la Fase 3 però ara amb els tipus intercanviats; confirmar amb **Sí** |
| 11.4 | A | Reportar un valor del tipus correcte a **cada** posició (1-11), p. ex. `1 5`, `2 1`, `3 2`, `4 A`, `5 B`, `6 ALPHA`, `7 C`, `8 D`, `9 E`, `10 9`, `11 8` | Preparació per a l'estrès de variants |
| 11.5 | B | Reportar, a **les 5 primeres posicions només** (1-5), un valor diferent del d'A a cadascuna, del tipus correcte (p. ex. `1 7`, `2 3`, `3 4`, `4 X`, `5 Y`) | 5 posicions amb 2 candidats cadascuna = 2⁵ = 32 combinacions possibles, per sobre del límit de renderització (16) |
| 11.6 | A | `/status` | En comptes de llistar les 32 combinacions, mostra un resum (progrés + quines posicions segueixen en conflicte) i convida a fer `/resolve` d'algunes abans de tornar-ho a intentar |
| 11.7 | B | Reportar també a les 6 posicions restants (6-11) un valor diferent del d'A, del tipus correcte (p. ex. `6 BETA`, `7 F`, `8 G`, `9 H`, `10 0`, `11 1`) | Ara les 11 posicions tenen 2 candidats cadascuna = 2¹¹ = 2048 combinacions, per sobre també del límit de seguretat intern (2000) |
| 11.8 | A | `/verify <qualsevol codi plausible>` | Com que el nombre brut de combinacions supera el límit de seguretat abans fins i tot de comparar-les, el bot demana explícitament que es resolguin algunes posicions manualment primer, en lloc d'intentar-ho i penjar-se o trigar excessivament |
| 11.9 | A | `/resolve` (sense arguments) diverses vegades fins reduir prou el nombre de posicions en conflicte | Un cop per sota del límit, `/status` torna a mostrar combinacions concretes i `/verify` torna a poder-se intentar amb normalitat |

---

## FASE 12 — `/events`

| Pas | Agent | Acció | Resultat esperat |
|---|---|---|---|
| 12.1 | A | `/events` | Llista **tots** els esdeveniments que A administra actualment o ha administrat, amb el seu `status` (`active`/`closed`), incloent-hi els duplicats de la Fase 1.5, els abandonats de la Fase 8 i els tancats de les Fases 10-11 |
| 12.2 | B | `/events` (si en algun moment ha estat administrador, p. ex. gràcies a la Fase 6 o a alguna successió) | Ha de llistar només els que **B** administra/ha administrat, no els d'A |
| 12.3 | D | `/events` (si mai ha estat administrador) | Llista buida amb el missatge corresponent |

---

## Matriu de cobertura (comanda → on es prova)

| Comanda | Fase(s) |
|---|---|
| `/start`, `/help` | 0 |
| `/language` | 0, 1 |
| `/newevent` (per defecte, patró personalitzat, patró invàlid, nom duplicat) | 1, 7, 8, 9, 11 |
| `/sharetext` (sense args, amb codi, amb idioma, botons) | 1 |
| `/join` (codi vàlid, invàlid, canvi d'esdeveniment) | 2 |
| `/leave` (normal, amb successió, abandonament) | 6 (implícit a 6.5 no), 7, 8 |
| `/myevent` | 0, 1, 2 |
| `<posició> <valor>` / `/submit` (nou, no-op, autocorrecció, desacord, tipus incorrecte, ambdós alhora) | 3, 11 |
| `<posició>` sola / `/submit <posició>` (eliminar) | 3 |
| `/status`, `/code` (normal, relocalització, límit de 16) | 4, 11 |
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
| `/events` (amb esdeveniments, sense cap) | 12 |

Amb l'excepció ja assenyalada de l'ambigüitat de `/verify` amb dos
slots de paraula (fora d'abast per decisió, no per oblit), un cop
completades totes les fases, la resta de comandes de la taula de
referència de `CLAUDE.md` han estat exercides en tots els escenaris
descrits al document (èxit, conflicte, límit i frontera).
