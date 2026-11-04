# Informations à vérifier

Cette liste rassemble les points incertains repérés lors de la restructuration du site. **Aucun de ces contenus n’a été modifié** : ils sont signalés pour que vous décidiez. Les emplacements indiqués renvoient aux fichiers du dossier `data/`.

---

## 1. À corriger avant la mise en ligne sur GitHub Pages

### 1.1 La page À propos indique un hébergement sur claude.ai
Texte actuel (`data/site.json` → `a_propos` → `fr` → `ed`, 3e paragraphe, et son équivalent `en`) :

> « Cette version est hébergée sur claude.ai (Anthropic). Les mentions légales complètes et un formulaire de signalement accompagneront la mise en ligne sur un domaine propre ; […] »

Une fois le site publié sur GitHub Pages, cette phrase sera inexacte. Proposition :

> « Cette version est hébergée par GitHub Pages. Les mentions légales complètes et un formulaire de signalement accompagneront la mise en ligne sur un domaine propre ; chaque signalement sera vérifié sur le texte officiel avant toute modification. »
>
> *« This version is hosted on GitHub Pages. Full legal notices and a reporting form will accompany the launch on a dedicated domain; each report will be checked against the official text before any change. »* (à adapter selon le texte anglais actuel)

### 1.2 Mentions légales
Le site n’a pas de page de mentions légales. Pour un site édité depuis la France, même à titre personnel, l’identification de l’éditeur et de l’hébergeur est normalement requise (loi pour la confiance dans l’économie numérique). L’hébergeur serait GitHub Inc. À confirmer selon votre situation.

### 1.3 Polices Google Fonts et données personnelles
Les polices sont chargées depuis les serveurs de Google, ce qui transmet l’adresse IP des visiteurs à Google. Certaines juridictions européennes l’ont jugé contraire au RGPD sans consentement. Option : héberger les trois polices dans le dépôt. Le rendu resterait identique. Je ne l’ai pas fait sans votre accord.

---

## 2. Cohérence interne du site

| Point | Constat | Où |
|---|---|---|
| Numéro de version | `"version": "1.0"`, alors que le journal des versions s’arrête à la **0.3**. Ce numéro n’est affiché nulle part sur le site. | `data/registre.json` |
| Journal des versions | Il existe dans les données (`historique_versions`) et l’interface prévoit les libellés « Versions » et « Journal des versions », mais **aucune page ne l’affiche**, ni dans l’original ni maintenant. Faut-il créer cette page ? | `data/registre.json`, `data/site.json` (`n_v`, `ch_h`) |
| Dates des versions | Les versions 0.1, 0.2 et 0.3 portent toutes la date du 31.10.2026. | `historique_versions` |
| Date de consultation | « Consulté le 31.10.2026 » s’affiche sous **les 132 sources**. Confirmez qu’elles ont toutes été consultées à cette date. | `data/site.json` → `checked` |
| Libellé inutilisé | Le libellé « Tous les pays » (`back`) n’est utilisé nulle part. Sans conséquence. | `data/site.json` |

---

## 3. Sources signalées comme secondaires (« à confirmer »)

Le registre lui-même indique que ces quatre entrées reposent sur la presse ou une source non officielle :

| Id | Texte | Source actuelle |
|---|---|---|
| UMOA-01 | Guide for green bond issuance on the WAMU regional financial market | financialafrik.com (article de presse, 2020) |
| AFR-01 | Taxonomie continentale de la finance durable | mfw4a.org (actualité) |
| BWA-01 | Règlement de 2018 interdisant les sacs plastiques (Botswana) | elaw.org |
| ZMB-04 | Lignes directrices de 2023 sur les prêts verts (Zambie) | afriwise.com (blog) |

À remplacer par le texte officiel ou le journal officiel quand il est trouvé (puis passer `"source"` à `"officielle"` ou `"base_reference"`).

95 entrées sur 132 s’appuient sur une base de référence (FAOLEX, ECOLEX, LII…) plutôt que sur la source officielle. C’est conforme à la méthodologie affichée, mais ce sont les prochaines candidates à une vérification sur le journal officiel.

---

## 4. Liens non vérifiés

L’environnement dans lequel j’ai travaillé ne pouvait pas accéder aux sites extérieurs. **Les 196 liens du site** (132 sources, liens du glossaire et des ressources) n’ont donc pas pu être testés. Il est conseillé de les vérifier, en priorité ceux des sites gouvernementaux, qui changent souvent d’adresse.

---

## 5. Titres sans traduction anglaise

Ces textes officiels sont en arabe ou en kinyarwanda et n’ont qu’une traduction française du titre. **En anglais, le site affiche donc le titre en langue d’origine.** Ajouter un champ `"titre_en"` pour chacun :

EGY-01, EGY-02, EGY-03, EGY-04, EGY-05 (arabe), SDN-01 (arabe), LBY-01 (arabe), RWA-02, RWA-03 (kinyarwanda).

---

## 6. Dates incomplètes

61 textes n’ont qu’une année, ou une année et un mois. La méthodologie le prévoit, mais une date complète est préférable quand elle figure dans l’intitulé officiel :

- **Année et mois** : RWA-01, NGA-01, NGA-02, GHA-01, UMOA-01, ZAF-02, NGA-03, EGY-03, KEN-09, NGA-04, TUN-02, ZAF-06, NGA-07.
- **Année seule** : TZA-01, UGA-01, KEN-05, EGY-02, GHA-03, MUS-02, CPV-01, AU-01, MAR-03, MDG-01, KEN-06, UGA-02, TZA-03, UGA-03, KEN-07, KEN-08, ZWE-01, ETH-01, GHA-04, AU-03, NGA-05, KEN-11, NGA-06, EGY-04, GMB-01, MWI-01, ETH-02, MUS-03, STP-01, SWZ-01, NAM-01, SLE-01, SOM-01, TCD-01, DJI-02, GNQ-01, GNB-01, SSD-01, SDN-01, LBY-01, EGY-05, ZMB-03, KEN-12, GHA-05, BWA-02, ZWE-02, SEN-02, MRT-02.

---

## 7. Échéances à confirmer

Ces dates d’obligation sont affichées en page d’accueil. Les calendriers de mise en œuvre des normes IFRS S1 et S2 sont parfois reportés :

- Ghana (GHA-02) : 01.01.2027 et 01.01.2028.
- Nigeria (NGA-02) : 01.01.2028 et 01.01.2030.

---

## 8. Page À propos : informations personnelles

Ces informations datent de la rédaction initiale et peuvent évoluer. À confirmer :

- poste actuel (Arkéa Capital, reporting réglementaire ESG) et employeurs précédents ;
- chiffres de Sustainability Infographics : « une vingtaine de bénévoles », « plus de 220 000 abonnés », « plus de 190 millions de personnes », « l’une des pages LinkedIn indépendantes […] les plus suivies au monde » ;
- appartenance au centre de recherche sur le leadership climatique de l’Université d’Oxford ;
- distinctions et programmes de 2021 (Prix Jeunes Écrivains RFI-AUF, Harvard Crossroads Emerging Leaders, « 50 jeunes engagés pour le climat ») ;
- choix de la licence CC BY 4.0 pour les données et les textes rédigés.

---

## 9. Ce qui a été déplacé, retiré ou ajusté (pour mémoire)

Rien n’a été supprimé du contenu. Voici les changements techniques :

- **Fichier d’origine** : `index_ASPM.html` a été déplacé et renommé en `archive/index_ASPM_original.html` (contenu inchangé). Le site démarre désormais depuis `index.html`, nom attendu par GitHub Pages.
- **Retiré** : la balise `<meta name="claude:viewport-fit-sides">` et l’enveloppe HTML ajoutée par claude.ai, propres à cet hébergement et sans effet ailleurs. Les styles de base de cette enveloppe ont été conservés en tête de `style.css`.
- **Commentaires des données** : les séparateurs de l’ancien code (« FINANCE DURABLE », « CLIMAT »…) et la légende des codes ne peuvent pas figurer dans un fichier JSON. La légende est reprise dans le champ `_aide` de `data/registre.json` et dans le README. L’ordre des textes est inchangé.
- **Champ « année »** : il n’est plus saisi à part ; il est déduit de la date. J’ai vérifié qu’il était identique pour les 132 textes.
- **Liste des nouveaux textes** : la liste séparée d’identifiants est remplacée par un champ `"nouveau": true` sur chacun des 41 textes concernés.
- **Dates écrites en dur** (en-tête, citations, filtre des échéances) et **« 66 définitions »** : désormais calculées à partir de `date_mise_a_jour` et du glossaire. Le résultat affiché est identique.
- **Photo** : extraite du code et enregistrée dans `assets/img/portrait.jpg` (même image).
- **Mobile** : sur téléphone, la date d’édition est masquée dans l’en-tête fixe (elle reste affichée en tête de la page Carte) ; sur les écrans de faible hauteur, l’en-tête défile avec la page ; la page Comparer ne déborde plus à 320 pixels ; un pays touché sur la carte fait défiler jusqu’à sa fiche.
- **Ajouts** : icône d’onglet (le logo), titre d’onglet propre à chaque page, aperçu pour le partage sur les réseaux, message si JavaScript est désactivé, messages d’erreur en français en cas de faute dans les données, mode `?verifier`, vérification automatique sur GitHub.

Contrôle effectué : chaque page, en français et en anglais, a été comparée à l’original. Le contenu produit est identique, et les captures d’écran sur ordinateur sont identiques au pixel près. Seule l’adresse affichée dans la citation des fiches pays change, puisqu’elle reprend l’adresse réelle du site.
