# ASPM
African Sustainability Policy Monitor

Registre bilingue (français et anglais) des politiques publiques de durabilité des 55 États de l’Union africaine.

Ce guide explique, en termes simples, comment **ajouter du contenu** et **publier le site**. Aucune connaissance en programmation n’est nécessaire : tout le contenu se trouve dans des fichiers texte du dossier `data/`.

---

## 1. Ce que contient le dépôt

```
index.html                  La page du site (en-tête, pied de page). Rarement à modifier.
assets/css/style.css        Le design : couleurs, polices, mise en page. À ne pas modifier.
assets/js/app.js            Le programme qui affiche les pages. À ne pas modifier.
assets/img/portrait.jpg     La photo de la page « À propos ».
assets/img/favicon.svg      La petite icône affichée dans l’onglet du navigateur.

data/registre.json          ← LES TEXTES DU REGISTRE, les échéances, la date de mise à jour
data/referentiel.json       ← Les pays, organisations, thèmes, le glossaire et les ressources
data/site.json              ← Les textes de l’interface, la Méthodologie et la page À propos
data/carte.json             Le tracé de la carte. Ne pas modifier.

outils/verifier.mjs         Un vérificateur automatique des données (voir section 6)
archive/                    La version d’origine du site (fichier unique), gardée pour référence
A_VERIFIER.md               La liste des informations à vérifier
```

Le site reste **une seule page** : la navigation entre Carte, Pays, Textes, Thèmes, etc. se fait sans rechargement, comme avant. Chaque rubrique a sa propre adresse, que l’on peut partager :

| Rubrique | Adresse (à ajouter après l’adresse du site) |
|---|---|
| Carte (accueil) | `#carte` |
| Liste des pays | `#pays` |
| Fiche d’un pays | `#pays-KEN` (code du pays à 3 lettres) |
| Comparer des pays | `#comparer` |
| Organisations régionales | `#regional` |
| Tous les textes | `#base` |
| Thèmes | `#themes` |
| Glossaire | `#glossaire` |
| Ressources | `#ressources` |
| Le projet | `#apropos` |
| Méthodologie | `#methodologie` |

---

## 2. Publier le site sur GitHub Pages (une seule fois)

1. Sur GitHub, ouvrez le dépôt **Senateur96/ASPM**.
2. Cliquez sur **Settings** (Paramètres), puis dans le menu de gauche sur **Pages**.
3. Sous **Build and deployment**, choisissez **Source : Deploy from a branch**.
4. Choisissez la branche **main** et le dossier **/ (root)**, puis cliquez sur **Save**.
5. Attendez une à deux minutes. L’adresse du site s’affiche en haut de la page :
   **https://senateur96.github.io/ASPM/**

Ensuite, **chaque modification enregistrée sur la branche `main` est publiée automatiquement** en une à deux minutes. Si vous ne voyez pas le changement, rechargez la page en forçant le rafraîchissement (Ctrl + Maj + R sur PC, Cmd + Maj + R sur Mac).

> Les modifications de cette restructuration sont sur la branche `claude/trusting-euler-gifyn5`. Elles seront publiées lorsque cette branche sera fusionnée dans `main` (bouton **Pull request**, puis **Merge**).

---

## 3. Modifier un fichier directement sur GitHub

1. Ouvrez le fichier (par exemple `data/registre.json`).
2. Cliquez sur l’icône **crayon** (Edit this file) en haut à droite.
3. Faites votre modification.
4. Cliquez sur **Commit changes…**, écrivez une courte description (par exemple « Ajout de la loi climat du Sénégal »), puis **Commit changes**.

C’est tout : le site se met à jour tout seul.

---

## 4. Les règles du format JSON (à lire une fois)

Les fichiers `.json` ont une écriture stricte. Les erreurs les plus fréquentes :

- **Les virgules** : chaque élément d’une liste est séparé du suivant par une virgule, **mais il n’y a pas de virgule après le dernier**.
- **Les guillemets droits** `"` entourent chaque nom de champ et chaque texte. N’utilisez pas les guillemets typographiques `“ ”` pour cela.
- **Un guillemet droit à l’intérieur d’un texte** doit s’écrire `\"`. Les guillemets français `« »` et les apostrophes `'` ou `’` s’écrivent normalement.
- **Pas de commentaires** dans un fichier JSON.
- Les accents et caractères spéciaux (é, ç, ô, arabe…) s’écrivent normalement.

Si vous faites une erreur, le site affiche un message qui indique le fichier et la ligne à corriger : rien n’est perdu, il suffit de corriger et d’enregistrer à nouveau.

---

## 5. Ajouter ou modifier du contenu

### 5.1 Ajouter un texte au registre

Ouvrez `data/registre.json`. La liste `"textes"` contient tous les textes. Copiez un bloc existant, collez-le à la suite (n’oubliez pas la virgule entre deux blocs), puis modifiez-le. Modèle :

```json
{
  "id": "SEN-05",
  "pays": "SEN",
  "themes": { "CLI": "dedie" },
  "force": "contraignant",
  "date": "2025-06-12",
  "langue": "fr",
  "titre_officiel": "Loi n° 2025-12 du 12 juin 2025 relative aux changements climatiques",
  "titre_en": "Act No. 2025-12 of 12 June 2025 on climate change",
  "type_fr": "Loi",
  "type_en": "Act",
  "autorite": "Assemblée nationale",
  "resume_fr": "Résumé en français, en une à trois phrases.",
  "resume_en": "Summary in English, in one to three sentences.",
  "lien": "https://www.exemple.gouv.sn/loi-2025-12.pdf",
  "source": "officielle",
  "nouveau": true
}
```

*(Cet exemple est fictif.)*

| Champ | Ce qu’il faut écrire |
|---|---|
| `id` | Identifiant unique : code du pays, tiret, numéro (`SEN-05`). Pour une organisation : `UMOA-02`, `AU-04`… |
| `pays` | Code du pays à 3 lettres (liste dans `data/referentiel.json`, rubrique `"pays"`), ou code d’organisation : `AU`, `UMOA`, `CEMAC`. |
| `themes` | Un ou plusieurs thèmes, chacun avec `"dedie"` (texte consacré au thème) ou `"integre"` (disposition dans un texte plus large). Codes : `FIN` finance durable, `CIR` économie circulaire et déchets, `BIO` biodiversité, `CLI` climat, `SOC` entreprises et droits humains. Exemple à deux thèmes : `{ "CLI": "dedie", "BIO": "integre" }` |
| `force` | `"contraignant"`, `"indicatif"` ou `"volontaire"`. |
| `date` | `"AAAA-MM-JJ"`, ou `"AAAA-MM"`, ou `"AAAA"` si la date exacte n’est pas connue. L’année sert au graphique. |
| `langue` | Langue du texte officiel : `fr`, `en`, `pt`, `ar`, `es`, `rw`… |
| `titre_officiel` | Le titre exact, dans la langue d’origine. |
| `titre_fr` / `titre_en` | La traduction du titre. Inutile dans la langue d’origine (pas de `titre_fr` pour un texte en français). Pour un texte en arabe ou en portugais, mettez les deux. |
| `type_fr` / `type_en` | Nature du texte : Loi / Act, Décret / Decree, Stratégie / Strategy… |
| `autorite` | L’autorité qui a adopté le texte. |
| `resume_fr` / `resume_en` | Le résumé affiché sur la fiche du pays. |
| `lien` | Adresse de la source, commençant par `https://`. |
| `source` | `"officielle"` (journal officiel, site de l’autorité), `"base_reference"` (FAOLEX, ECOLEX, LII…) ou `"secondaire"` (presse ou autre, affiché « à confirmer »). |
| `nouveau` | Facultatif. `true` fait apparaître le texte dans « Derniers textes ajoutés » sur la page d’accueil. Supprimez cette ligne (et la virgule qui la précède) sur les anciens textes quand ils ne sont plus nouveaux. |

**Tout le reste se met à jour tout seul** : couleurs de la carte, chiffres de la page d’accueil, fiches pays, graphique, comparateur, tableau des textes, recherche.

La carte calcule le niveau de chaque pays ainsi : texte dédié et contraignant = niveau le plus foncé ; texte dédié indicatif ou volontaire = niveau intermédiaire ; disposition intégrée = niveau clair.

### 5.2 Mettre à jour la date du registre

Dans `data/registre.json`, modifiez `"date_mise_a_jour": "2026-10-31"`. La date est reprise automatiquement dans l’en-tête (« Registre public · 31.10.2026 »), dans les citations des fiches pays et de la page À propos, et sert à n’afficher que les échéances à venir.

Attention : la mention « Consulté le 31.10.2026 » sous chaque source **n’est pas** mise à jour automatiquement, car elle indique la date à laquelle les sources ont été vérifiées. Changez-la dans `data/site.json` (champ `"checked"`, en français et en anglais) seulement après avoir revérifié les sources.

### 5.3 Ajouter une échéance

Dans `data/registre.json`, liste `"echeances"` :

```json
{
  "date": "2029-01-01",
  "id_texte": "GHA-02",
  "description_fr": "Ghana : …",
  "description_en": "Ghana: …"
}
```

`id_texte` doit être l’identifiant d’un texte du registre. Les échéances passées disparaissent seules de la page d’accueil.

### 5.4 Ajouter un terme au glossaire

Dans `data/referentiel.json`, liste `"glossaire"` :

```json
{
  "categorie": "F",
  "terme_fr": "Obligation verte",
  "terme_en": "Green bond",
  "definition_fr": "…",
  "definition_en": "…",
  "lien": "https://…"
}
```

Catégories : `F` finance durable, `C` climat, `B` biodiversité, `D` déchets et économie circulaire, `S` social et droits humains, `J` droit et méthode (liste dans `"glossaire_categories"`). Le `lien` est facultatif. Le classement alphabétique et le nombre de définitions affiché sur la page d’accueil se mettent à jour seuls.

### 5.5 Ajouter une ressource

Dans `data/referentiel.json`, liste `"ressources"`, ajoutez un bloc dans les `"liens"` du groupe voulu :

```json
{
  "nom": "FAOLEX",
  "organisme": "FAO",
  "lien": "https://www.fao.org/faolex/en/",
  "description_fr": "…",
  "description_en": "…"
}
```

### 5.6 Une organisation régionale

Dans `data/referentiel.json`, rubrique `"organisations"`. Le champ `"membres"` liste les codes des pays membres (`"tous"` pour l’Union africaine). Un texte rattaché à une organisation (`"pays": "UMOA"`) apparaît sur la page Organisations régionales et sur la fiche de chaque pays membre.

### 5.7 Textes de l’interface, Méthodologie et À propos

Tout est dans `data/site.json` :

- `"interface"` : tous les petits textes du site (menus, boutons, titres), en `"fr"` et en `"en"`. Ne changez que le texte entre guillemets, jamais le nom du champ à gauche.
- `"methodologie"` : la page Méthodologie, une ligne par paragraphe. Les balises `<p>…</p>`, `<h3>…</h3>`, `<ul><li>…</li></ul>` servent à la mise en forme : gardez-les.
- `"a_propos"` : la page Le projet (paragraphes, biographie, citation, photo).

Les marqueurs `{date}`, `{date_longue}`, `{annee}` et `{nb_definitions}` sont remplacés automatiquement : laissez-les tels quels.

### 5.8 Changer la photo

Remplacez le fichier `assets/img/portrait.jpg` par une nouvelle photo portant **exactement le même nom** (format portrait 3 × 4, environ 420 × 560 pixels).

---

## 6. Vérifier avant ou après publication

Trois moyens, du plus simple au plus complet :

1. **Sur le site publié**, ajoutez `?verifier` à l’adresse : **https://senateur96.github.io/ASPM/?verifier**. Un encadré indique « aucune erreur », ou la liste des points à corriger. Les visiteurs ordinaires ne voient pas cet encadré. Un texte mal rempli (pays inconnu, force mal orthographiée…) est simplement ignoré, sans bloquer le reste du site.
2. **Sur GitHub**, après chaque enregistrement, une vérification automatique se lance (onglet **Actions**). Une coche verte ✓ signifie que tout va bien ; une croix rouge ✗ signale une erreur, avec le détail en cliquant dessus. GitHub vous prévient aussi par e-mail.
3. **Sur votre ordinateur**, si Node.js est installé : `node outils/verifier.mjs`.

---

## 7. Voir le site sur son ordinateur (facultatif)

Un double clic sur `index.html` **ne suffit pas** : les navigateurs interdisent alors la lecture des fichiers de données, et le site affiche un message d’explication. Deux solutions :

- **Avec Python** (déjà présent sur Mac et Linux) : ouvrez un terminal dans le dossier du site et tapez :

```bash
python3 -m http.server 8000
```

  puis ouvrez **http://localhost:8000** dans le navigateur.

- **Avec Visual Studio Code** : installez l’extension « Live Server », puis clic droit sur `index.html` → « Open with Live Server ».

---

## 8. À savoir

- **Design** : couleurs, polices (Archivo, Source Serif 4, Overpass Mono) et mise en page sont identiques à la version d’origine. Les couleurs sont définies en tête de `assets/css/style.css` (mode clair et mode sombre).
- **Mobile** : le site a été vérifié sur des écrans de 320, 390 et 768 pixels de large, sans défilement horizontal. Sur téléphone, la date d’édition n’apparaît plus dans l’en-tête (elle reste en tête de la page Carte), et sur les très petits écrans l’en-tête défile avec la page au lieu de rester fixé.
- **Langue** : le bouton FR / EN est mémorisé par le navigateur du visiteur.
- **Version d’origine** : le fichier unique de départ est conservé dans `archive/index_ASPM_original.html`. Il est aussi publié à l’adresse `…/ASPM/archive/index_ASPM_original.html`. Vous pouvez le supprimer quand la nouvelle version vous convient : il reste de toute façon dans l’historique de GitHub.

Licence des données et des textes rédigés pour le site : CC BY 4.0. Les textes officiels restent la propriété de leurs auteurs.
