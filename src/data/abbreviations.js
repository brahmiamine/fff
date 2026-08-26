export const FOOTBALL_ABBREVIATIONS = [
  { code: 'SRA', label: 'Sous Réserve de l’Avantage' },
  { code: 'CFI', label: 'Coup Franc Indirect' },
  { code: 'CFD', label: 'Coup Franc Direct' },
  { code: 'HJ', label: 'Hors-Jeu' },
  { code: 'SDR', label: 'Surface de Réparation' },
  { code: 'SB', label: 'Sortie de But' },
  { code: 'BAT', label: 'Balle à Terre' },
  { code: 'PY', label: 'Penalty' },
  { code: 'RT', label: 'Rentrée de Touche' },
  { code: 'SRCP LOI 8', label: 'Sous Réserve des Conditions Particulières à la loi 8' },
  { code: 'SRCP LOI 13', label: 'Sous Réserve des Conditions Particulières à la loi 13' },
  { code: 'MEG', label: 'Mise En Garde' },
  { code: 'AVT', label: 'Avertissement' },
  { code: 'EXC', label: 'Exclusion' },
  { code: 'CAS', label: 'Comportement Anti-Sportif' },
  { code: 'RCC', label: 'Rapport à la Commission Compétente' },
]

const REPLACEMENTS = [
  [/\bADJ\s*\(arrêt du jeu\)/gi, 'Arrêt du jeu'],
  [/\bMEG\s*\(mise en garde\)/gi, 'MEG'],
  [/\bAVT pour CAS\s*\(avertissement pour comportement antisportif\)/gi, 'AVT pour CAS'],
  [/\bPY à retirer\s*\(le penalty doit être retiré\)/gi, 'PY à retirer'],
  [/\bavertissement pour comportement antisportif\s*\(CAS\)/gi, 'AVT pour CAS'],
  [/\bavertissement pour comportement antisportif\b/gi, 'AVT pour CAS'],
  [/\bavertissement pour CAS\b/gi, 'AVT pour CAS'],
  [/\bcomportement antisportif\s*\(CAS\)/gi, 'CAS'],
  [/\bcomportement antisportif\b/gi, 'CAS'],
  [/\bsous le principe de l[’']avantage\b/gi, 'SRA'],
  [/\bsous réserve de l[’']avantage\b/gi, 'SRA'],
  [/\blaisser jouer\s*\(avantage\)/gi, 'laisser jouer SRA'],
  [/\blaisser jouer l[’']avantage\b/gi, 'laisser jouer SRA'],
  [/\blaisse jouer\s*\(avantage\)/gi, 'laisse jouer SRA'],
  [/\blaisse jouer l[’']avantage\b/gi, 'laisse jouer SRA'],
  [/\bcoups francs indirects\b/gi, 'CFI'],
  [/\bcoup franc indirect\b/gi, 'CFI'],
  [/\bcoups francs directs\b/gi, 'CFD'],
  [/\bcoup franc direct\b/gi, 'CFD'],
  [/\bhors[- ]jeu\b/gi, 'HJ'],
  [/\bsurfaces de réparation\b/gi, 'SDR'],
  [/\bsurface de réparation\b/gi, 'SDR'],
  [/\b6 mètres\s*\(coup de pied de but\)/gi, 'SB'],
  [/\bcoup de pied de but\s*\(6 mètres\)/gi, 'SB'],
  [/\bcoups de pied de but\b/gi, 'SB'],
  [/\bcoup de pied de but\b/gi, 'SB'],
  [/\bsortie de but\b/gi, 'SB'],
  [/\bballes à terre\b/gi, 'BAT'],
  [/\bballe à terre\b/gi, 'BAT'],
  [/\bpenalty\b/gi, 'PY'],
  [/\brentrées de touche\b/gi, 'RT'],
  [/\brentrée de touche\b/gi, 'RT'],
  [/\bmise en garde\b/gi, 'MEG'],
  [/\bavertissement\b/gi, 'AVT'],
  [/\bexclusion\b/gi, 'EXC'],
  [/\brapport\b/gi, 'RCC'],
]

export function abbreviateFootballText(text) {
  if (typeof text !== 'string' || !text) return text
  return REPLACEMENTS.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text)
}

export function abbreviateQuestion(question) {
  return {
    ...question,
    question: abbreviateFootballText(question.question),
    options: Array.isArray(question.options)
      ? question.options.map((option) => ({ ...option, text: abbreviateFootballText(option.text) }))
      : question.options,
  }
}
