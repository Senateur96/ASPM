# Informations à vérifier

Cette liste rassemble ce que je ne peux pas confirmer moi-même : le contenu de fond du registre (faits, dates, sources) reste sous votre responsabilité éditoriale, et l’environnement dans lequel j’ai travaillé n’avait pas accès aux sites extérieurs. Les emplacements indiqués renvoient aux fichiers du dossier `data/`.

---

## 1. À faire de votre côté sur GitHub

| Action | Pourquoi |
|---|---|
| Vérifier que l’onglet **Issues** est activé (Settings → General → Features → Issues). | Le lien « Signaler une erreur » et les mentions légales y renvoient. Il est activé par défaut. |
| Lancer une première fois **Actions → Vérifier les liens → Run workflow**. | Je n’ai pas pu tester les 196 liens. Cette vérification le fera depuis GitHub. |
| Facultatif : déclarer le site dans Google Search Console. | Pour accélérer le référencement. |

---

## 2. Mentions légales (nouvelle page, à relire)

Rédigée à partir des informations déjà présentes sur le site (`data/site.json` → `mentions_legales`). À confirmer :

- vous êtes bien **directeur de la publication**, et le site est édité **à titre personnel et non commercial** ;
- le **contact** passe uniquement par le formulaire GitHub, qui demande un compte. Si vous souhaitez aussi une adresse e-mail publique, indiquez-la et je l’ajouterai ;
- l’adresse de l’hébergeur (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107) est celle publiée par GitHub à ce jour.

---

## 3. Cohérence interne

| Point | Constat | Où |
|---|---|---|
| Date de consultation | « Consulté le 31.10.2026 » s’affiche sous **les 132 sources**. Confirmez qu’elles ont toutes été consultées à cette date. | `data/site.json` → `checked` |
| Dates des versions | Les versions 0.1, 0.2 et 0.3 portent toutes la date du 31.10.2026. | `historique_versions` |
| Numéro de version | Passé de « 1.0 » à **0.4** pour suivre le journal des versions (0.3 était la dernière). Le registre se présente comme une « version de travail » : 1.0 pourra marquer la version complète. | `data/registre.json` |
| Titres « officiels » des textes en arabe | Pour EGY-01 à EGY-05, SDN-01 et LBY-01, le champ « titre officiel » contient un **titre en anglais** alors que la langue du texte est l’arabe : ce n’est donc pas le titre officiel. Ajouter l’intitulé arabe, ou renommer la mention en « titre de référence » pour ces textes. Pour le Rwanda (RWA-02, RWA-03), les lois sont publiées en kinyarwanda, en anglais et en français : le titre anglais est bien officiel. | `data/registre.json` |

---

## 4. Sources signalées comme secondaires (« à confirmer »)

Le registre lui-même indique que ces quatre entrées reposent sur la presse ou une source non officielle :

| Id | Texte | Source actuelle |
|---|---|---|
| UMOA-01 | Guide for green bond issuance on the WAMU regional financial market | financialafrik.com (article de presse, 2020) |
| AFR-01 | Taxonomie continentale de la finance durable | mfw4a.org (actualité) |
| BWA-01 | Règlement de 2018 interdisant les sacs plastiques (Botswana) | elaw.org |
| ZMB-04 | Lignes directrices de 2023 sur les prêts verts (Zambie) | afriwise.com (blog) |

À remplacer par le texte officiel quand il est trouvé, puis passer `"source"` à `"officielle"` ou `"base_reference"`.

95 entrées sur 132 s’appuient sur une base de référence (FAOLEX, ECOLEX, LII…) plutôt que sur la source officielle. C’est conforme à la méthodologie, mais ce sont les prochaines candidates à une vérification sur le journal officiel.

---

## 5. Dates incomplètes

61 textes n’ont qu’une année, ou une année et un mois. La méthodologie le prévoit, mais une date complète est préférable quand elle figure dans l’intitulé officiel :

- **Année et mois** : RWA-01, NGA-01, NGA-02, GHA-01, UMOA-01, ZAF-02, NGA-03, EGY-03, KEN-09, NGA-04, TUN-02, ZAF-06, NGA-07.
- **Année seule** : TZA-01, UGA-01, KEN-05, EGY-02, GHA-03, MUS-02, CPV-01, AU-01, MAR-03, MDG-01, KEN-06, UGA-02, TZA-03, UGA-03, KEN-07, KEN-08, ZWE-01, ETH-01, GHA-04, AU-03, NGA-05, KEN-11, NGA-06, EGY-04, GMB-01, MWI-01, ETH-02, MUS-03, STP-01, SWZ-01, NAM-01, SLE-01, SOM-01, TCD-01, DJI-02, GNQ-01, GNB-01, SSD-01, SDN-01, LBY-01, EGY-05, ZMB-03, KEN-12, GHA-05, BWA-02, ZWE-02, SEN-02, MRT-02.

---

## 6. Échéances à confirmer

Affichées en page d’accueil. Les calendriers des normes IFRS S1 et S2 sont parfois reportés :

- Ghana (GHA-02) : 01.01.2027 et 01.01.2028.
- Nigeria (NGA-02) : 01.01.2028 et 01.01.2030.

---

## 7. Page À propos : informations personnelles

À confirmer qu’elles sont toujours à jour :

- poste actuel (Arkéa Capital, reporting réglementaire ESG) et employeurs précédents ;
- chiffres de Sustainability Infographics : « une vingtaine de bénévoles », « plus de 220 000 abonnés », « plus de 190 millions de personnes », « l’une des pages LinkedIn indépendantes […] les plus suivies au monde » ;
- appartenance au centre de recherche sur le leadership climatique de l’Université d’Oxford ;
- distinctions et programmes de 2021 (Prix Jeunes Écrivains RFI-AUF, Harvard Crossroads Emerging Leaders, « 50 jeunes engagés pour le climat »).

---

## 8. Ce qui a été modifié dans le contenu (pour mémoire)

Les seules modifications de texte que j’ai faites :

- **À propos**, 3e paragraphe de « Édition et licence » : « Cette version est hébergée sur claude.ai (Anthropic)… » est remplacé par une phrase qui renvoie vers GitHub Pages, les mentions légales et le formulaire de signalement (en français et en anglais).
- **Page Textes**, phrase d’introduction : elle mentionne désormais les boutons de téléchargement.
- **Ajouts** : page Mentions légales, page Versions (le journal existait dans les données mais n’était affiché nulle part), entrée 0.4 du journal, lien « Signaler une erreur ».
- **Typographie** : espaces insécables en français (le point-virgule ne se retrouve plus seul en début de ligne) ; en anglais, suppression de l’espace avant les deux-points (« Authority: » au lieu de « Authority : »).

Les autres changements sont techniques et décrits dans le journal des versions (À propos → Versions).
