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
| `/troll <usuari>` | creador de l'esdeveniment | Descarta les aportacions d'un participant. |
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
- **Domini:** un subdomini de `grifwl.blue` (per decidir).

Les instruccions d'instal·lació i desplegament s'afegiran aquí un cop
existeixi una primera implementació.

## Llicència

MIT.
