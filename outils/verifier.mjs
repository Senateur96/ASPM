// Vérifie les fichiers du dossier data/ avant publication.
// Usage : node outils/verifier.mjs   (aucune installation nécessaire, Node.js 18 ou plus)
// Le script s'arrête avec une erreur si un problème bloquant est trouvé.
import { readFileSync } from "node:fs";

const erreurs = [], remarques = [];
function lire(f) {
  const txt = readFileSync(new URL("../data/" + f, import.meta.url), "utf8");
  try { return JSON.parse(txt); }
  catch (e) {
    const m = /position (\d+)/.exec(e.message);
    const ligne = m ? txt.slice(0, +m[1]).split("\n").length : "?";
    console.error(`✗ data/${f} : erreur de syntaxe JSON vers la ligne ${ligne}. ${e.message}`);
    process.exit(1);
  }
}
const reg = lire("registre.json"), ref = lire("referentiel.json"), site = lire("site.json"), carte = lire("carte.json");

const pays = ref.pays, orgs = ref.organisations;
const themes = new Set(ref.themes.map(t => t.code));
const FORCES = ["contraignant", "indicatif", "volontaire"], SOURCES = ["officielle", "base_reference", "secondaire"], NATURES = ["dedie", "integre"];
const REGIONS = Object.keys(site.interface.fr.R);

if (!/^\d{4}-\d{2}-\d{2}$/.test(reg.date_mise_a_jour)) erreurs.push("registre.json : date_mise_a_jour doit avoir la forme AAAA-MM-JJ.");

for (const [c, p] of Object.entries(pays)) {
  if (!p.fr || !p.en) erreurs.push(`referentiel.json, pays ${c} : nom fr ou en manquant.`);
  if (!REGIONS.includes(p.region)) erreurs.push(`referentiel.json, pays ${c} : région « ${p.region} » inconnue (${REGIONS.join(", ")}).`);
  if (!carte.contours[c]) erreurs.push(`referentiel.json, pays ${c} : pas de contour dans carte.json.`);
}
for (const [o, v] of Object.entries(orgs)) {
  if (v.membres !== "tous") for (const m of v.membres) if (!pays[m]) erreurs.push(`referentiel.json, organisation ${o} : membre inconnu « ${m} ».`);
}

const ids = new Set();
reg.textes.forEach((x, n) => {
  const ou = `registre.json, texte ${x.id || "n° " + (n + 1)}`;
  if (!x.id) erreurs.push(`${ou} : champ « id » manquant.`);
  else if (ids.has(x.id)) erreurs.push(`${ou} : identifiant en double.`);
  ids.add(x.id);
  if (!pays[x.pays] && !orgs[x.pays]) erreurs.push(`${ou} : pays ou organisation inconnu « ${x.pays} ».`);
  if (x.id && pays[x.pays] && !x.id.startsWith(x.pays + "-")) remarques.push(`${ou} : l'identifiant ne commence pas par le code pays ${x.pays}.`);
  if (!FORCES.includes(x.force)) erreurs.push(`${ou} : force « ${x.force} » invalide (${FORCES.join(", ")}).`);
  if (!SOURCES.includes(x.source)) erreurs.push(`${ou} : source « ${x.source} » invalide (${SOURCES.join(", ")}).`);
  if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(String(x.date))) erreurs.push(`${ou} : date « ${x.date} » invalide (AAAA, AAAA-MM ou AAAA-MM-JJ).`);
  const th = Object.entries(x.themes || {});
  if (!th.length) erreurs.push(`${ou} : aucun thème.`);
  for (const [k, v] of th) {
    if (!themes.has(k)) erreurs.push(`${ou} : thème inconnu « ${k} ».`);
    if (!NATURES.includes(v)) erreurs.push(`${ou} : thème ${k} = « ${v} » invalide (dedie ou integre).`);
  }
  for (const k of ["titre_officiel", "type_fr", "type_en", "autorite", "resume_fr", "resume_en", "lien"])
    if (!x[k]) erreurs.push(`${ou} : champ « ${k} » manquant ou vide.`);
  if (x.lien && !/^https?:\/\//.test(x.lien)) erreurs.push(`${ou} : le lien doit commencer par http:// ou https://.`);
  if (x.date > reg.date_mise_a_jour) remarques.push(`${ou} : date postérieure à la date de mise à jour du registre.`);
});
for (const d of reg.echeances || []) if (!ids.has(d.id_texte)) erreurs.push(`registre.json, échéance du ${d.date} : texte « ${d.id_texte} » introuvable.`);
const cats = ref.glossaire_categories;
for (const g of ref.glossaire) {
  if (!cats[g.categorie]) erreurs.push(`referentiel.json, glossaire « ${g.terme_fr} » : catégorie « ${g.categorie} » inconnue.`);
  if (!g.terme_fr || !g.terme_en || !g.definition_fr || !g.definition_en) erreurs.push(`referentiel.json, glossaire « ${g.terme_fr || g.terme_en} » : terme ou définition manquant.`);
}
for (const k of Object.keys(site.interface.fr)) if (!(k in site.interface.en)) erreurs.push(`site.json : le texte d'interface « ${k} » existe en français mais pas en anglais.`);
for (const k of Object.keys(site.interface.en)) if (!(k in site.interface.fr)) erreurs.push(`site.json : le texte d'interface « ${k} » existe en anglais mais pas en français.`);

const nSec = reg.textes.filter(x => x.source === "secondaire").length;
console.log(`${reg.textes.length} textes, ${Object.keys(pays).length} pays, ${ref.glossaire.length} termes de glossaire, ${nSec} source(s) secondaire(s) à confirmer.`);
for (const r of remarques) console.log("• Remarque : " + r);
if (erreurs.length) { for (const e of erreurs) console.error("✗ " + e); console.error(`\n${erreurs.length} erreur(s) à corriger.`); process.exit(1); }
console.log("✓ Données valides.");
