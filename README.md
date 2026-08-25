# Quiz Arbitrage — CDA District 75 Paris

Application web/PWA d'entraînement au test théorique de la **CDA (Commission Départementale d'Arbitrage)** du District de Paris de Football. L'application est pensée mobile-first et fonctionne hors ligne après le premier chargement.

Les questions reprennent le contenu du test théorique corrigé CDA Paris, saison 2026/2027, adapté au format quiz interactif. Elles restent destinées à l'entraînement et ne remplacent pas la documentation officielle FFF/IFAB/District.

## Fonctionnalités

- Questions à choix unique ou multiple, images, explications et références pédagogiques
- Quiz rapide, entraînement standard et quiz personnalisé par catégorie/nombre de questions
- **Mode entraînement** avec correction immédiate
- **Mode examen** sans correction pendant l'épreuve, navigation précédente/suivante et correction complète à la fin
- Mode chrono optionnel (1 min/question) et examen blanc chronométré
- Pause explicite du chrono : le temps restant est conservé et reprend correctement
- Ordre des questions et réponses mélangé puis figé pendant le quiz
- Sauvegarde locale et reprise automatique après refresh/fermeture
- Score sur 100 avec crédit partiel pour les choix multiples
- Révision immédiate des erreurs
- **Favoris** par question et quiz dédié aux favoris
- **Entraînement adaptatif** qui priorise questions non vues, faibles, dues et erreurs récentes
- **Répétition espacée** avec échéances 1, 3, 7, 14 puis 30 jours selon la réussite consécutive
- Quiz dédiés aux points faibles, erreurs passées et questions à réviser
- Historique, meilleur score, moyenne récente et évolution des derniers quiz
- Statistiques par catégorie et par question : vues, erreurs, maîtrise, échéance de révision
- Métadonnées pédagogiques normalisées : loi, difficulté, source, saison, spécificité District/Ligue, tags et point à retenir
- Liste complète des questions/réponses
- PWA installable et fonctionnement hors ligne
- Validation de `src/data/questions.json` avant build
- Tests Node natifs exécutés sur chaque pull request

## Développement local

```bash
npm install
npm test
npm run dev
```

## Build de production

```bash
npm run build
npm run preview
```

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy.yml` exécute les tests et le build sur les pull requests. Sur `main`, il déploie ensuite automatiquement `dist/` vers GitHub Pages.

## Structure d'une question

Les champs historiques restent compatibles. Des métadonnées pédagogiques facultatives peuvent être ajoutées directement au JSON ; lorsqu'elles sont absentes, l'application applique des valeurs par défaut et infère la loi lorsque le libellé le permet.

```json
{
  "id": "q01",
  "category": "Penalty",
  "subcategory": "Empiètement",
  "type": "multiple",
  "question": "Texte de la question",
  "image": null,
  "options": [{ "id": "a", "text": "Réponse A" }],
  "correct": ["a"],
  "explanation": "Explication détaillée.",
  "law": "Loi 14",
  "difficulty": "standard",
  "source": "CDA District 75 — test théorique corrigé",
  "season": "2026/2027",
  "districtSpecific": false,
  "tags": ["penalty"],
  "takeaway": "Point essentiel à mémoriser."
}
```

## Stack technique

React 18, Vite, `vite-plugin-pwa`, stockage local navigateur et tests `node:test`, sans dépendance UI externe.
