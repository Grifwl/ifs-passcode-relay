<!-- Languages: [English](README.md) | [Català](README.ca.md) | Castellano | [Français](README.fr.md) -->

# IFS Passcode Relay

Un bot de Telegram que permite a los asistentes a un evento
**Ingress First Saturday (IFS)** construir colaborativamente, en tiempo
real, el passcode canjeable del evento.

**Idiomas:** [English](README.md) · [Català](README.ca.md) · Castellano · [Français](README.fr.md)

## ¿Qué es esto?

Ingress First Saturday es un evento presencial recurrente del juego móvil
[Ingress](https://ingress.com). Durante el evento, se muestran a los
jugadores las imágenes de una serie de portales; visitarlos sobre el
terreno e inspeccionar su contenido multimedia revela un carácter.
Concatenando los caracteres en el orden correcto se obtiene un passcode
canjeable en la tienda del juego por un paquete de objetos del IFS.

Puede haber varios IFS en marcha a la vez, cada uno con su propio
passcode. Este bot permite a todos los asistentes a un IFS concreto
reportar qué carácter han encontrado y en qué posición corresponde, y
mantiene una vista compartida y en vivo del código a medida que se
completa — sin tener que recopilar capturas de pantalla manualmente en un
grupo de chat.

## Cómo funciona, desde el punto de vista de un jugador

1. Quien organiza el relevo de passcode de un IFS crea un evento con
   `/newevent` y obtiene un código corto para compartir con los
   asistentes (por ejemplo, en un grupo de WhatsApp). Por defecto, se da
   por hecho que el passcode sigue el patrón `XXX99*999XX` (tres letras,
   dos números, una palabra entera, tres números, dos letras) — quien
   crea el evento puede establecer otro patrón si ese IFS usa otro
   formato.
2. Cada asistente envía `/join <código>` al bot. Un agente solo puede
   estar contribuyendo activamente a un evento a la vez.
3. Cuando encuentras un valor, simplemente envías su posición y el
   valor: `6 CIPHER` reporta que la posición 6 (la palabra) es `CIPHER`;
   `7 3` reporta que la posición 7 es el número `3`. No hace falta
   recordar ningún comando. Las letras se muestran en mayúsculas, pero
   las puedes escribir como quieras.
4. El bot mantiene un único mensaje por participante actualizado con el
   estado actual del código, editándolo cada vez que alguien reporta
   algo nuevo — no inunda el chat con un mensaje nuevo por cada reporte.
5. Si dos personas reportan valores distintos para la misma posición,
   ambos se conservan: el bot muestra cada posible código completo en un
   bloque fácil de copiar, con cuántas personas lo respaldan — y, en los
   menos respaldados, quién los ha reportado, para que quien ha creado
   el evento pueda detectar un error o un troll. Si lo que envías no
   encaja con la posición esperada, o contradice lo que ya hay, el bot
   te pide confirmación antes de registrarlo.
6. Quien ha creado el evento resuelve una discrepancia con `/resolve`, y
   puede marcar a un participante como de confianza o como troll si hace
   falta. Marcar a alguien como troll, solo para ese evento, descarta el
   resto de sus aportaciones y deja de enviarle actualizaciones —
   tampoco recibirá el passcode final cuando se cierre el evento.
7. Cuando el evento termina, quien lo ha creado lo cierra con
   `/closeevent`, que envía el passcode final como un mensaje **nuevo**
   a todos los participantes — no solo una edición — para que a nadie se
   le escape aunque no lo haya estado siguiendo activamente.

### Referencia de comandos

| Comando | Quién puede usarlo | Qué hace |
|---|---|---|
| `/start`, `/help` | cualquiera | Introducción y lista de comandos. |
| `/language <código>` | cualquiera | Establece tu idioma (`en`, `ca`, `es`, `fr`). |
| `/newevent <nombre> [\| <patrón>]` | cualquiera | Crea un nuevo evento IFS y obtiene su código de acceso. |
| `/sharetext <código> [idioma]` | cualquiera | Obtiene un texto listo para compartir invitando a unirse, opcionalmente en un idioma distinto del tuyo. |
| `/join <código>` | cualquiera | Únete a un evento. |
| `/leave` | participante | Sal del evento actual. |
| `/myevent` | cualquiera | Muestra en qué evento estás, si hay alguno. |
| `<posición> <valor>` (o `/submit <posición> <valor>`) | participante | Reporta el valor encontrado en una posición. |
| `/status` (o `/code`) | participante | Muestra el estado actual del código cuando quieras. |
| `/resolve <posición> <valor \| @usuario>` | creador del evento | Elige el valor correcto cuando hay discrepancia. |
| `/unresolve <posición>` | creador del evento | Reabre una posición resuelta. |
| `/trust <usuario>` | creador del evento | Marca a un participante como de confianza. |
| `/troll <usuario>` | creador del evento | Descarta las aportaciones de un participante y deja de actualizarlo (solo este evento). |
| `/untrust <usuario>` | creador del evento | Quita la marca de confianza a un participante. |
| `/kick <usuario>` | creador del evento | Expulsa a un participante del evento. |
| `/closeevent` | creador del evento | Congela el evento y anuncia el código final a todos. |
| `/events` | cualquiera | Lista los eventos que has creado. |

Cada jugador ve los mensajes del bot en su propio idioma, establecido una
vez con `/language` y recordado a partir de entonces.

## Estado del proyecto

Este proyecto está actualmente en **fase de diseño**. El modelo de
interacción descrito arriba está cerrado, pero todavía no se ha escrito
código de la aplicación. Consulta [`CLAUDE.md`](CLAUDE.md) (en inglés)
para el diseño técnico completo (modelo de datos, algoritmo de
resolución de conflictos, arquitectura de internacionalización) si
quieres contribuir.

## Arquitectura (prevista)

- **Runtime:** Cloudflare Workers, recibiendo las actualizaciones de
  Telegram vía webhook.
- **Framework del bot:** [grammY](https://grammy.dev).
- **Base de datos:** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Lenguaje:** TypeScript.
- **Dominio:** un subdominio de `grifwl.blue` (por decidir).

## Guía de instalación

Estos son pasos que se hacen una sola vez para levantar la
infraestructura del bot — una vez para todo el proyecto, no una vez por
IFS. Los pasos 1, 3 y 4 no requieren que exista aún el código de la
aplicación; los pasos 2 y 5 necesitan un Worker desplegado, así que van
al final, en cuanto empiece la implementación.

### 1. Crear el bot de Telegram

1. Abre una conversación con [@BotFather](https://t.me/BotFather) en
   Telegram.
2. Envía `/newbot`, elige un nombre para mostrar y un nombre de usuario
   único terminado en `bot` (p.ej. `IfsPasscodeRelayBot`).
3. BotFather responde con un **token del bot** — trátalo como una
   contraseña (quien lo tenga puede enviar mensajes haciéndose pasar por
   el bot). Se guarda como secreto de Cloudflare en el paso 4; nunca se
   sube a este repositorio.
4. Todavía hablando con BotFather, configura el perfil público del bot:
   - `/setuserpic` — sube una imagen de perfil.
   - `/setdescription` — la descripción larga que se muestra en la
     pantalla vacía del chat, antes de que nadie haya hablado con él.
   - `/setabouttext` — la biografía corta de la página de perfil.
   - `/setcommands` — pega la lista de comandos (ver la tabla de
     referencia más arriba) para que Telegram los autocomplete al
     escribir; hay que mantenerla sincronizada cada vez que se añada o
     se quite un comando.
   - `/setjoingroups` → *Disable*. El bot está pensado para chats
     privados 1 a 1 — el mensaje de estado en vivo de cada participante
     se edita in situ, lo cual solo tiene sentido en un chat con él y el
     bot a solas — así que el uso en grupos queda desactivado.

### 2. Crear el Worker de Cloudflare y la base de datos D1

Requiere una cuenta de Cloudflare con la zona `grifwl.blue` ya añadida, y
[wrangler](https://developers.cloudflare.com/workers/wrangler/)
instalado (`npm install -g wrangler`, o usar `npx wrangler`).

1. `wrangler login` para autenticar la CLI.
2. `wrangler d1 create ifs-passcode-relay` crea la base de datos D1 y
   muestra un `database_id` — guárdalo, irá al binding
   `[[d1_databases]]` (llamado `DB`) de `wrangler.toml` en cuanto exista
   el código.
3. En cuanto exista el esqueleto de la aplicación, `wrangler deploy`
   publica el Worker por primera vez.

### 3. Asignar el subdominio

1. En el panel de Cloudflare, dentro de la zona `grifwl.blue`, añade el
   subdominio elegido (p.ej. `ifs.grifwl.blue` — nombre exacto aún por
   decidir) como [Custom
   Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
   del Worker (preferible a una simple Worker Route).
2. De forma equivalente, se puede declarar en `wrangler.toml` con una
   entrada `routes` usando `custom_domain = true` para ese hostname,
   aplicada en el siguiente `wrangler deploy`.

### 4. Publicar el token del bot como secreto

1. `wrangler secret put BOT_TOKEN` y pega el token del paso 1 cuando se
   solicite — esto lo guarda cifrado en Cloudflare, expuesto al Worker
   como `env.BOT_TOKEN`, y nunca se sube al repositorio.
2. Para el desarrollo local, pon el mismo valor en `.dev.vars` (ya
   excluido de git) como `BOT_TOKEN=...`.
3. Genera también una cadena aleatoria para usar como secreto del
   webhook (p.ej. `openssl rand -hex 32`) y guárdala de la misma manera,
   como `TELEGRAM_WEBHOOK_SECRET` — el Worker la usa para rechazar
   cualquier petición que no venga realmente de Telegram (ver el paso
   5).

### 5. Apuntar Telegram hacia el Worker (webhook)

Una vez el Worker esté desplegado y accesible en su URL pública:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<subdominio>/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Telegram incluirá entonces ese mismo secreto en la cabecera
`X-Telegram-Bot-Api-Secret-Token` de cada actualización que envíe; el
Worker debe comprobar que coincide antes de procesar nada, y rechazar la
petición si no es así — esto es lo que evita que cualquier otro pueda
enviar actualizaciones falsas a la URL pública del webhook. Comprueba que
el webhook está registrado con:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

## Licencia

MIT.
