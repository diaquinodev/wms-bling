const axios = require('axios');
const fs = require('fs');
const path = require('path');

const tokenFile = path.join(__dirname, "tokens.json");
const tokens = JSON.parse(fs.readFileSync(tokenFile, "utf8"));
const NUMERO_PEDIDO = process.argv[2];
if (!NUMERO_PEDIDO) {
    console.error("Uso: node listar-ids.js <numero_do_pedido>");
    process.exit(1);
}

async function descobrirSede() {
    try {
        console.log("==================================================");
        console.log(`🎯 BUSCANDO O PEDIDO ${NUMERO_PEDIDO}`);
        console.log("==================================================");
        
        // Busca o pedido informado para descobrir os IDs de vendedor e loja
        const resp = await axios.get(`https://www.bling.com.br/Api/v3/pedidos/vendas?numero=${NUMERO_PEDIDO}`, {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        
        const pedido = resp.data.data[0];
        
        if (pedido) {
            console.log(`✅ Pedido ${NUMERO_PEDIDO} encontrado!`);
            console.log(`➡️  ID DO VENDEDOR (SITE): ${pedido.vendedor ? pedido.vendedor.id : 'Nenhum'}`);
            console.log(`➡️  ID DA LOJA (SEDE): ${pedido.loja ? pedido.loja.id : 'Nenhuma'}`);
        } else {
            console.log(`❌ Pedido ${NUMERO_PEDIDO} não encontrado.`);
        }
        console.log("==================================================");

    } catch (e) {
         console.log("❌ Erro ao ler pedido:", e.response ? JSON.stringify(e.response.data) : e.message);
    }
}

descobrirSede();