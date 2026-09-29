const test = require("node:test");
const assert = require("node:assert/strict");
const { filtrarEmRisco, formatarProdutoIndividual } = require("../alertas");

const CONFIG = { limiteMin: 0, limiteMax: 10, ignorarRefs: ["01", "151"] };

test("filtrarEmRisco mantém produtos com saldo entre o mínimo e o máximo (inclusive)", () => {
  const produtos = [
    { codigo: "200-A-P", descricao: "200 - Body", saldoFisicoTotal: 0 },
    { codigo: "200-A-M", descricao: "200 - Body", saldoFisicoTotal: 10 },
    { codigo: "200-A-G", descricao: "200 - Body", saldoFisicoTotal: 11 },
  ];
  const r = filtrarEmRisco(produtos, CONFIG);
  assert.deepEqual(r.map((p) => p.codigo), ["200-A-P", "200-A-M"]);
});

test("filtrarEmRisco ignora referências da lista ignorarRefs (extraídas da descrição)", () => {
  const produtos = [
    { codigo: "X", descricao: "151 - Saia", saldoFisicoTotal: 2 },
    { codigo: "Y", descricao: "152 - Saia", saldoFisicoTotal: 2 },
  ];
  const r = filtrarEmRisco(produtos, CONFIG);
  assert.deepEqual(r.map((p) => p.codigo), ["Y"]);
});

test("filtrarEmRisco usa o prefixo do código quando a descrição não começa com número", () => {
  const produtos = [
    { codigo: "01-ROSA-P", descricao: "Vestido", saldoFisicoTotal: 1 },
    { codigo: "300_ROSA_P", descricao: "Vestido", saldoFisicoTotal: 1 },
  ];
  const r = filtrarEmRisco(produtos, CONFIG);
  assert.deepEqual(r.map((p) => p.codigo), ["300_ROSA_P"]);
});

test("filtrarEmRisco não quebra com produto sem código nem descrição", () => {
  const r = filtrarEmRisco([{ saldoFisicoTotal: 3 }], CONFIG);
  assert.equal(r.length, 1);
});

test("formatarProdutoIndividual extrai cor e tamanho e limpa a descrição", () => {
  const msg = formatarProdutoIndividual({
    codigo: "200-ROSA-M",
    descricao: "Body Tule;COR: Rosa;TAM: M",
    saldoFisicoTotal: 4,
  });
  assert.match(msg, /\*SKU:\* 200-ROSA-M/);
  assert.match(msg, /\*Produto:\* Body Tule\n/);
  assert.match(msg, /\*Cor:\* Rosa {2}\| {2}.*\*Tam:\* M/);
  assert.match(msg, /Restam 4 un\./);
});

test("formatarProdutoIndividual sinaliza estoque zerado", () => {
  const msg = formatarProdutoIndividual({ codigo: "A", descricao: "Peça", saldoFisicoTotal: 0 });
  assert.match(msg, /ESTOQUE ZERADO/);
  assert.doesNotMatch(msg, /Restam/);
});

test("formatarProdutoIndividual usa valores padrão sem código, cor e tamanho", () => {
  const msg = formatarProdutoIndividual({ saldoFisicoTotal: 1 });
  assert.match(msg, /\*SKU:\* S\/COD/);
  assert.match(msg, /\*Produto:\* Sem descrição/);
  assert.match(msg, /\*Cor:\* - {2}\| {2}.*\*Tam:\* -/);
});
