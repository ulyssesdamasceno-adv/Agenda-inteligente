#!/usr/bin/env node
/*
 * Calcula prazo processual penal com o mesmo código da página (bloco <script id="calc"> de agenda.html).
 *
 *   node tools/prazo.js --data 2026-11-19 --recurso apelacao --ident "Fulano, proc. 0000000"
 *   node tools/prazo.js --data 2026-11-18 --tipo disponibilizacao --dias 15 --excecao
 *   node tools/prazo.js --data 2027-03-16 --recurso rese --extra "2027-03-19=feriado estadual"
 *   node tools/prazo.js --lista
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function carregar() {
  const html = fs.readFileSync(path.join(__dirname, "..", "agenda.html"), "utf8");
  const bloco = html.match(/<script id="calc">([\s\S]*?)<\/script>/);
  if (!bloco) throw new Error("Bloco <script id=\"calc\"> não encontrado em agenda.html");
  const ctx = vm.createContext({});
  vm.runInContext(bloco[1], ctx, { filename: "agenda.html#calc" });
  return ctx.Prazos;
}

function principal(argv) {
  const P = carregar();
  const o = { extras: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--lista") o.lista = true;
    else if (a === "--excecao") o.excecao = true;
    else if (a === "--extra") { const [d, ...m] = String(argv[++i]).split("="); o.extras[d] = m.join("="); }
    else if (a.startsWith("--")) o[a.slice(2)] = argv[++i];
  }
  if (o.lista) {
    for (const g of P.RECURSOS) {
      console.log(g.grupo);
      for (const r of g.itens) console.log(`  ${r.id.padEnd(30)} ${String(r.dias).padStart(2)} dias  ${r.rotulo || r.nome}  [${r.base}]`);
    }
    return 0;
  }
  const rec = o.recurso ? P.achar(o.recurso) : null;
  if (o.recurso && !rec) { console.error("Recurso desconhecido: " + o.recurso + ". Use --lista."); return 1; }
  const dias = rec ? rec.dias : Number(o.dias);
  const r = P.calcular({ data: o.data, tipoData: o.tipo || "publicacao", dias, excecao: !!o.excecao, extras: o.extras });
  if (r.erro) { console.error(r.erro); return 1; }
  const hoje = o.hoje || P.hojeISO();
  console.log("Vencimento: " + r.vencimento + " (" + P.fmtCurta(r.vencimento) + "), " + P.restante(r.vencimento, hoje).texto + " em relação a " + P.fmtData(hoje));
  if (rec) console.log("Recurso: " + (rec.rotulo || rec.nome) + ", " + P.plural(rec.dias, "dia") + " [" + rec.base + "]" + (rec.nota ? " " + rec.nota : ""));
  console.log("Memória de cálculo:");
  r.passos.forEach((p, i) => console.log("  " + (i + 1) + ". " + p));
  r.avisos.forEach((a) => console.log("  Aviso: " + a));
  if (o.ident) console.log("Título: " + P.tituloPrazo(rec ? rec.nome : "", o.ident, r.publicacao, r.dias));
  return 0;
}

module.exports = { carregar };
if (require.main === module) process.exit(principal(process.argv.slice(2)));
