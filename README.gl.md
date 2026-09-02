<!-- Languages: [English](README.md) | [Català](README.ca.md) | [Castellano](README.es.md) | [Français](README.fr.md) | Galego | [Euskara](README.eu.md) -->

# IFS Passcode Relay

Un bot de Telegram que permite aos asistentes a un evento
**Ingress First Saturday (IFS)** construír colaborativamente, en tempo
real, o passcode canxeable do evento.

**Idiomas:** [English](README.md) · [Català](README.ca.md) · [Castellano](README.es.md) · [Français](README.fr.md) · Galego · [Euskara](README.eu.md)

## Que é isto?

Ingress First Saturday é un evento presencial recorrente do xogo móbil
[Ingress](https://ingress.com). Durante o evento, amósanselles aos
xogadores as imaxes dunha serie de portais; visitalos sobre o terreo e
inspeccionar o seu contido multimedia revela un carácter. Concatenando
os caracteres na orde correcta obtense un passcode canxeable na tenda do
xogo por un paquete de obxectos do IFS.

Pode haber varios IFS en marcha á vez, cada un co seu propio passcode.
Este bot permite a todos os asistentes a un IFS concreto reportar que
carácter atoparon e en que posición corresponde, e mantén unha vista
compartida e en directo do passcode a medida que se completa — sen ter
que recompilar capturas de pantalla manualmente nun grupo de chat.

## Como funciona, desde o punto de vista dun xogador

1. Quen organiza o relevo de passcode dun IFS crea un evento con
   `/newevent` e obtén un código curto para compartir cos asistentes
   (por exemplo, nun grupo de WhatsApp) — o bot envía de inmediato un
   texto de convite listo para pegar con ese código, e quen crea o
   evento únese a el automaticamente — como o seu administrador —, xa
   que ser o organizador non o exime de cazar portais tamén. Tamén
   empeza marcado como de confianza para o seu propio evento, igual que
   faría `/trust` con calquera outra persoa. Por defecto, dáse por feito
   que o passcode segue o patrón `XXX99*999XX` (tres letras, dous
   números, unha palabra enteira, tres números, dúas letras) — quen crea
   o evento pode establecer outro patrón se ese IFS usa outro formato. O
   nome do evento non precisa ser único: facer `/newevent` dúas veces co
   mesmo nome exacto non é un erro, simplemente crea dous eventos
   separados con dous códigos de acceso distintos. Como os asistentes só
   ven o nome ao escoller que código seguir, convén que sexa o bastante
   específico para distinguir eventos IFS co mesmo nome — por exemplo,
   `/newevent Barcelona 2026-08`, incluíndo o ano e o mes, en vez dun
   simple `/newevent Barcelona` que choca con calquera outro IFS de
   Barcelona. Se estás noutro evento aínda sen resolver (non pechado),
   primeiro pídeche confirmación — o administres ou non — xa que crear
   este o deixa atrás; se dis que non, non se crea nada. Se ese evento
   xa estaba pechado, ou non estabas en ningún, créase de inmediato sen
   preguntar. En calquera caso, se administrabas o que deixas, tras-
   pásase antes, igual que faría `/leave` (ver o punto 6 máis abaixo).
2. O resto de asistentes envía `/join <código>` ao bot, que tamén os
   invita a executar `/sharetext` por se queren axudar a difundilo. Un
   axente só pode estar contribuíndo activamente a un evento á vez, así
   que unirte a un distinto mentres o actual aínda non está resolto pide
   confirmar o cambio primeiro — e, se administrabas o anterior,
   traspásao igualmente. Se o teu evento actual xa está pechado, ou non
   tes ningún, `/join` cámbiate de inmediato sen preguntar. Se o código
   ao que te unes pertence a un evento que se pechou porque o seu
   administrador anterior o deixou sen ninguén elixible para tomar o
   relevo, `/join` reábreo e convírtete no seu administrador en vez de
   rexeitar o código.
3. Cando atopas un valor, simplemente envías a súa posición e o valor:
   `6 GLYPH` reporta que a posición 6 (a palabra) é `GLYPH`; `7 3`
   reporta que a posición 7 é o número `3`. Non fai falta lembrar ningún
   comando. As letras móstranse en maiúsculas, pero podes escribilas
   como queiras.
4. O bot mantén unha única mensaxe por participante actualizada co
   estado actual do passcode, editándoa cada vez que alguén reporta algo
   novo — non inunda o chat cunha mensaxe nova por cada reporte.
5. Se dúas persoas distintas reportan valores distintos para a mesma
   posición, ambos se conservan: o bot mostra cada posible passcode
   completo nun bloque doado de copiar, con cantas persoas o respaldan
   — e, nos menos respaldados, quen os reportou, para que quen administra
   o evento poida detectar un erro ou un troll. Se o que envías non
   encaixa coa posición esperada, ou contradí o que **outra persoa** xa
   reportou, o bot pídeche confirmación antes de rexistralo. Corrixir o
   teu **propio** reporte anterior é distinto: non fai falta
   confirmación, o teu valor anterior nesa posición substitúese
   directamente — e o bot dille cal era ese valor anterior, por se a
   propia corrección foi un erro e queres volver enviala. Se era o único
   que mantiña unha discrepancia, a discrepancia desaparece ao instante.
   Enviaches un valor á posición equivocada, ou aínda non a coñeces de
   verdade? Envía só o número de posición, sen nada despois (ou
   `/submit <posición>`), para eliminar o teu reporte nesa posición —
   sen confirmación, e o bot dille que valor eliminou por se tamén o
   queres desfacer.
6. Quen administra o evento resolve unha discrepancia con `/resolve
   <posición> <valor>` — ou, escrito só como `/resolve <posición>`, o
   bot lista os valores reportados para esa posición con cantas persoas
   respaldan cada un — e, se algún deses apoios é de confianza, cantos o
   son — e mostra un botón por valor (o máis respaldado primeiro) para
   resolvela cun só toque. Escribir `/resolve` só, sen argumentos,
   repasa en cambio todas as posicións aínda en discrepancia unha por
   unha: ao resolver a que se mostra cos seus botóns, o bot envía
   decontado a seguinte, ata que avisa de que xa non queda ningunha. Ese
   aviso nunca ofrece un atallo para pechar o evento, aínda que nese
   momento todas as posicións xa teñan un valor establecido — que quen
   reporta estea de acordo entre si non é o mesmo que o passcode
   funcione de verdade, así que o bot remite quen administra a `/verify`
   (ver máis abaixo). Quen administra o evento tamén pode marcar un
   participante como de confianza ou como troll se fai falta. Marcar
   alguén como troll, só para ese evento, descarta o resto das súas
   achegas e deixa de enviarlle actualizacións — tampouco recibirá o
   passcode final cando se peche o evento.

   Cando só quedan poucas posicións en discrepancia, pode ser máis
   rápido probar directamente algúns dos bloques de passcode
   renderizados na pantalla de canxeo do xogo. Unha vez que un deles se
   confirma correcto alí, quen administra o evento pégao de volta con
   `/verify <passcode>` e o bot descobre, para todas as posicións á vez,
   que valor reportado o produciu.
7. `/verify <passcode>` é a **única** forma de completar e pechar un
   evento — non existe un comando separado para "pechar". Aínda que
   todas as posicións xa coincidan, ese acordo non se comprobou contra o
   propio xogo, así que quen administra debe copiar un passcode
   candidato, pegalo na tenda, confirmar que se acepta, e pegar ese
   mesmo passcode en `/verify`. Unha vez que coincide, o bot resolve
   todas as posicións a partir del e envía o passcode final como unha
   mensaxe **nova** a todos os participantes — non só unha edición —
   para que a ninguén se lle escape aínda que non o estivese seguindo
   activamente.

### Referencia de comandos

| Comando | Quen o pode usar | Que fai |
|---|---|---|
| `/start`, `/help` | calquera | Introdución e lista de comandos. |
| `/language <código>` | calquera | Establece o teu idioma (`en`, `ca`, `es`, `fr`, `gl`, `eu`). |
| `/newevent <nome> [\| <patrón>]` | calquera | Crea un novo evento IFS e obtén o seu código de acceso; únete automaticamente e márcate como de confianza. Aquí o `\|` separa o nome do patrón, non significa "escolle un ou o outro" — p. ex. `/newevent Barcelona 2026-08 \| XXX99*999XX`. Pide confirmación primeiro se o teu evento actual aínda non está resolto (dicir que non non crea nada); ese traspásase antes, igual que faría `/leave`. |
| `/sharetext [código] [idioma]` | calquera | Obtén un texto listo para compartir convidando a unirse. `código` por defecto é o teu evento actual, `idioma` o teu propio — xa se envía automaticamente unha vez desde `/newevent`. |
| `/join <código>` | calquera | Únete a un evento — pide confirmación só se o teu evento actual aínda non está resolto, traspasándoo se o administrabas; omítese se non tes ningún ou xa está pechado. Un código pechado sen administrador reábrese baixo o teu cargo en vez de rexeitarse. |
| `/leave` | participante | Sae do evento actual. Se es quen o administra, outro participante asume o rol automaticamente (priorizando os de confianza e, se non, quen máis achegase), ou péchase como inacabado se non hai ninguén apto — o mesmo traspaso ocorre se sas creando ou uníndote a outro evento en vez de facer `/leave`. |
| `/current` | calquera | Mostra o evento actual: nome, código, patrón, número de participantes e quen o administra. |
| `<posición> <valor>` (ou `/submit <posición> <valor>`) | participante | Reporta o valor atopado nunha posición. |
| `<posición>` soa (ou `/submit <posición>`) | participante | Elimina o teu propio reporte nesa posición, se existe. |
| `/status` | participante | Mostra o estado actual do passcode cando queiras; ademais traslada as próximas actualizacións en directo a esta nova mensaxe, por se a anterior quedou moi arriba na conversa. |
| `/resolve <posición> [<valor \| @usuario>]` | administrador do evento | Escolle o valor correcto cando hai discrepancia; sen valor, lista os valores reportados (co desglose de apoios de confianza) como botóns para resolver. |
| `/resolve` (sen argumentos) | administrador do evento | Repasa todas as posicións aínda en discrepancia, unha por unha; cando xa non queda ningunha, remite a `/verify` — o consenso por si só nunca pecha o evento. |
| `/unresolve <posición>` | administrador do evento | Reabre unha posición resolta. |
| `/trust <usuario>` | administrador do evento | Marca un participante como de confianza, para que o seu apoio se destaque na lista de candidatos de `/resolve`. |
| `/troll <usuario>` | administrador do evento | Descarta as achegas dun participante e deixa de actualizalo (só este evento). |
| `/untrust <usuario>` | administrador do evento | Quita a marca de confianza a un participante; se estaba marcado troll, tamén lle actualiza a mensaxe de estado de golpe. |
| `/kick <usuario>` | administrador do evento | Expulsa a un participante do evento. |
| `/promote <usuario>` | administrador do evento | Cede o rol de administrador a outro participante xa unido ao evento; tamén o marca de confianza, igual que `/newevent` fai con quen crea o evento. |
| `/claim` | participante | Intenta asumir o cargo de administrador se o actual leva 30+ minutos inactivo; ten 5 minutos para aceptalo, rexeitalo ou non responder antes de que se faga efectivo. |
| `/verify <passcode>` | administrador do evento | A única forma de pechar un evento: pega un passcode confirmado correcto na pantalla de canxeo do xogo; resolve todas as posicións a partir del á vez, conxela o evento e anuncia o passcode final a todos. |
| `/events` | calquera | Lista todos os eventos nos que participaches, actuais ou pasados. |

Cada xogador ve as mensaxes do bot no seu propio idioma, establecido
unha vez con `/language` e lembrado a partir de entón.

## Estado do proxecto

**En marcha**, en [`@ifs_relay_bot`](https://t.me/ifs_relay_bot) en
Telegram. Todos os comandos descritos arriba están implementados e
despregados. Consulta [`CLAUDE.md`](CLAUDE.md) (en inglés) para o
deseño técnico completo (modelo de datos, algoritmo de resolución de
conflitos, arquitectura de internacionalización) se queres contribuír.

## Arquitectura

- **Runtime:** Cloudflare Workers, recibindo as actualizacións de
  Telegram vía webhook.
- **Framework do bot:** [grammY](https://grammy.dev).
- **Base de datos:** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Linguaxe:** TypeScript.
- **Dominio:** `ifspasscoderelay.grifwl.blue`.

## Guía de instalación

Estes son pasos que se fan unha soa vez para erguer a infraestrutura do
bot — unha vez para todo o proxecto, non unha vez por IFS. Os pasos 1, 3
e 4 non requiren que exista aínda o código da aplicación; os pasos 2 e 5
precisan un Worker despregado, así que van ao final, en canto empece a
implementación.

### 1. Crear o bot de Telegram

1. Abre unha conversa con [@BotFather](https://t.me/BotFather) en
   Telegram.
2. Envía `/newbot`, escolle un nome para mostrar e un nome de usuario
   único rematado en `bot` (p.ex. `IfsPasscodeRelayBot`).
3. BotFather responde cun **token do bot** — trátao como un contrasinal
   (quen o teña pode enviar mensaxes facéndose pasar polo bot).
   Gárdase como segredo de Cloudflare no paso 4; nunca se sobe a este
   repositorio.
4. Aínda falando con BotFather, configura o perfil público do bot:
   - `/setuserpic` — sube unha imaxe de perfil.
   - `/setdescription` — a descrición longa que se mostra na pantalla
     baleira do chat, antes de que ninguén falase con el.
   - `/setabouttext` — a biografía curta da páxina de perfil.
   - `/setjoingroups` → *Disable*. O bot está pensado para chats
     privados 1 a 1 — a mensaxe de estado en directo de cada
     participante edítase in situ, o cal só ten sentido nun chat con el
     e o bot a soas — así que o uso en grupos queda desactivado.

   Non fai falta `/setcommands`: o bot rexistra a súa propia lista de
   comandos directamente desde o código, vía o `setMyCommands` da Bot
   API, así que Telegram mostra as suxestións de autocompletado
   automaticamente e nunca se poden desincronizar dunha lista mantida
   a man en BotFather.

#### Descrición e texto "about" suxeridos

Establece primeiro a versión en inglés con `/setdescription` e
`/setabouttext` — é a que usa BotFather como alternativa para calquera
idioma de cliente de Telegram sen tradución propia. Despois, desde os
mesmos menús, engade as versións `ca`/`es`/`fr`/`gl`/`eu` de abaixo
como descricións por idioma.

| Idioma | `/setdescription` (longa) | `/setabouttext` (curta) |
|---|---|---|
| `en` | Collaboratively build your Ingress First Saturday event's redeemable passcode in real time. Report the character you found and its position — the bot keeps everyone's passcode in sync, flags disagreements, and announces the final result. Available in English, Català, Castellano, Français, Galego and Euskara. Send /help to start, or /newevent to create one for your IFS. | Real-time collaborative passcode relay for Ingress First Saturday events. |
| `ca` | Construeix en temps real, de manera col·laborativa, el passcode bescanviable del teu esdeveniment Ingress First Saturday. Reporta el caràcter que has trobat i la seva posició — el bot manté el passcode sincronitzat per a tothom, marca les discrepàncies i anuncia el resultat final. Disponible en català, anglès, castellà, francès, gallec i basc. Envia /help per començar, o /newevent per crear-ne un pel teu IFS. | Relleu col·laboratiu en temps real del passcode d'un Ingress First Saturday. |
| `es` | Construye en tiempo real, de forma colaborativa, el passcode canjeable de tu evento Ingress First Saturday. Reporta el carácter que has encontrado y su posición — el bot mantiene el passcode sincronizado para todos, marca las discrepancias y anuncia el resultado final. Disponible en español, inglés, catalán, francés, gallego y euskera. Envía /help para empezar, o /newevent para crear uno para tu IFS. | Relevo colaborativo en tiempo real del passcode de un Ingress First Saturday. |
| `fr` | Construisez en temps réel, de façon collaborative, le passcode échangeable de votre événement Ingress First Saturday. Signalez le caractère trouvé et sa position — le bot garde le passcode synchronisé pour tout le monde, signale les désaccords et annonce le résultat final. Disponible en français, anglais, catalan, espagnol, galicien et basque. Envoyez /help pour commencer, ou /newevent pour en créer un pour votre IFS. | Relais collaboratif en temps réel du passcode d'un Ingress First Saturday. |
| `gl` | Constrúe en tempo real, de forma colaborativa, o passcode canxeable do teu evento Ingress First Saturday. Reporta o carácter que atopaches e a súa posición — o bot mantén o passcode sincronizado para todos, marca as discrepancias e anuncia o resultado final. Dispoñible en galego, inglés, catalán, castelán, francés e éuscaro. Envía /help para empezar, ou /newevent para crear un para o teu IFS. | Relevo colaborativo en tempo real do passcode dun Ingress First Saturday. |
| `eu` | Osatu denbora errealean, elkarlanean, zure Ingress First Saturday ekitaldiaren pasakode kanjeagarria. Jakinarazi aurkitu duzun karakterea eta bere posizioa — botak guztien pasakodea sinkronizatuta mantentzen du, desadostasunak markatzen ditu eta azken emaitza iragartzen du. Euskaraz, ingelesez, katalanez, gaztelaniaz, frantsesez eta galizieraz eskuragarri. Bidali /help hasteko, edo /newevent zure IFS-rako bat sortzeko. | Ingress First Saturday ekitaldien pasakode-errelebo kolaboratiboa, denbora errealean. |

### 2. Crear o Worker de Cloudflare e a base de datos D1

Precisa unha conta de Cloudflare coa zona `grifwl.blue` xa engadida, e
[wrangler](https://developers.cloudflare.com/workers/wrangler/)
instalado (`npm install -g wrangler`, ou usar `npx wrangler`).

1. `wrangler login` para autenticar a CLI.
2. `wrangler d1 create ifs-passcode-relay` crea a base de datos D1 e
   mostra un `database_id` — gárdao, irá ao binding
   `[[d1_databases]]` (chamado `DB`) de `wrangler.toml` en canto exista
   o código.
3. En canto exista o esqueleto da aplicación, `wrangler deploy` publica
   o Worker por primeira vez.

### 3. Asignar o subdominio

O bot vive en **`ifspasscoderelay.grifwl.blue`**. Como a zona
`grifwl.blue` xa está na mesma conta de Cloudflare que se usa para
despregar, non fai falta ningún paso manual no panel — decláraseo como
[Custom
Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
directamente en `wrangler.toml`:

```toml
routes = [
  { pattern = "ifspasscoderelay.grifwl.blue", custom_domain = true }
]
```

`wrangler deploy` aprovisiona entón o rexistro DNS e o certificado TLS
automaticamente. O panel só fai falta como alternativa se a zona
necesita algunha vez atención manual (p.ex. se resulta que vive nunha
conta de Cloudflare distinta daquela coa que `wrangler` iniciou
sesión).

### 4. Publicar o token do bot como segredo

1. `wrangler secret put BOT_TOKEN` e pega o token do paso 1 cando se
   solicite — isto gárdao cifrado en Cloudflare, exposto ao Worker como
   `env.BOT_TOKEN`, e nunca se sobe ao repositorio.
2. Para o desenvolvemento local, pon o mesmo valor en `.dev.vars` (xa
   excluído de git) como `BOT_TOKEN=...`.
3. Xera tamén unha cadea aleatoria para usar como segredo do webhook
   (p.ex. `openssl rand -hex 32`) e gárdaa do mesmo xeito, como
   `TELEGRAM_WEBHOOK_SECRET` — o Worker úsaa para rexeitar calquera
   petición que non veña realmente de Telegram (ver o paso 5).

### 5. Apuntar Telegram cara ao Worker (webhook)

Unha vez que o Worker estea despregado e accesible na súa URL pública:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ifspasscoderelay.grifwl.blue/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Telegram incluirá entón ese mesmo segredo na cabeceira
`X-Telegram-Bot-Api-Secret-Token` de cada actualización que envíe; o
Worker debe comprobar que coincide antes de procesar nada, e rexeitar a
petición se non é así — isto é o que evita que calquera outro poida
enviar actualizacións falsas á URL pública do webhook. Comproba que o
webhook está rexistrado con:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### 6. Configurar o panel privado de administración

Hai un panel privado, de só lectura, en `/admin` (p.ex.
`https://ifspasscoderelay.grifwl.blue/admin`), para inspeccionar os
datos en directo de D1 sen abrir unha sesión interactiva de `wrangler
d1 execute`. Está protexido con contrasinal, e os datos que pertencen a
un evento concreto (participantes, reportes, candidatos, resolucións,
marcas de confianza, negociacións de `/claim`) só se mostran unha vez
escolles un no despregable — as táboas globais (eventos, usuarios,
palabras coñecidas, creacións de evento pendentes) sempre se ven. Nada
se actualiza só: cada vista é unha instantánea do momento en que a
cargaches ou actualizaches por última vez, cun botón de actualizar
manual para volver consultar cando queiras.

1. Xera un contrasinal e unha clave de sinatura aleatoria separada para
   as súas cookies de sesión (p.ex. `openssl rand -hex 24` para o
   contrasinal, `openssl rand -hex 32` para a clave), e publica ambas
   igual que o token do bot: `wrangler secret put
   ADMIN_DASHBOARD_PASSWORD` e `wrangler secret put
   ADMIN_SESSION_SECRET`.
2. Para o desenvolvemento local, engade os mesmos dous valores a
   `.dev.vars` como `ADMIN_DASHBOARD_PASSWORD=...` e
   `ADMIN_SESSION_SECRET=...`.

## Licenza

MIT.
