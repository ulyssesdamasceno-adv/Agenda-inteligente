# Agenda-inteligente

Uma agenda do dia a dia inteligente.

Código da página **Agenda Dr. Ulysses**: tarefas, compromissos, prazos processuais penais (com cálculo a partir da publicação), agendamentos nos presídios, audiências e notas. A página é privada e os dados ficam no banco de dados dela, não neste repositório.

- `agenda.html`: a página
- `logo.webp`: a logo
- `tools/prazo.js`: calcula um prazo no terminal com o mesmo código da página (`node tools/prazo.js --lista`)
- `tests/prazos.test.js`: testes da contagem de prazos (`node tests/prazos.test.js`)
- `CLAUDE.md`: como o Claude cuida da agenda
