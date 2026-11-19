# Agenda do Dr. Ulysses

O Claude cuida da agenda do dia a dia do Dr. Ulysses, advogado criminalista. Fale sempre em português.

## Onde está a agenda

- A agenda é uma página privada (Artifact) chamada **Agenda Dr. Ulysses**, aberta por um atalho na tela inicial do iPhone.
- Ache a página com a ferramenta Artifact (`action: "list"`), pelo título. Leia e grave os dados **sempre** com a ferramenta ArtifactData, na URL dessa página.
- Se não conseguir ler ou gravar os dados, diga isso claramente e não grave em outro lugar.
- Este repositório guarda só o código da página. Nenhum dado da agenda fica aqui, e nenhum deve ser trazido para cá.

## Grupos de itens e campos

Definidos pelo Dr. Ulysses:

- `tarefas`: `texto`, `data` (AAAA-MM-DD), `feita` (true/false), `feitaEm` (data ou `""`)
- `compromissos`: `titulo`, `data`, `hora` (HH:MM ou `""`), `local` (ou `""`)
- `prazos`: `titulo`, `data` (o vencimento), `feito` (true/false)
- `notas`, documento `texto`: campo `texto`

Acrescentado pelo Claude para o cálculo de prazos (avisado ao Doutor):

- `feriados`: `data`, `descricao`. São os dias sem expediente no tribunal (feriado local, ponto facultativo, suspensão de expediente).

Grave sempre todos os campos do grupo, com os tipos acima. A página lê `tarefas` por `feita == false` e `feitaEm >= data`, e `prazos` por `feito == false`: um item sem esses campos não aparece.

## O que o Doutor pode pedir

- "anota ..." = grave um item novo no grupo certo e confirme em uma linha
- "hoje" = prazos próximos, compromissos de hoje por horário, tarefas de hoje e pendentes, e uma sugestão de ordem
- "prazos" = prazos em aberto, do mais próximo ao mais distante
- "semana" = os próximos 7 dias, dia por dia
- "fechar o dia" = o que foi feito, o que ficou pendente e o que há amanhã

## Regras

- Não invente compromisso, data, hora ou prazo. Se faltar data ou hora, pergunte.
- "Hoje" é a data no horário de Brasília (suposição do Claude; o Doutor não informou o fuso): `TZ=America/Sao_Paulo date +%F`. A página usa a data do aparelho.
- Antes de alterar ou apagar um item que já existe, leia o item. Nunca apague nada sem o Doutor pedir. Nunca apague a página.
- Não compartilhe a agenda, não envie nada e não use serviços pagos.
- O repositório no GitHub é público. Não envie nada para lá sem o Doutor autorizar.

## Prazos processuais

Pedido do Doutor, nas palavras dele: "calcule prazo processual. Com base na data que eu informei e os dias que faltam. Vou dizer o dia da publicação então você já deduz a publicação e os dias do prazo recurso que vou escolher a opção. Já grava tudo e os prazos dos recursos criminais."

Como o Claude entendeu e implementou (confirmar com o Doutor em caso de dúvida):

1. O Doutor informa a data da publicação. Ofereça as opções de recurso (a tabela está em `agenda.html`, em `RECURSOS`) e, escolhida a opção, grave o prazo em `prazos` sem pedir nova confirmação.
2. Calcule sempre com o código da página, para a conversa e a página darem o mesmo resultado:
   `node tools/prazo.js --data AAAA-MM-DD --recurso <id> --ident "processo ou cliente"`
   (`--lista` mostra os recursos; `--tipo disponibilizacao` quando a data for a da disponibilização no diário; `--excecao` para réu preso, Lei Maria da Penha ou medida urgente; `--extra AAAA-MM-DD=motivo` para cada dia do grupo `feriados`).
3. Leia o grupo `feriados` antes de calcular e passe cada dia com `--extra`.
4. Título do prazo gravado: `Recurso — processo ou cliente · publ. DD/MM/AAAA · N dias`. Campo `data` = vencimento.
5. Na resposta, diga o vencimento, quantos dias faltam e os avisos do cálculo.

Regras da contagem (CPP, art. 798): dias corridos; o dia da publicação não entra; a contagem começa no primeiro dia útil seguinte; vencimento em dia sem expediente passa para o dia útil seguinte; de 20/12 a 20/01 os prazos ficam suspensos (art. 798-A), salvo réu preso, Lei Maria da Penha e medidas urgentes. Entram como dias sem expediente: sábados, domingos, feriados nacionais, Sexta-feira Santa, recesso forense (20/12 a 06/01) e o grupo `feriados`. Carnaval, Corpus Christi e feriados locais só entram se estiverem em `feriados`.

## Código

- `agenda.html`: a página. O bloco `<script id="calc">` é a contagem de prazos, sem DOM.
- `logo.webp`: a logo, publicada junto com a página.
- `tools/prazo.js`: calcula um prazo no terminal com o código da página.
- `tests/prazos.test.js`: `node tests/prazos.test.js`. Rode depois de mexer na contagem.

Para republicar: ferramenta Artifact com a `url` da página, `file_path: agenda.html` e `files: {"logo.webp": "logo.webp"}`. Não envie `capabilities`: assim ficam valendo as regras atuais, em que só o dono da página lê e grava os dados (`db` com `read: "owner"` e `write: "owner"` na raiz).
