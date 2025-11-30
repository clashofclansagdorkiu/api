import fs from "fs/promises";
import fetch from "node-fetch";

const TOKEN = process.env.COC_TOKEN; // ponlo en Railway env
const CLAN_TAG = process.env.CLAN_TAG; // ej: #ABC123 -> en URL usar %23ABC123

if (!TOKEN || !CLAN_TAG) {
  console.error("Faltan variables de entorno: COC_TOKEN y CLAN_TAG");
  process.exit(1);
}

const clanTagEncoded = encodeURIComponent(CLAN_TAG); // ya convierte # -> %23
const url = `https://api.clashofclans.com/v1/clans/${clanTagEncoded}`;

async function fetchClan() {
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Accept": "application/json"
    }
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error de API:", res.status, text);
    return null;
  }

  return res.json();
}

async function main() {
  console.log(new Date().toISOString(), "Iniciando fetch...");
  const data = await fetchClan();
  if (!data) return;

  // Guarda en un fichero con timestamp
  const filename = `data-${Date.now()}.json`;
  await fs.writeFile(filename, JSON.stringify({ fetchedAt: new Date().toISOString(), data }, null, 2));
  console.log("Guardado:", filename);

  // También actualizamos un fichero latest.json
  await fs.writeFile("latest.json", JSON.stringify({ fetchedAt: new Date().toISOString(), data }, null, 2));
  console.log("Último guardado en latest.json");
}

main().catch(err => {
  console.error("Fallo inesperado:", err);
});
