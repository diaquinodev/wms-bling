// Funções puras do robô de alertas de estoque (extraídas de index.js, sem mudança de comportamento).

function filtrarEmRisco(produtos, CONFIG) {
  return produtos.filter(p => {
    const emRisco = p.saldoFisicoTotal >= CONFIG.limiteMin && p.saldoFisicoTotal <= CONFIG.limiteMax;
    if (!emRisco) return false;
    let ref = "";
    let nomeLimpo = p.descricao || "";
    const regexRef = /^(\d+)\s*[-_]\s*/;
    const matchRef = nomeLimpo.match(regexRef);
    if (matchRef) ref = matchRef[1];
    else ref = p.codigo ? p.codigo.split(/[-_]/)[0] : "";
    if (CONFIG.ignorarRefs.includes(ref)) return false;
    return true;
  });
}

function formatarProdutoIndividual(p) {
  let cor = "-", tam = "-";
  let nomeLimpo = p.descricao || "Sem descrição";
  const regexCor = /COR:\s*([^;]+)/i;
  const matchCor = nomeLimpo.match(regexCor);
  if (matchCor) { cor = matchCor[1].trim(); nomeLimpo = nomeLimpo.replace(regexCor, ""); }
  const regexTam = /TAM(?:ANHO)?:\s*([^;]+)/i;
  const matchTam = nomeLimpo.match(regexTam);
  if (matchTam) { tam = matchTam[1].trim(); nomeLimpo = nomeLimpo.replace(regexTam, ""); }
  nomeLimpo = nomeLimpo.replace(/;/g, "").replace(/\s{2,}/g, " ").trim();
  let linhaEstoque = p.saldoFisicoTotal === 0 ? `🛑 *ESTOQUE ZERADO* ➔ Prioridade!` : `🟡 *Estoque Baixo:* Restam ${p.saldoFisicoTotal} un.`;
  return `📦 *SKU:* ${p.codigo || "S/COD"}\n🏷️ *Produto:* ${nomeLimpo}\n🎨 *Cor:* ${cor}  |  📏 *Tam:* ${tam}\n${linhaEstoque}`;
}

module.exports = { filtrarEmRisco, formatarProdutoIndividual };
