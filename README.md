# Quiz Arbitrage — CDA District 75 Paris

Application web d'entraînement au test théorique de la **CDA (Commission Départementale d'Arbitrage)** du District de Paris de Football, à destination des arbitres. Interface simple, pensée pour mobile, avec des questions à choix unique ou multiple, avec correction et explication.

Les questions reprennent le contenu de l'examen théorique officiel « Test théorique — Corrigé » de la CDA, District Parisien de Football, saison 2026/2027 (fourni par l'utilisateur), adapté au format quiz interactif.

⚠️ Les questions sont fournies à titre d'entraînement et ne remplacent pas la documentation officielle de la FFF / du District de Paris.

## Fonctionnalités

- Questions statiques stockées dans `src/data/questions.json` (choix unique ou multiple, images, explications)
- Choix du nombre de questions (3 lots calculés automatiquement) et filtre par catégorie avant de commencer
- Mode chrono optionnel (1 min/question), avec soumission automatique à expiration du temps
- Ordre des questions et des réponses mélangé à chaque quiz, figé pour toute la durée du test
- Progression sauvegardée dans le navigateur : reprise automatique après un refresh ou une fermeture, réinitialisation possible à tout moment
- Correction immédiate après chaque question, avec explication
- Écran de résultats avec score sur 100 (barème choix unique/multiple/non répondu), et bouton pour réviser uniquement les erreurs
- Historique des quiz passés avec suivi des catégories les plus faibles
- Page listant l'intégralité des questions et réponses officielles
- Installable comme application (PWA), fonctionne hors ligne une fois chargée
- Thème aux couleurs de la FFF (bleu, blanc, rouge, or), interface mobile-first

## Développement local

```bash
npm install
npm run dev
```

## Build de production

```bash
npm run build
npm run preview
```

## Déploiement sur GitHub Pages

Le dépôt contient un workflow GitHub Actions (`.github/workflows/deploy.yml`) qui build et déploie automatiquement le contenu de `dist/` sur GitHub Pages à chaque push sur `main`.

1. Sur GitHub, aller dans **Settings → Pages** et choisir la source **GitHub Actions**.
2. Pousser sur la branche `main` : le site est déployé sur `https://<utilisateur>.github.io/fff/`.

Si le dépôt ne s'appelle pas `fff`, adapter la valeur `base` dans `vite.config.js` (`base: '/nom-du-repo/'`).

## Ajouter ou modifier des questions

Chaque question de `src/data/questions.json` suit ce format :

```json
{
  "id": "q01",
  "category": "Terrain de jeu",
  "type": "single",
  "question": "Texte de la question",
  "image": "images/diagrams/exemple.svg",
  "options": [
    { "id": "a", "text": "Réponse A" },
    { "id": "b", "text": "Réponse B" }
  ],
  "correct": ["b"],
  "explanation": "Explication affichée après la réponse."
}
```

- `type` : `"single"` (choix unique) ou `"multiple"` (choix multiple)
- `image` : chemin relatif dans `public/` (`null` si pas d'image)
- `correct` : tableau des identifiants d'options correctes

Un script de validation (`npm run validate`) vérifie l'intégrité du fichier avant chaque build (ids uniques, références correctes, choix unique = 1 seule bonne réponse, etc.) et fait échouer le build/déploiement si un problème est détecté.

## Stack technique

React 18 + Vite, `vite-plugin-pwa` pour le mode hors-ligne, sans dépendance UI externe.
