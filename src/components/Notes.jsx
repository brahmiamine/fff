const NOTION_URL = 'https://organic-power-292.notion.site/R-sume-3ca770c37f8a80b3a5eafe112edcf32d'

function NoteDetails({ title, children, open = false }) {
  return (
    <details className="notion-note-details" open={open}>
      <summary>{title}</summary>
      <div className="notion-note-details-content">{children}</div>
    </details>
  )
}

export default function Notes() {
  return (
    <div className="screen collection-screen notes-screen">
      <div className="notes-web-header">
        <h1 className="app-title">Mes notes</h1>
        <a className="notes-source-link" href={NOTION_URL} target="_blank" rel="noreferrer">
          Ouvrir dans Notion ↗
        </a>
      </div>

      <article className="notion-note-page">
        <section>
          <h2>🎯 DOGSO — Occasion de but manifeste</h2>
          <div className="notion-callout notion-callout-red">
            <strong>DOGSO hors SDR → 🟥 EXC</strong>
            <strong>DOGSO + PY + tentative de jouer le ballon → 🟨 AVT</strong>
            <strong>DOGSO + PY + retenir / tirer / pousser / aucune possibilité de jouer le ballon → 🟥 EXC</strong>
          </div>
          <h3>Les 4 critères</h3>
          <ol>
            <li><strong>Distance du but</strong> → action suffisamment proche du but.</li>
            <li><strong>Sens du jeu</strong> → l’action évolue vers une situation permettant de marquer.</li>
            <li><strong>Probabilité de conserver ou récupérer le ballon</strong> → ballon maîtrisé ou clairement jouable.</li>
            <li><strong>Placement et nombre des joueurs</strong> → défenseurs et attaquants à prendre en compte.</li>
          </ol>
          <blockquote><strong>Mémo : DOGSO = But + Direction + Ballon + Joueurs</strong></blockquote>
        </section>

        <section>
          <h2>🟨🟥 Sanctions disciplinaires</h2>
          <h3>Point d’impact — repère rapide</h3>
          <ul>
            <li><strong>Chaussure / pied</strong> → 🟨</li>
            <li><strong>Cheville</strong> → 🟥</li>
            <li><strong>Tibia</strong> → 🟥</li>
            <li><strong>Genou ou plus haut</strong> → 🟥</li>
          </ul>
          <div className="notion-callout notion-callout-yellow">
            ⚠️ Le point d’impact est un <strong>repère</strong> : l’arbitre doit aussi apprécier l’intensité, la vitesse, la force utilisée et la mise en danger de l’intégrité physique.
          </div>

          <NoteDetails title="🟨 Motifs carton jaune — AVT">
            <ul>
              <li><strong>Gestion du jeu :</strong> retarder la reprise, entrer/revenir ou quitter délibérément le terrain sans autorisation, ne pas respecter la distance réglementaire.</li>
              <li><strong>Désapprobation :</strong> manifester sa désapprobation en paroles ou en actes.</li>
              <li><strong>CAS :</strong> comportement antisportif, par exemple tacle inconsidéré ou simulation.</li>
              <li><strong>Répétition :</strong> enfreindre de manière répétée les Lois du Jeu.</li>
              <li><strong>VAR :</strong> pénétrer dans la zone de visionnage ou faire un usage excessif du signal d’analyse vidéo.</li>
            </ul>
            <blockquote><strong>À retenir : Retard – Désapprobation – Entrée/Sortie – Distance – Répétition – CAS – VAR</strong><br/><strong>Inconsidéré = AVT 🟨</strong></blockquote>
          </NoteDetails>

          <NoteDetails title="🟥 Motifs carton rouge — EXC">
            <ul>
              <li><strong>DOGSO :</strong> empêcher un but ou annihiler une occasion de but manifeste.</li>
              <li><strong>Faute grossière :</strong> force excessive ou mise en danger de l’intégrité physique <strong>en disputant le ballon</strong>.</li>
              <li><strong>Acte de brutalité :</strong> force excessive <strong>sans disputer le ballon</strong>.</li>
              <li><strong>Crachat / morsure.</strong></li>
              <li><strong>Propos ou actes blessants, injurieux et/ou grossiers.</strong></li>
              <li><strong>Deuxième AVT</strong> au cours du même match.</li>
              <li><strong>VAR :</strong> pénétrer dans la salle de visionnage.</li>
            </ul>
            <blockquote><strong>À retenir : DOGSO – Faute grossière – Brutalité – Crachat/Morsure – Insultes – 2e AVT – Salle VAR</strong><br/><strong>Force excessive / intégrité physique en danger = EXC 🟥</strong></blockquote>
          </NoteDetails>

          <NoteDetails title="💥 Faute grossière vs acte de brutalité">
            <h3>Faute grossière</h3>
            <p><strong>Tacle ou challenge pour le ballon</strong> avec force excessive ou mettant en danger l’intégrité physique de l’adversaire.</p>
            <blockquote><strong>Dispute du ballon + force excessive / mise en danger = faute grossière.</strong></blockquote>
            <h3>Acte de brutalité</h3>
            <p>Usage ou tentative de <strong>force excessive ou brutalité contre une personne sans disputer le ballon</strong>, avec ou sans contact.</p>
            <blockquote><strong>Acte violent ou tentative d’acte violent sans lutte pour le ballon = acte de brutalité.</strong></blockquote>
          </NoteDetails>
        </section>

        <section>
          <h2>✋ Main sanctionnable</h2>
          <NoteDetails title="✋ Position du bras — repère visuel">
            <p><strong>Ballon sur la main / le bras + bras qui augmente artificiellement la surface du corps = main sanctionnable.</strong></p>
            <p><strong>Mouvement de la main / du bras vers le ballon = main sanctionnable.</strong></p>
            <blockquote><strong>Mémo : Impact + position du bras + mouvement = décision.</strong></blockquote>
            <p>⚠️ Un bras décollé ne signifie pas automatiquement qu’il y a faute.</p>
            <img className="notion-note-image" src="https://raw.githubusercontent.com/brahmiamine/fff/main/image/main-position-bras.webp" alt="Repère visuel — position du bras" />
          </NoteDetails>
        </section>

        <section>
          <h2>⚡ Décisions techniques rapides</h2>
          <NoteDetails title="⚽ But marqué directement">
            <ul>
              <li><strong>Gardien envoie le ballon de la main directement dans le but adverse</strong> → <strong>Coup de pied de but (6 m)</strong>.</li>
              <li><strong>Coup d’envoi directement dans le but adverse</strong> → <strong>But accordé</strong>.</li>
              <li><strong>Coup d’envoi directement dans son propre but</strong> → <strong>Corner adverse</strong>.</li>
              <li><strong>CFD directement dans le but adverse</strong> → <strong>But accordé</strong>.</li>
              <li><strong>CFI directement dans le but adverse</strong> → <strong>Coup de pied de but (6 m)</strong>.</li>
              <li><strong>CFD ou CFI directement dans son propre but</strong> → <strong>Corner adverse</strong>.</li>
              <li><strong>RT directement dans le but adverse</strong> → <strong>Coup de pied de but (6 m)</strong>.</li>
              <li><strong>RT directement dans son propre but</strong> → <strong>Corner adverse</strong>.</li>
              <li><strong>Coup de pied de but directement dans le but adverse</strong> → <strong>But accordé</strong>.</li>
              <li><strong>Coup de pied de but directement dans son propre but</strong> → <strong>Corner adverse</strong>.</li>
              <li><strong>Corner directement dans le but adverse</strong> → <strong>But accordé</strong>.</li>
              <li><strong>Corner directement dans son propre but</strong> → <strong>Corner adverse</strong>.</li>
            </ul>
          </NoteDetails>

          <NoteDetails title="⚪ Balle à terre">
            <ul>
              <li><strong>La BAT touche un joueur avant de toucher le sol</strong> → <strong>BAT à refaire</strong>.</li>
              <li><strong>La BAT touche le sol puis sort sans qu’aucun joueur ne la touche</strong> → <strong>BAT à refaire</strong>.</li>
              <li><strong>Un joueur joue la BAT directement dans le but adverse, sans contact d’un deuxième joueur</strong> → <strong>Coup de pied de but (6 m)</strong>.</li>
              <li><strong>Un joueur joue la BAT directement dans son propre but, sans contact d’un deuxième joueur</strong> → <strong>Corner adverse</strong>.</li>
            </ul>
            <blockquote>⚠️ Pour obtenir le <strong>6 m</strong>, le ballon doit avoir été joué par <strong>un seul joueur</strong>. S’il sort sans être touché, la <strong>BAT est à refaire</strong>.</blockquote>
          </NoteDetails>

          <NoteDetails title="🎯 Penalty">
            <ul>
              <li><strong>Mauvais tireur après le signal</strong> → <strong>AVT au mauvais tireur + CFI au point de penalty</strong>, but ou pas.</li>
              <li><strong>Penalty botté vers l’arrière</strong> → <strong>CFI</strong>, but ou pas.</li>
              <li><strong>Feinte illégale après la fin de la course d’élan</strong> → <strong>AVT au tireur + CFI</strong>, but ou pas.</li>
              <li><strong>Double contact accidentel des deux pieds + but</strong> → <strong>Penalty à retirer</strong>.</li>
              <li><strong>Double contact accidentel des deux pieds + pas de but</strong> → <strong>CFI</strong>.</li>
              <li><strong>Double contact délibéré du tireur</strong> → <strong>CFI</strong>.</li>
              <li><strong>Deuxième contact volontaire de la main</strong> → <strong>CFD pour la défense</strong>.</li>
              <li><strong>Penalty sur le poteau puis rejoué par le tireur avant tout autre joueur</strong> → <strong>CFI</strong>.</li>
              <li><strong>Penalty repoussé par le gardien puis repris par le tireur</strong> → <strong>Laisser jouer</strong>.</li>
              <li><strong>Feinte pendant la course d’élan</strong> → <strong>Jeu autorisé</strong>.</li>
              <li><strong>Gardien avance mais le penalty entre</strong> → <strong>But accordé</strong>.</li>
              <li><strong>Gardien avance et arrête le penalty</strong> → <strong>Penalty à retirer + MEG lors de la première infraction</strong>.</li>
              <li><strong>Récidive du gardien</strong> → <strong>Penalty à retirer + AVT</strong>.</li>
              <li><strong>Gardien avance et le ballon manque le but sans perturbation claire du tireur</strong> → <strong>Pas à retirer</strong>.</li>
              <li><strong>Infraction simultanée du gardien et du tireur</strong> → <strong>AVT au tireur + CFI pour la défense</strong>.</li>
            </ul>
          </NoteDetails>

          <NoteDetails title="🔁 Double touche lors d’une reprise">
            <ul>
              <li><strong>Exécutant d’un coup d’envoi, coup franc, RT, coup de pied de but ou corner retouche le ballon avant un autre joueur</strong> → <strong>CFI</strong>.</li>
              <li><strong>Deuxième contact = main volontaire</strong> → <strong>CFD ou PY</strong>.</li>
              <li><strong>Gardien commet cette main dans sa propre SDR</strong> → <strong>CFI, pas PY</strong>.</li>
            </ul>
          </NoteDetails>

          <NoteDetails title="↔️ Rentrée de touche">
            <ul>
              <li><strong>RT incorrectement exécutée</strong> → <strong>RT pour l’équipe adverse</strong>.</li>
              <li><strong>Le ballon touche le sol avant d’entrer sur le terrain</strong> → <strong>RT à refaire par la même équipe</strong>.</li>
              <li><strong>Adversaire gêne abusivement l’exécutant ou ne respecte pas les 2 m</strong> → <strong>AVT pour CAS</strong>.</li>
              <li><strong>Adversaire gêne l’exécutant après l’exécution de la RT</strong> → <strong>AVT + CFI</strong>.</li>
              <li><strong>RT non exécutée après le décompte de cinq secondes</strong> → <strong>RT pour l’adversaire</strong>.</li>
            </ul>
          </NoteDetails>

          <NoteDetails title="🧤 Gardien de but">
            <ul>
              <li><strong>Conserve le ballon à la main plus de huit secondes</strong> → <strong>Corner adverse</strong>.</li>
              <li><strong>Prend à la main une passe délibérément bottée par un coéquipier</strong> → <strong>CFI</strong>.</li>
              <li><strong>Prend directement à la main une RT d’un coéquipier</strong> → <strong>CFI</strong>.</li>
              <li><strong>Tente clairement de jouer au pied une passe délibérée, rate son dégagement puis prend le ballon à la main</strong> → <strong>Jeu autorisé</strong>.</li>
              <li><strong>Relâche le ballon puis le reprend à la main avant un autre joueur</strong> → <strong>CFI</strong>.</li>
              <li><strong>Adversaire empêche le gardien de dégager le ballon des mains</strong> → <strong>CFI</strong>.</li>
              <li><strong>Adversaire dispute le ballon lorsque le gardien le tient à la main</strong> → <strong>CFI pour le gardien</strong>.</li>
            </ul>
          </NoteDetails>

          <NoteDetails title="🧱 Coups francs et hors-jeu">
            <ul>
              <li><strong>CFI directement marqué mais l’arbitre avait oublié de lever le bras</strong> → <strong>CFI à retirer</strong>.</li>
              <li><strong>Attaquant à moins de 1 m d’un mur défensif de trois joueurs ou plus</strong> → <strong>CFI pour la défense</strong>.</li>
              <li><strong>Coup franc joué rapidement et adversaire proche intercepte le ballon</strong> → <strong>Laisser jouer</strong>.</li>
              <li><strong>Adversaire empêche délibérément l’exécution du coup franc</strong> → <strong>AVT pour retard de reprise</strong>.</li>
              <li><strong>Joueur reçoit directement le ballon sur une RT, un corner ou un coup de pied de but</strong> → <strong>Pas de HJ</strong>.</li>
            </ul>
            <blockquote><strong>Mémo : identifier la reprise technique, puis vérifier s’il faut une sanction disciplinaire.</strong></blockquote>
          </NoteDetails>
        </section>

        <section>
          <h2>📝 Rapport disciplinaire</h2>
          <NoteDetails title="📝 Squelette complet du rapport">
            <h3>Motif officiel</h3>
            <p><strong>[Commet une faute grossière / commet un acte de brutalité / tient des propos blessants, injurieux et/ou grossiers / crache sur ou vers quelqu’un / annihile une occasion de but manifeste / reçoit un second avertissement…]</strong></p>
            <h3>Rapport circonstancié</h3>
            <blockquote>
              À la <strong>[…]e minute</strong> de la rencontre opposant <strong>[équipe A]</strong> à <strong>[équipe B]</strong>, alors que le score était de <strong>[…] à […]</strong> en faveur de <strong>[…]</strong>, le ballon était <strong>[en jeu/hors du jeu]</strong> et se trouvait <strong>[lieu précis]</strong>.<br/><br/>
              À cet instant, le <strong>[joueur/remplaçant/joueur remplacé/officiel]</strong> n° <strong>[…]</strong> de l’équipe <strong>[…]</strong>, Monsieur <strong>[NOM Prénom]</strong>, a <strong>[description précise de l’acte ou des paroles]</strong>.<br/><br/>
              Les faits se sont produits <strong>[pendant/hors]</strong> une lutte pour le ballon. Le fautif a utilisé <strong>[partie du corps]</strong> et a touché <strong>[partie du corps de la victime]</strong>, avec une intensité <strong>[faible/modérée/importante]</strong>.<br/><br/>
              Placé à environ <strong>[…] mètres</strong> de l’incident, avec une vue <strong>[directe et dégagée]</strong>, j’ai vu l’intégralité des faits.<br/><br/>
              J’ai <strong>[immédiatement arrêté le jeu/attendu le prochain arrêt de jeu car un avantage était en cours/le jeu était déjà arrêté]</strong>. J’ai alors <strong>[averti/exclu]</strong> Monsieur <strong>[…]</strong> pour <strong>[motif disciplinaire officiel]</strong>.<br/><br/>
              Après l’annonce de la sanction, l’intéressé <strong>[a quitté le terrain sans difficulté/a contesté/a refusé de quitter le terrain]</strong>.<br/><br/>
              La victime <strong>[n’a pas nécessité de soins/a reçu des soins/a repris le jeu/a été remplacée]</strong>.<br/><br/>
              Le jeu a repris par <strong>[CFD/CFI/PY/RT/SB/Corner/BAT/coup d’envoi]</strong> en faveur de <strong>[équipe]</strong>, depuis <strong>[lieu de la reprise]</strong>.
            </blockquote>
            <h3>Version facile à mémoriser</h3>
            <blockquote><strong>Minute – Score – Ballon – Lieu – Auteur – Faits – Sanction – Victime – Sortie – Reprise</strong></blockquote>
            <h3>Propos injurieux</h3>
            <p>Inscrire les <strong>paroles exactes</strong>.</p>
            <blockquote>Monsieur <strong>[…]</strong> s’est dirigé vers moi et m’a déclaré distinctement : <strong>« […] »</strong>. J’ai alors exclu l’intéressé pour avoir tenu des propos blessants, injurieux et/ou grossiers.</blockquote>
            <p>⚠️ Ne pas écrire seulement : « Il m’a insulté ».</p>
            <h3>Faute physique</h3>
            <p>Toujours préciser :</p>
            <blockquote><strong>Geste + partie du corps utilisée + partie du corps touchée + intensité + ballon disputé ou non.</strong></blockquote>
          </NoteDetails>
        </section>

        <section>
          <h2>📐 Terrain — Loi 1</h2>
          <NoteDetails title="📐 Dimensions et repères essentiels">
            <p>Cette note existe dans la page source, mais ne contient actuellement aucun détail supplémentaire.</p>
          </NoteDetails>
        </section>
      </article>
    </div>
  )
}
