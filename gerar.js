try { process.loadEnvFile(); } catch { /* sem .env: usa variáveis do sistema */ }
const axios = require("axios");
const fs = require("fs");

// Credenciais do app Bling vêm do .env; o código de autorização vem da linha de comando:
//   node gerar.js <codigo_de_autorizacao>
const CLIENT_ID = process.env.BLING_CLIENT_ID;
const CLIENT_SECRET = process.env.BLING_CLIENT_SECRET;

// Código retornado pelo Bling após autorizar o app (válido por ~1 minuto)
const CODIGO_DO_NAVEGADOR = process.argv[2];

if (!CLIENT_ID || !CLIENT_SECRET || !CODIGO_DO_NAVEGADOR) {
  console.error("Uso: node gerar.js <codigo_de_autorizacao>  (defina BLING_CLIENT_ID e BLING_CLIENT_SECRET no .env)");
  process.exit(1);
}

const credenciais = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

axios.post(
  "https://www.bling.com.br/Api/v3/oauth/token",
  new URLSearchParams({ grant_type: "authorization_code", code: CODIGO_DO_NAVEGADOR }),
  { headers: { Authorization: `Basic ${credenciais}`, "Content-Type": "application/x-www-form-urlencoded" } }
).then(res => {
  const tokens = {
    access_token: res.data.access_token,
    refresh_token: res.data.refresh_token,
    expires_at: Date.now() + res.data.expires_in * 1000,
  };
  fs.writeFileSync("tokens.json", JSON.stringify(tokens, null, 2));
  console.log("✅ SUCESSO! O arquivo tokens.json foi criado com as novas permissões do WMS!");
}).catch(err => console.error("❌ Erro:", err.response ? err.response.data : err.message));
