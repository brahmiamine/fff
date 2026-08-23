# Quiz Arbitrage — CDA District 75 Paris

Application web d'entraînement au test théorique de la **CDA (Commission Départementale d'Arbitrage)** du District de Paris de Football, à destination des arbitres. Interface simple, pensée pour mobile, avec des questions à choix unique ou multiple, parfois illustrées, avec correction et explication.

⚠️ Les questions sont fournies à titre d'entraînement et ne remplacent pas la documentation officielle de la FFF / du District de Paris.

## Fonctionnalités

- Questions statiques stockées dans `src/data/questions.json` (choix unique ou multiple, images, explications)
- Sélection d'une catégorie (Loi du Jeu) et du nombre de questions
- Correction immédiate après chaque question, avec explication
- Écran de résultats avec score, pourcentage et correction détaillée
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

## Stack technique

React 18 + Vite, sans dépendance UI externe.
