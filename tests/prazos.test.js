/* Testes da contagem de prazos. Rodar com: node tests/prazos.test.js */
"use strict";
const assert = require("assert");
const P = require("../tools/prazo.js").carregar();

let n = 0;
function caso(nome, o, esperado) {
  const r = P.calcular(Object.assign({ tipoData: "publicacao" }, o));
  const obtido = {};
  for (const k of Object.keys(esperado)) {
    obtido[k] = k === "aviso" ? r.avisos.some((a) => a.includes(esperado.aviso)) && esperado.aviso : r[k];
  }
  assert.deepStrictEqual(obtido, esperado, nome + "\n" + JSON.stringify(r, null, 2));
  n++;
}

// Páscoa e feriados
assert.strictEqual(P.pascoa(2026), "2026-04-05");
assert.strictEqual(P.pascoa(2027), "2027-03-28");
assert.strictEqual(P.feriadoNacional("2027-03-26"), "Sexta-feira Santa");
assert.strictEqual(P.feriadoNacional("2026-11-20"), "Consciência Negra");
assert.strictEqual(P.feriadoNacional("2026-11-19"), null);
assert.strictEqual(P.costume("2027-02-09"), "terça-feira de Carnaval");
assert.strictEqual(P.costume("2027-05-27"), "Corpus Christi");
assert.strictEqual(P.diaSemana("2026-11-19"), 4);
assert.strictEqual(P.isISO("2026-02-30"), false);

// Regra geral: exclui o dia da publicação, começa no dia útil seguinte, dias corridos
caso("apelação, publicação na quinta antes do feriado de 20/11", { data: "2026-11-19", dias: 5 }, { inicio: "2026-11-23", ultimo: "2026-11-27", vencimento: "2026-11-27" });
caso("embargos de declaração, 2 dias", { data: "2026-11-19", dias: 2 }, { inicio: "2026-11-23", vencimento: "2026-11-24" });
caso("último dia em feriado nacional passa para o dia útil seguinte", { data: "2026-11-13", dias: 5 }, { inicio: "2026-11-16", ultimo: "2026-11-20", vencimento: "2026-11-23" });
caso("data informada é a disponibilização", { data: "2026-11-18", tipoData: "disponibilizacao", dias: 5 }, { publicacao: "2026-11-19", inicio: "2026-11-23", vencimento: "2026-11-27" });
caso("publicação na sexta: começa na segunda (Súmula 310)", { data: "2027-03-05", dias: 5 }, { inicio: "2027-03-08", vencimento: "2027-03-12" });
caso("último dia no domingo passa para segunda", { data: "2027-03-16", dias: 5 }, { inicio: "2027-03-17", ultimo: "2027-03-21", vencimento: "2027-03-22" });
caso("Sexta-feira Santa não inicia a contagem", { data: "2027-03-25", dias: 2 }, { inicio: "2027-03-29", vencimento: "2027-03-30" });

// Suspensão de 20/12 a 20/01 (CPP, art. 798-A)
caso("contagem para em 19/12 e volta em 21/01", { data: "2026-12-15", dias: 5 }, { inicio: "2026-12-16", ultimo: "2027-01-21", vencimento: "2027-01-21" });
caso("último dia no sábado 19/12 atravessa a suspensão", { data: "2026-12-14", dias: 5 }, { inicio: "2026-12-15", ultimo: "2026-12-19", vencimento: "2027-01-21" });
caso("publicação na sexta 18/12: começa depois da suspensão", { data: "2026-12-18", dias: 5 }, { inicio: "2027-01-21", vencimento: "2027-01-25" });
caso("15 dias cortados pela suspensão", { data: "2026-12-09", dias: 15 }, { inicio: "2026-12-10", vencimento: "2027-01-25" });
caso("publicação em janeiro, dentro da suspensão", { data: "2027-01-12", dias: 5 }, { inicio: "2027-01-21", vencimento: "2027-01-25" });
caso("publicação em 20/01: começa em 21/01", { data: "2027-01-20", dias: 5 }, { inicio: "2027-01-21", vencimento: "2027-01-25" });
caso("15 dias inteiros antes da suspensão", { data: "2026-12-01", dias: 15 }, { inicio: "2026-12-02", vencimento: "2026-12-16" });

// Réu preso, Lei Maria da Penha, medida urgente: sem suspensão; o recesso só adia início e vencimento
caso("réu preso: último dia no recesso vai para 07/01", { data: "2026-12-15", dias: 5, excecao: true }, { inicio: "2026-12-16", ultimo: "2026-12-20", vencimento: "2027-01-07", aviso: "réu preso" });
caso("réu preso: publicação na sexta 18/12 começa em 07/01", { data: "2026-12-18", dias: 5, excecao: true }, { inicio: "2027-01-07", vencimento: "2027-01-11", aviso: "réu preso" });
caso("réu preso: janeiro corre normalmente", { data: "2027-01-12", dias: 5, excecao: true }, { inicio: "2027-01-13", ultimo: "2027-01-17", vencimento: "2027-01-18" });

// Dias sem expediente cadastrados e avisos de ponto facultativo
caso("dia cadastrado adia o vencimento", { data: "2027-03-16", dias: 5, extras: { "2027-03-22": "feriado local" } }, { vencimento: "2027-03-23" });
caso("dia cadastrado adia o início", { data: "2027-03-16", dias: 5, extras: { "2027-03-17": "suspensão de expediente" } }, { inicio: "2027-03-18", ultimo: "2027-03-22", vencimento: "2027-03-22" });
caso("início na segunda de Carnaval gera aviso, sem mudar a conta", { data: "2027-02-05", dias: 5 }, { inicio: "2027-02-08", vencimento: "2027-02-12", aviso: "segunda-feira de Carnaval" });
caso("vencimento na terça de Carnaval gera aviso", { data: "2027-01-25", dias: 15 }, { inicio: "2027-01-26", vencimento: "2027-02-09", aviso: "terça-feira de Carnaval" });
caso("data informada em dia não útil gera aviso", { data: "2026-11-21", dias: 5 }, { inicio: "2026-11-23", vencimento: "2026-11-27", aviso: "não é dia útil" });

// Entradas inválidas
assert.ok(P.calcular({ data: "", dias: 5 }).erro);
assert.ok(P.calcular({ data: "2026-11-19", dias: 0 }).erro);

// Tabela de recursos e textos
assert.strictEqual(P.achar("apelacao").dias, 5);
assert.strictEqual(P.achar("embargos-declaracao").dias, 2);
assert.strictEqual(P.achar("agravo-execucao").dias, 5);
assert.strictEqual(P.achar("resp").dias, 15);
const ids = [].concat(...P.RECURSOS.map((g) => g.itens.map((i) => i.id)));
assert.strictEqual(new Set(ids).size, ids.length, "ids de recurso repetidos");
assert.strictEqual(P.tituloPrazo("Apelação", "Fulano", "2026-11-19", 5), "Apelação — Fulano · publ. 19/11/2026 · 5 dias");
assert.strictEqual(P.restante("2026-11-27", "2026-11-19").texto, "faltam 8 dias");
assert.strictEqual(P.restante("2026-11-19", "2026-11-19").texto, "vence hoje");
assert.strictEqual(P.restante("2026-11-17", "2026-11-19").texto, "venceu há 2 dias");

// Semana (segunda a domingo) e horário dos agendamentos nos presídios
assert.strictEqual(P.inicioSemana("2026-11-23"), "2026-11-23");
assert.strictEqual(P.inicioSemana("2026-11-29"), "2026-11-23");
assert.strictEqual(P.inicioSemana("2026-11-22"), "2026-11-16");
assert.strictEqual(P.inicioSemana("2027-01-01"), "2026-12-28");
assert.strictEqual(P.fmtHora("08:00"), "08h");
assert.strictEqual(P.fmtHora("08:30"), "08:30h");
assert.strictEqual(P.fmtHora(""), "");
assert.strictEqual(P.fmtFaixa("08:00", "08:30"), "08h até 08:30h");
assert.strictEqual(P.fmtFaixa("14:15", "15:00"), "14:15h até 15h");
assert.strictEqual(P.fmtFaixa("14:15", ""), "14:15h");

console.log("ok: " + n + " casos de contagem e as verificações auxiliares passaram");
