<!-- Languages: [English](README.md) | [Català](README.ca.md) | [Castellano](README.es.md) | [Français](README.fr.md) | [Galego](README.gl.md) | [Euskara](README.eu.md) | Português | [Italiano](README.it.md) | [Deutsch](README.de.md) -->

# IFS Passcode Relay

Um bot de Telegram que permite aos participantes de um evento
**Ingress First Saturday (IFS)** montar colaborativamente, em tempo
real, o passcode resgatável do evento.

**Idiomas:** [English](README.md) · [Català](README.ca.md) · [Castellano](README.es.md) · [Français](README.fr.md) · [Galego](README.gl.md) · [Euskara](README.eu.md) · Português · [Italiano](README.it.md) · [Deutsch](README.de.md)

## O que é isso?

Ingress First Saturday é um evento presencial recorrente do jogo para
celular [Ingress](https://ingress.com). Durante o evento, os jogadores
recebem as imagens de um conjunto de portais; visitá-los no local e
examinar sua mídia revela um caractere. Concatenando os caracteres na
ordem certa, obtém-se um passcode resgatável na loja do jogo por um
pacote de itens do IFS.

Vários eventos IFS podem acontecer ao mesmo tempo, cada um com seu
próprio passcode. Este bot permite que todos os participantes de um IFS
específico reportem o caractere que encontraram e a posição
correspondente, e mantém uma visão compartilhada e ao vivo do passcode
conforme ele é preenchido — sem mais coletar capturas de tela
manualmente em um grupo de chat.

## Como funciona, do ponto de vista de um jogador

1. Quem organiza o revezamento de passcode de um determinado IFS cria um
   evento com `/newevent` e obtém um código curto para compartilhar com
   os participantes (por exemplo, em um grupo do WhatsApp) — o bot envia
   imediatamente uma mensagem de convite pronta para colar com esse
   código, e quem cria o evento entra nele automaticamente — como seu
   administrador — já que ser o organizador não o isenta de também
   caçar portais. Ele também começa marcado como de confiança para o
   seu próprio evento, do mesmo jeito que `/trust` marcaria qualquer
   outra pessoa. Por padrão, espera-se que o passcode siga o padrão
   `XXX99*999XX` (três letras, dois dígitos, uma palavra inteira, três
   dígitos, duas letras) — quem cria pode definir um padrão diferente se
   aquele IFS usar outro formato. O nome do evento não precisa ser
   único: executar `/newevent` duas vezes com o mesmo nome exato não é
   um erro, apenas cria dois eventos separados com dois códigos de
   acesso diferentes. Como os participantes só veem o nome ao escolher
   qual código seguir, torne-o específico o suficiente para distinguir
   eventos IFS com o mesmo nome — ex. `/newevent Barcelona 2026-08`,
   incluindo o ano e o mês, em vez de um simples `/newevent Barcelona`
   que colide com qualquer outro IFS de Barcelona. Se você já está em
   outro evento ainda não resolvido (não encerrado), é pedida
   confirmação primeiro — quer você o administre ou não — já que criar
   este deixa aquele para trás; recusar não cria nada. Se aquele evento
   já estava encerrado, ou você não estava em nenhum, ele é criado
   imediatamente sem perguntar. De qualquer forma, se você administrava
   o que deixou, o papel é repassado primeiro, do mesmo jeito que
   `/leave` faria (ver passo 6 abaixo).
2. Cada outro participante envia `/join <código>` ao bot, que também o
   convida a executar `/sharetext` caso queira ajudar a divulgar
   também. Um agente só pode estar contribuindo ativamente para um
   evento por vez, então entrar em um diferente enquanto o atual ainda
   não está resolvido pede confirmação da troca primeiro — e, se você
   administrava aquele outro, repassa o papel do mesmo jeito. Se seu
   evento atual já está encerrado, ou você não tem nenhum, `/join` troca
   você imediatamente sem perguntar. Se o código ao qual você está
   entrando pertence a um evento que foi encerrado porque seu
   administrador anterior saiu sem ninguém elegível para assumir,
   `/join` o reabre e faz de você seu administrador em vez de rejeitar o
   código.
3. Quando você encontra um valor, basta enviar sua posição e o valor: `6
   GLYPH` reporta que a posição 6 (a palavra) é `GLYPH`; `7 3` reporta
   que a posição 7 é o dígito `3`. Não precisa lembrar nenhum comando.
   As letras são mostradas em maiúsculas, mas você pode digitá-las como
   quiser.
4. O bot mantém uma única mensagem por participante atualizada com o
   estado atual do passcode, editando-a no lugar toda vez que alguém
   reporta algo novo — ele não enche o chat com uma mensagem nova a cada
   report.
5. Se duas pessoas diferentes reportarem valores diferentes para a
   mesma posição, ambos são mantidos: o bot mostra cada possível
   passcode completo resultante em seu próprio bloco fácil de copiar,
   com quantas pessoas apoiam cada um — e, para os menos apoiados, quem
   os reportou, para que o administrador do evento possa identificar um
   erro ou um troll. Se o que você envia não corresponde à posição
   esperada, ou contradiz o que **outra pessoa** já reportou, o bot pede
   que você confirme antes de registrar. Corrigir seu **próprio** report
   anterior é diferente: não precisa de confirmação, seu valor anterior
   ali é simplesmente substituído — e o bot diz qual era esse valor
   anterior, caso a própria correção tenha sido um erro e você queira
   reenviá-lo. Se aquele valor antigo era a única coisa mantendo uma
   posição em discrepância, a discrepância se resolve sozinha na hora.
   Enviou um valor para a posição errada, ou ainda não sabe de verdade?
   Envie apenas o número da posição sem nada depois (ou
   `/submit <posição>`) para remover seu próprio report ali — sem
   confirmação, e o bot nomeia o valor que removeu para que você também
   possa desfazer isso se precisar.
6. O administrador do evento resolve uma discrepância com `/resolve
   <posição> <valor>` — ou, executado apenas como `/resolve <posição>`,
   o bot lista os valores reportados para aquela posição com quantas
   pessoas apoiam cada um — e, se algum desses apoiadores estiver
   marcado como de confiança, quantos deles — e mostra um botão por
   valor (mais apoiado primeiro) para resolver com um único toque.
   Executar `/resolve` sozinho, sem argumentos, percorre em vez disso
   todas as posições ainda em discrepância uma a uma: resolva a que é
   mostrada por meio de seus botões e o bot envia imediatamente a
   próxima, até avisar que não sobrou mais nenhuma. Essa mensagem nunca
   oferece um atalho para encerrar o evento, mesmo que toda posição já
   tenha um valor definido até então — reportadores concordando entre si
   não é o mesmo que o passcode realmente funcionar, então o bot aponta
   o administrador para `/verify` (veja abaixo). O administrador também
   pode marcar um participante como de confiança ou como troll, se
   necessário. Marcar alguém como troll, só para aquele evento, descarta
   o resto dos reports dele e para de enviar-lhe mais atualizações —
   incluindo o passcode final quando o evento se encerra.

   Quando restam apenas algumas posições em discrepância, pode ser mais
   rápido simplesmente testar alguns dos blocos de passcode renderizados
   diretamente na tela de resgate do jogo. Assim que um deles é
   confirmado correto ali, o administrador o cola de volta com
   `/verify <passcode>` e o bot descobre, para todas as posições de uma
   vez, qual valor reportado o produziu.
7. `/verify <passcode>` é a **única** forma de completar e encerrar um
   evento — não existe um comando separado para "encerrar". Mesmo que
   todas as posições já concordem, essa concordância não foi testada
   contra o próprio jogo, então o administrador precisa copiar um
   passcode candidato, colá-lo na loja, confirmar que foi aceito, e
   colar esse mesmo passcode exato em `/verify`. Assim que corresponder,
   o bot resolve todas as posições a partir dele e envia o passcode
   final como uma mensagem **nova** a todos os participantes — não
   apenas uma edição — para que ninguém perca, mesmo que não estivesse
   acompanhando ativamente.

### Referência de comandos

| Comando | Quem pode usar | O que faz |
|---|---|---|
| `/start`, `/help` | qualquer um | Introdução e lista de comandos. |
| `/language <código>` | qualquer um | Define seu próprio idioma (`en`, `ca`, `es`, `fr`, `gl`, `eu`, `pt`, `it`, `de`). |
| `/newevent <nome> [\| <padrão>]` | qualquer um | Cria um novo evento IFS e obtém seu código de acesso; entra automaticamente e marca você como de confiança. O `\|` aqui separa o nome do padrão, não significa "escolha um ou outro" — ex. `/newevent Barcelona 2026-08 \| XXX99*999XX`. Pede confirmação primeiro se seu evento atual ainda não estiver resolvido (recusar não cria nada); esse é repassado primeiro, do mesmo jeito que `/leave`. |
| `/sharetext [código] [idioma]` | qualquer um | Obtém um texto pronto para colar convidando pessoas a entrar. `código` usa por padrão seu evento atual, `idioma` o seu — já enviado automaticamente uma vez por `/newevent`. |
| `/join <código>` | qualquer um | Entra em um evento — pede confirmação primeiro só se seu evento atual ainda não estiver resolvido, repassando-o se você o administrava; pulado se você não tiver nenhum ou já estiver encerrado. Um código encerrado sem administrador reabre sob você em vez de ser rejeitado. |
| `/leave` | participante | Sai do seu evento atual. Se você é o administrador, outro participante assume o papel automaticamente (preferindo os de confiança, depois quem mais contribuiu), ou o evento é encerrado como inacabado se ninguém for elegível — o mesmo repasse acontece se você sair criando ou entrando em outro evento em vez disso. |
| `/current` | qualquer um | Mostra o evento atual: nome, código de acesso, padrão, número de participantes e administrador atual. |
| `<posição> <valor>` (ou `/submit <posição> <valor>`) | participante | Reporta o valor encontrado em uma posição. |
| `<posição>` sozinha (ou `/submit <posição>`) | participante | Remove seu próprio report nessa posição, se houver. |
| `/status` | participante | Mostra o estado atual do passcode quando quiser; também move as próximas atualizações ao vivo para esta nova mensagem, caso a anterior tenha subido muito na conversa. |
| `/resolve <posição> [<valor \| @usuário>]` | administrador do evento | Escolhe o valor correto quando há discrepância; sem valor, lista os valores reportados (com o detalhamento de apoios de confiança) como botões para resolver. |
| `/resolve` (sem argumentos) | administrador do evento | Percorre todas as posições ainda em discrepância, uma a uma; quando não sobrar nenhuma, aponta para `/verify` — consenso sozinho nunca encerra o evento. |
| `/unresolve <posição>` | administrador do evento | Reabre uma posição resolvida. |
| `/trust <usuário>` | administrador do evento | Marca um participante como de confiança, para que seu apoio seja destacado na listagem de candidatos do `/resolve`. |
| `/troll <usuário>` | administrador do evento | Descarta os reports de um participante e para de atualizá-lo (só neste evento). |
| `/untrust <usuário>` | administrador do evento | Limpa a marca de confiança de um participante; se ele havia sido marcado como troll, também o atualiza com uma nova mensagem de status. |
| `/kick <usuário>` | administrador do evento | Remove um participante do evento. |
| `/promote <usuário>` | administrador do evento | Passa o papel de administrador a outro participante já no evento; ele também é marcado como de confiança, do mesmo jeito que `/newevent` faz com seu próprio administrador. |
| `/claim` | participante | Tenta assumir o papel de administrador se o atual está quieto há mais de 30 minutos; ele tem 5 minutos para aceitar, recusar ou não responder antes que aconteça. |
| `/verify <passcode>` | administrador do evento | A única forma de encerrar um evento: cole um passcode confirmado correto na tela de resgate do jogo; resolve todas as posições a partir dele de uma vez, congela o evento e anuncia o passcode final a todos. |
| `/events` | qualquer um | Lista todos os eventos dos quais você participou, atuais ou passados. |

Cada jogador vê as mensagens do bot em seu próprio idioma, definido uma
vez com `/language` e lembrado a partir de então.

## Status do projeto

**No ar**, em [`@ifs_relay_bot`](https://t.me/ifs_relay_bot) no
Telegram. Todos os comandos descritos acima estão implementados e
implantados. Veja [`CLAUDE.md`](CLAUDE.md) (em inglês) para o design
técnico completo (modelo de dados, algoritmo de resolução de conflitos,
arquitetura de i18n) se quiser contribuir.

## Arquitetura

- **Runtime:** Cloudflare Workers, recebendo atualizações do Telegram
  via webhook.
- **Framework do bot:** [grammY](https://grammy.dev).
- **Banco de dados:** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Linguagem:** TypeScript.
- **Domínio:** `ifspasscoderelay.grifwl.blue`.

## Guia de instalação

Estes são passos únicos para colocar a infraestrutura do bot de pé —
feitos uma vez para todo o projeto, não uma vez por evento IFS. Os
passos 1, 3 e 4 não exigem que o código da aplicação exista; os passos 2
e 5 precisam de um Worker implantado, então vêm por último, uma vez que
a implementação começa.

### 1. Criar o bot do Telegram

1. Abra uma conversa com [@BotFather](https://t.me/BotFather) no
   Telegram.
2. Envie `/newbot`, escolha um nome de exibição e um nome de usuário
   único terminando em `bot` (ex. `IfsPasscodeRelayBot`).
3. O BotFather responde com um **token do bot** — trate-o como uma
   senha (quem o tiver pode enviar mensagens como o bot). Ele é
   armazenado como um secret da Cloudflare no passo 4 abaixo, nunca
   enviado a este repositório.
4. Ainda falando com o BotFather, configure o perfil público do bot:
   - `/setuserpic` — envie uma foto de perfil.
   - `/setdescription` — a descrição longa mostrada na tela vazia do
     chat do bot, antes de alguém ter falado com ele.
   - `/setabouttext` — a bio curta mostrada em sua página de perfil.
   - `/setjoingroups` → *Disable*. O bot é construído em torno de chats
     privados 1:1 — a mensagem de status ao vivo de cada participante é
     editada no lugar, o que só faz sentido em um chat com só ele e o
     bot — então o uso em grupos fica desativado.

   Não há necessidade de `/setcommands`: o bot registra sua própria
   lista de comandos diretamente do código via o `setMyCommands` da Bot
   API, então o Telegram mostra sugestões de autocompletar
   automaticamente e elas nunca podem ficar dessincronizadas de uma
   lista mantida manualmente no BotFather.

#### Descrição e texto "about" sugeridos

Defina primeiro a versão em inglês com `/setdescription` e
`/setabouttext` — é o que o BotFather usa como alternativa para
qualquer idioma de cliente Telegram sem tradução própria. Depois, a
partir dos mesmos menus, adicione as versões
`ca`/`es`/`fr`/`gl`/`eu`/`pt`/`it`/`de` abaixo como descrições por
idioma.

| Idioma | `/setdescription` (longa) | `/setabouttext` (curta) |
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

### 2. Criar o Worker da Cloudflare e o banco de dados D1

Requer uma conta Cloudflare com a zona `grifwl.blue` já adicionada, e o
[wrangler](https://developers.cloudflare.com/workers/wrangler/)
instalado (`npm install -g wrangler`, ou use `npx wrangler`).

1. `wrangler login` para autenticar a CLI.
2. `wrangler d1 create ifs-passcode-relay` cria o banco de dados D1 e
   imprime um `database_id` — guarde-o, ele vai no binding
   `[[d1_databases]]` (chamado `DB`) do `wrangler.toml` assim que o
   código existir.
3. Assim que o esqueleto da aplicação existir, `wrangler deploy` publica
   o Worker pela primeira vez.

### 3. Atribuir o subdomínio

O bot vive em **`ifspasscoderelay.grifwl.blue`**. Como a zona
`grifwl.blue` já está na mesma conta Cloudflare usada para implantar,
isso não requer nenhum passo manual no painel — declare-a como um
[Custom
Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
diretamente no `wrangler.toml`:

```toml
routes = [
  { pattern = "ifspasscoderelay.grifwl.blue", custom_domain = true }
]
```

O `wrangler deploy` então provisiona o registro DNS e o certificado TLS
automaticamente. O painel só é necessário como alternativa se a zona
algum dia precisar de atenção manual (ex. se ela acabar vivendo em uma
conta Cloudflare diferente daquela em que o `wrangler` está
autenticado).

### 4. Publicar o token do bot como um secret

1. `wrangler secret put BOT_TOKEN` e cole o token do passo 1 quando
   solicitado — isso o armazena criptografado na Cloudflare, exposto ao
   Worker como `env.BOT_TOKEN`, e nunca enviado ao repositório.
2. Para desenvolvimento local, coloque o mesmo valor em `.dev.vars` (já
   no gitignore) como `BOT_TOKEN=...`.
3. Também gere uma string aleatória para usar como secret do webhook
   (ex. `openssl rand -hex 32`) e armazene-a da mesma forma, como
   `TELEGRAM_WEBHOOK_SECRET` — o Worker a usa para rejeitar qualquer
   requisição que não seja realmente do Telegram (veja o passo 5).

### 5. Apontar o Telegram para o Worker (webhook)

Assim que o Worker estiver implantado e acessível em sua URL pública:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ifspasscoderelay.grifwl.blue/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

O Telegram então inclui esse mesmo secret em um header
`X-Telegram-Bot-Api-Secret-Token` em cada atualização que entrega; o
Worker deve verificar se ele corresponde antes de processar qualquer
coisa, e rejeitar a requisição caso contrário — isso é o que impede
qualquer outra pessoa de enviar atualizações falsas para a URL pública
do webhook. Verifique se o webhook está registrado com:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### 6. Configurar o painel administrativo privado

Um painel privado, somente leitura, vive em `/admin` (ex.
`https://ifspasscoderelay.grifwl.blue/admin`), para inspecionar os
dados ao vivo do D1 sem uma sessão interativa de `wrangler d1 execute`.
Ele é protegido por senha, e os dados pertencentes a um evento
específico (participantes, reports, candidatos, resoluções, marcas de
confiança, negociações de claim) só são mostrados depois de você
escolher aquele evento em um dropdown — tabelas globais (eventos,
usuários, palavras conhecidas, criações de evento pendentes) sempre
estão visíveis. Nada se atualiza automaticamente: cada visualização é
uma instantânea do momento em que você a carregou ou atualizou pela
última vez, com um botão de atualização manual para consultar novamente
sob demanda.

1. Gere uma senha e uma chave de assinatura aleatória separada para
   seus cookies de sessão (ex. `openssl rand -hex 24` para a senha,
   `openssl rand -hex 32` para a chave), depois publique ambas da mesma
   forma que o token do bot: `wrangler secret put
   ADMIN_DASHBOARD_PASSWORD` e `wrangler secret put
   ADMIN_SESSION_SECRET`.
2. Para desenvolvimento local, adicione os mesmos dois valores a
   `.dev.vars` como `ADMIN_DASHBOARD_PASSWORD=...` e
   `ADMIN_SESSION_SECRET=...`.

## Licença

MIT.
