# PRD - Logiciel de gestion de planning d'entrainement sportif

## 1. Informations generales
- **Nom du produit**: Planer Sport
- **Version du document**: 1.0
- **Date**: 2026-04-19
- **Auteur**: Equipe Produit
- **Statut**: Brouillon valide pour cadrage MVP

## 2. Contexte et problematique
Les entraineurs, clubs et sportifs individuels utilisent souvent plusieurs outils non connectes (tableurs, messageries, agenda generaliste) pour organiser les seances, suivre les charges d'entrainement et communiquer les changements. Cela provoque:
- des erreurs de planning,
- un manque de visibilite pour les athletes,
- une difficulte de suivi de la charge et de la progression,
- une perte de temps administrative pour le staff.

Le produit vise a centraliser la planification sportive, le suivi de l'execution et la communication operationnelle dans un seul logiciel.

## 3. Vision produit
Permettre a toute structure sportive de planifier, adapter et suivre les entrainements de maniere simple, fiable et collaborative, afin d'ameliorer la regularite, la performance et la prevention des blessures.
Le produit est disponible sur deux canaux complementaires: une application mobile (athletes et coachs en mobilite) et une interface web (coachs, managers, administration).

## 4. Objectifs business
1. Reduire de 40% le temps administratif de creation et mise a jour des plannings.
2. Augmenter le taux de presence moyen aux seances de 15% en 6 mois.
3. Atteindre un taux d'adoption hebdomadaire active (WAU) de 70% sur les utilisateurs inscrits.
4. Offrir une base monetisable via abonnement club et abonnement coach independant.

## 5. Objectifs utilisateur
1. Construire un planning hebdomadaire/mensuel en quelques minutes.
2. Recevoir des notifications claires en cas de changement.
3. Declarer simplement la realisation, la charge percue et le ressenti.
4. Visualiser la progression individuelle et collective.
5. Coordonner entraineurs, athletes et encadrement medical sur une meme source de verite.
6. Permettre au sportif de suivre sa seance en temps reel, avec affichage des exercices a effectuer a chaque etape.
7. Permettre au coach de planifier une saison complete avec differentes phases d'entrainement.

## 6. Personas cibles
### 6.1 Entraineur principal
- Gere plusieurs groupes et cycles d'entrainement.
- Besoin: planifier rapidement, ajuster facilement, suivre adherence et fatigue.

### 6.2 Athlete
- Suit un programme individuel ou collectif.
- Besoin: consulter ses seances, recevoir des rappels, enregistrer son feedback.

### 6.3 Responsable de club / manager sportif
- Supervise l'organisation et la qualite du suivi.
- Besoin: vision globale des groupes, taux de presence, charge, incidents.

### 6.4 Preparateur physique / staff medical
- Suit la charge et signaux de fatigue/risque.
- Besoin: acces aux donnees pertinentes, alertes seuils, coordination avec coach.

## 7. Portee
### 7.1 In scope (MVP)
- Gestion des comptes et roles (admin, coach, athlete, staff).
- Application mobile dediee (iOS/Android) pour consultation, notifications et feedback post-seance.
- Interface web dediee pour planification avancee, administration et reporting.
- Planification d'une saison d'entrainement avec phases (preparation generale, preparation specifique, competition, transition).
- Creation de plans d'entrainement (seance, microcycle, mesocycle).
- Calendrier individuel et collectif.
- Mode de suivi d'entrainement en temps reel sur mobile (sequence d'exercices, duree, repos, progression).
- Saisie et gestion de templates d'exercice reutilisables.
- Seances de kinesitherapie (kine) pour athletes en reeducation ou prevention.
- Seances de recuperation (auto-massage, marche, yoga, etc.) pour athletes en prevention ou post-effort.
- Integrations externes de base (calendrier Google/Outlook, notifications push).
- Dependances techniques definies (stack technologique, architecture).
- Bibliotheque de templates d'exercice predefinis par sport.
- Convocation et gestion des presences/absences.
- Notification des changements (email/push).
- Saisie post-seance (realise/non realise, RPE, commentaire).
- Tableau de bord de suivi (charge hebdo, adherence, regularite).
- Bibliotheque d'exercices de base.

### 7.2 Out of scope (MVP)
- IA de generation automatique de plans personalises.
- Video coaching avance et analyse biomecanique.
- Marketplace de programmes externes.
- Facturation integree complexe multi-entites.

## 8. Hypotheses clefs
- Les clubs acceptent de migrer depuis des tableurs vers un outil dedie.
- Les athletes renseignent au minimum un feedback simple apres seance.
- Les coachs utilisent le calendrier logiciel comme canal principal de communication.

## 9. Exigences fonctionnelles
### 9.1 Authentification et comptes
- Inscription et connexion securisees.
- Recuperation de mot de passe.
- Gestion des roles et permissions par organisation.

### 9.2 Organisation sportive
- Creation d'une organisation (club/academie).
- Creation de groupes (ex: U18, Elite, Reathletisation).
- Affectation des athletes et membres du staff.

### 9.3 Planification d'entrainement
- Creation de seances avec:
  - date/heure,
  - lieu,
  - objectif,
  - contenu (echauffement, bloc principal, retour au calme),
  - duree,
  - intensite cible,
  - materiel requis.
- Duplication de seances et templates reutilisables.
- Planification recurrente (ex: tous les mardis 18h).
- Glisser-deposer dans le calendrier (web).

### 9.4 Planification de saison et phases
- Le coach peut creer une saison avec date de debut et date de fin.
- Le coach peut definir plusieurs phases de saison (ex: preparation generale, preparation specifique, competition, transition) avec periode, objectif et niveau d'intensite cible.
- Le coach peut associer des mesocycles/microcycles a chaque phase.
- Le coach peut visualiser la saison sur une frise/calendrier avec les phases colorees.
- Le coach peut reajuster les dates de phase et propager les decalages sur les seances associees.

### 9.5 Suivi execution et feedback
- Pointage presence/absence/retard.
- Validation seance realisee par l'athlete.
- Saisie RPE (echelle 1 a 10) et ressenti libre.
- Calcul simple de charge interne: charge = duree (min) x RPE.

### 9.6 Communication
- Notifications automatiques sur:
  - nouvelle seance,
  - modification,
  - annulation,
  - rappel avant seance.
- Canal de commentaire par seance.

### 9.7 Reporting et tableaux de bord
- Vue coach: adherence, absences, charge hebdo par athlete.
- Vue manager: activite des groupes, taux de participation, tendances mensuelles.
- Export CSV des donnees principales.

### 9.8 Administration
- Parametrage des sports, types de seances, tags.
- Journal d'activite minimal (qui a modifie quoi et quand).

### 9.9 Templates d'exercice
- Le coach peut creer un template d'exercice avec les champs: nom, categorie, objectif, description, equipement, duree cible ou repetitions/series, temps de repos, consignes de securite.
- Le coach peut modifier, archiver et dupliquer un template d'exercice.
- Un template peut etre partage a l'echelle d'un groupe ou d'une organisation selon les permissions.
- Les templates sont selectionnables lors de la creation d'une seance sur l'interface web.
- Les templates utilises dans une seance sont affiches dans le mode guide temps reel sur mobile.
- Le logiciel supporte des exercices issus de disciplines diverses (musculation, course, nage, etc.) pour enrichir les seances d'un sport principal, avec categorisation par type d'exercice et sport d'origine.

### 9.10 Canaux et parite fonctionnelle
- Le logiciel doit inclure une application mobile et une interface web.
- L'application mobile cible en priorite les parcours athletes et coach terrain: consultation planning, notifications, validation seance, saisie RPE/commentaire.
- L'interface web cible en priorite les parcours coach/manager/admin: planification detaillee, gestion groupes, reporting, parametrage.
- Les donnees doivent etre synchronisees en temps reel ou quasi temps reel entre mobile et web.
- Les droits d'acces et permissions doivent etre coherents entre les deux canaux.

### 9.11 Suivi d'entrainement en temps reel (mobile)
- Le sportif peut demarrer une seance depuis l'application mobile en mode guide.
- L'application affiche en temps reel l'exercice courant, les repetitions/series ou la duree cible, ainsi que le temps de repos.
- L'application indique automatiquement l'exercice suivant et la progression dans la seance (etape x/y).
- Le sportif peut marquer un exercice comme termine, mettre en pause et reprendre la seance.
- Les adaptations de seance publiees par le coach sont visibles en quasi temps reel sur la seance mobile active.

### 9.12 Seances de kinesitherapie
- Le kinésithérapeute peut creer des seances de kine individuelles ou de groupe avec objectifs medicaux (reeducation, prevention, renforcement).
- Les seances de kine peuvent inclure des exercices de mobilite, etirements, proprioception, renforcement musculaire cible.
- Le kinésithérapeute peut associer des notes medicales privees a chaque seance (non visibles par les athletes).
- Les athletes peuvent suivre une seance de kine en mode guide mobile similaire aux seances d'entrainement.
- Le staff medical peut suivre l'adherence et le ressenti post-seance de kine via le dashboard.
- Les seances de kine sont distinguees des seances d'entrainement dans le calendrier (couleur/code different).

### 9.13 Seances de recuperation
- Le coach ou preparateur physique peut creer des seances de recuperation individuelles ou collectives (auto-massage, marche, yoga, etirements passifs, etc.).
- Les seances de recuperation peuvent etre programmees en prevention (ex: post-match) ou en reponse a une charge elevee detectee.
- Les athletes peuvent suivre une seance de recuperation en mode guide mobile avec rappels de duree et consignes simples.
- Le feedback post-recuperation peut inclure un ressenti de fraicheur ou de fatigue residuelle.
- Les seances de recuperation sont distinguees dans le calendrier (couleur/code different) et peuvent etre marquees comme optionnelles.

### 9.14 Integrations externes
- Synchronisation bidirectionnelle avec calendriers externes (Google Calendar, Outlook) pour import/export des seances.
- Notifications push via Azure Notification Hubs pour rappels de seance et modifications.
- Export CSV/JSON des donnees principales (planning, presence, charge) pour integration avec outils tiers.
- Possibilite d'import de donnees depuis feuilles Excel existantes pour migration initiale.

### 9.15 Dependances techniques et architecture
- Frontend web: Blazor avec C# pour l'interface coach/manager (partage de code avec backend).
- Frontend mobile: Flutter pour applications iOS/Android.
- Backend: ASP.Net Core avec C# et base de donnees SQL Server ou PostgreSQL.
- Architecture: API RESTful avec authentification JWT, stockage cloud (Azure/AWS S3), deploiement conteneurise (Docker).
- Securite: Chiffrement TLS 1.3, conformite RGPD avec audit trails.

## 10. Exigences non fonctionnelles
### 10.1 Performance
- Chargement d'un calendrier hebdomadaire < 2 secondes pour 95% des requetes.
- Enregistrement feedback post-seance < 1 seconde pour 95% des requetes.
- Affichage de l'exercice suivant en mode guide mobile < 500 ms pour 95% des transitions.

### 10.2 Securite et conformite
- Chiffrement TLS en transit.
- Hashage fort des mots de passe.
- Gestion des acces par role stricte.
- Respect RGPD: consentement, droit d'acces, droit a l'effacement, minimisation des donnees.

### 10.3 Disponibilite
- SLA cible MVP: 99.5% mensuel.
- Sauvegardes quotidiennes et restauration testee.

### 10.4 Scalabilite
- Support de 100 organisations, 50 000 athletes en base, sans degradation majeure.

### 10.5 Accessibilite et UX
- Interface responsive mobile et desktop.
- Parcours principal realisable en moins de 3 actions pour consulter la prochaine seance.
- Respect des bonnes pratiques d'accessibilite (contraste, navigation clavier, labels).

## 11. Parcours utilisateur clefs
### 11.1 Coach cree un microcycle
1. Selectionne son groupe.
2. Definit la phase de saison cible et ses objectifs.
3. Ajoute 4 seances dans la semaine via template.
4. Ajuste les objectifs et l'intensite cible.
5. Publie le planning et notifie le groupe.

### 11.2 Athlete consulte et valide
1. Ouvre l'application.
2. Consulte sa prochaine seance.
3. Lance le mode guide temps reel et suit les exercices proposes et les temps de repos.
4. Valide chaque etape de la seance jusqu'a completion.
5. Saisit RPE et commentaire en fin de seance.

### 11.3 Manager suit l'activite
1. Ouvre le tableau de bord global.
2. Compare les taux de presence par groupe.
3. Exporte les donnees mensuelles pour reporting interne.

### 11.4 Kinesitherapeute gere une seance de reeducation
1. Selectionne l'athlete en reeducation.
2. Cree une seance de kine avec exercices cibles (etirements, renforcement).
3. Ajoute des notes medicales privees.
4. Publie la seance et suit l'adherence via le dashboard.

### 11.5 Coach programme une seance de recuperation
1. Identifie un besoin de recuperation (post-match ou charge elevee detectee).
2. Cree une seance de recuperation collective (marche, auto-massage, yoga).
3. Marque la seance comme optionnelle.
4. Publie et suit l'adherence volontaire via le dashboard.

## 12. KPI et metriques de succes
- Taux de presence moyen par groupe.
- Taux de seances avec feedback complet.
- WAU/MAU par role utilisateur.
- Delai moyen de publication d'un planning hebdo.
- Nombre moyen de modifications de planning par semaine.
- NPS coach et NPS athlete.

## 13. Priorisation (MoSCoW)
### Must have
- Roles et permissions
- Calendrier de seances
- Planification de saison avec phases
- Saisie et reutilisation de templates d'exercice
- Notifications de changement
- Presence + feedback RPE
- Dashboard adherence/charge de base

### Should have
- Templates avances par sport
- Export CSV enrichi
- Alertes fatigue seuil RPE
- Seances de kinesitherapie de base
- Seances de recuperation collectives

### Could have
- Integration wearables (Garmin, Polar)
- Suggestions automatiques de deload

### Won't have (MVP)
- IA generative de plan complet
- Analyse video automatisee

## 14. Contraintes et dependances
- Disponibilite d'un service d'envoi de notifications (email/push).
- Definition d'un referentiel commun d'exercices par sport.
- Validation legale RGPD et politique de retention des donnees.
- Capacite du staff a accompagner le changement d'usage.

## 15. Risques et mitigations
1. **Faible adoption athlete**
   - Mitigation: UX mobile ultra simple, rappels automatises, onboarding guide.
2. **Surcharge de saisie pour coach**
   - Mitigation: templates, duplication, import initial depuis CSV.
3. **Qualite de donnees heterogene**
   - Mitigation: champs standardises + validations minimales.
4. **Sensibilite donnees sante**
   - Mitigation: controle d'acces strict, traceabilite, minimisation donnees.

## 16. Plan de release
### Phase 0 - Cadrage (2 a 3 semaines)
- Ateliers metiers, validation scope MVP, maquettes principales.

### Phase 1 - MVP (8 a 12 semaines)
- Auth, roles, calendrier, notifications, presence, feedback, dashboard de base.

### Phase 2 - Stabilisation (3 a 4 semaines)
- Corrections, optimisation performance, instrumentation KPI.

### Phase 3 - Evolution (post-MVP)
- Integrations externes, alertes avancees, analytique renforcee.

## 23. Lot 2 - Evolution post-MVP
### 23.1 Metriques de succes detaillees
- Definir des seuils cibles pour chaque KPI (ex: taux presence >85%, NPS >7/10).
- Ajouter des metriques techniques (temps de reponse, taux d'erreur, retention utilisateurs).
- Benchmarks concurrentiels et analyse de satisfaction utilisateur detaillee.

### 23.2 Analyse des risques et mitigation etendue
- Risques techniques (scalabilite, securite des donnees medicales).
- Risques metier (adoption par les clubs, concurrence).
- Plan de continuite (backup, reprise d'activite).

### 23.3 Scenarios de test et validation
- Tests utilisateurs pilotes avec clubs partenaires.
- Criteres de qualite (accessibilite WCAG, performance mobile).
- Validation conformite reglementaire (RGPD, donnees de sante).

### 23.4 Budget et ressources estimees
- Estimation cout developpement MVP et Lot 2.
- Equipe requise (developpeurs, designers, PM).
- Plan de recrutement et formation.

### 23.5 Maintenance et evolution
- Plan de support utilisateur (hotline, FAQ, tutoriels).
- Roadmap Lot 2 (fonctionnalites prioritaires: IA, wearables, analytics).
- Strategie de monetisation detaillee (abonnements, premium features).

## 17. Criteres d'acceptation MVP
1. Un coach peut creer et publier un planning hebdomadaire complet pour un groupe.
2. Un athlete peut consulter ses seances et soumettre son feedback post-seance en moins de 60 secondes.
3. Toute modification de seance envoie une notification aux membres concernes.
4. Un manager peut visualiser un reporting mensuel de presence et charge.
5. Les donnees utilisateur respectent les exigences RGPD definies.
6. Les parcours MVP critiques sont disponibles sur application mobile et interface web selon les usages definis.
7. Un sportif peut suivre une seance en temps reel sur mobile avec affichage dynamique de l'exercice a effectuer et de l'exercice suivant.
8. Un coach peut planifier une saison complete avec au moins 3 phases et associer les cycles d'entrainement a chaque phase.
9. Un kinesitherapeute peut creer et assigner des seances de kine individuelles avec suivi d'adherence.
10. Un coach peut programmer des seances de recuperation collectives avec suivi d'adherence optionnel.

## 18. Questions ouvertes
- Faut-il inclure des objectifs nutrition/sommeil dans le MVP ou phase suivante?
- Quel niveau de personnalisation par discipline sportive est requis au lancement?
- Quel canal de notification est prioritaire selon les segments (email, push, SMS)?

## 19. Annexes (optionnel)
- Glossaire: microcycle, mesocycle, RPE, charge interne.
- Maquettes ecrans (a ajouter).
- Schema de donnees initial (a ajouter).

## 22. Exemples de templates d'exercice predefinis
### Football - Seance musculation generale
- Squats: 4 series x 10 repetitions
- Fentes avant: 3 series x 12 repetitions/jambe
- Pompes: 3 series x 15 repetitions
- Tractions (assistees): 3 series x 8 repetitions
- Gainage: 3 series x 30 secondes

### Basketball - Seance coordination et agilite
- Sauts en hauteur: 4 series x 8 repetitions
- Dribble technique: 3 series x 2 minutes
- Tirs au panier: 3 series x 20 tirs
- Equilibre sur une jambe: 3 series x 30 secondes/jambe
- Yoga dynamique: 3 series x 5 minutes

### Natation - Seance endurance
- Crawl continu: 10 x 100m avec 20s repos
- Brasse technique: 8 x 50m avec 30s repos
- Dos crawle: 6 x 75m avec 45s repos
- Nage avec palmes: 4 x 200m avec 1min repos

### Recuperation - Seance post-match
- Marche active: 20 minutes a rythme modere
- Auto-massage cuisses: 5 minutes par jambe
- Etirements passifs: 10 minutes (quadriceps, ischio-jambiers, adducteurs)
- Respiration profonde: 5 minutes de meditation

### Kinesitherapie - Renforcement genou
- Squats isometriques: 3 series x 20 secondes
- Extensions jambe tendue: 3 series x 15 repetitions
- Flexions jambe assise: 3 series x 12 repetitions
- Proprioception unipodale: 3 series x 30 secondes
- Mobilite articulaire: 5 minutes de rotations douces

## 20. Liste indicative de sports et exercices supportes
### Sports principaux cibles (exemples)
- Football
- Basketball
- Rugby
- Handball
- Volleyball
- Tennis
- Natation
- Athletisme
- Cyclisme
- Course d'orientation
- Arts martiaux (judo, karaté, etc.)
- Gymnastique
- Danse

### Exercices transversaux (musculation, course, nage, etc.)
- **Musculation**: squats, fentes, pompes, tractions, developpe couche, souleve de terre, etc.
- **Course**: fractionne, endurance, fartlek, sprint, marche nordique, etc.
- **Natation**: crawl, brasse, dos crawle, nage avec palmes, etc.
- **Mobilite/Preparation physique**: yoga, pilates, etirements dynamiques, gainage, etc.
- **Coordination**: exercices de proprioception, sauts, equilibre, etc.
- **Conditionnement**: circuits training, HIIT, tabata, etc.
- **Kinesitherapie**: etirements therapeutiques, renforcement musculaire cible, mobilite articulaire, proprioception medicale, etc.
- **Recuperation**: auto-massage, marche active, yoga restaurateur, etirements passifs, respiration, etc.

### Exemples concrets d'exercices multi-sports dans une seance
- **Seance football avec musculation**: echauffement course + squats + dribble technique + developpe couche + jeu reduit.
- **Seance basketball avec natation**: echauffement natation + pompes + tirs au panier + gainage + nage endurance.
- **Seance rugby avec course**: fractionne + plaquage technique + squats + fartlek + etirements.

Cette liste est extensible via parametrage admin et peut etre enrichie par les utilisateurs (templates personnalises).

## 20. Mini user story map - Mode guide temps reel (mobile)
### Activite 1 - Preparer la seance
- En tant que sportif, je veux voir ma seance du jour pour verifier son contenu avant de la demarrer.
- En tant que sportif, je veux telecharger la seance sur mon mobile pour limiter l'impact d'une connexion instable.

### Activite 2 - Demarrer le mode guide
- En tant que sportif, je veux lancer la seance en 1 action pour commencer rapidement.
- En tant que sportif, je veux voir l'objectif global de la seance (duree totale, nombre d'exercices) au demarrage.

### Activite 3 - Executer chaque exercice
- En tant que sportif, je veux voir l'exercice courant avec consignes (series/repetitions ou duree) pour executer correctement.
- En tant que sportif, je veux voir un chronometre et les temps de repos pour suivre le rythme attendu.
- En tant que sportif, je veux marquer l'exercice comme termine pour passer a l'etape suivante.

### Activite 4 - Gerer le rythme en seance
- En tant que sportif, je veux mettre en pause et reprendre la seance pour m'adapter a mon contexte reel.
- En tant que sportif, je veux revenir a l'exercice precedent en cas d'erreur de validation.

### Activite 5 - S'adapter aux changements coach
- En tant que sportif, je veux recevoir les modifications de seance publiees par le coach en quasi temps reel.
- En tant que sportif, je veux etre informe clairement lorsqu'un exercice est remplace ou ajuste.

### Activite 6 - Cloturer et transmettre le feedback
- En tant que sportif, je veux finaliser la seance et voir un recapitulatif (duree, exercices completes, ecarts).
- En tant que sportif, je veux saisir mon RPE et un commentaire pour transmettre mon ressenti au coach.

### Tranche MVP recommandee
- Consulter la seance du jour.
- Demarrer la seance en mode guide.
- Afficher exercice courant + suivant, chronometre et repos.
- Valider une etape, pause/reprise.
- Cloturer la seance avec RPE/commentaire.

### Tranche post-MVP recommandee
- Mode hors ligne complet avec resynchronisation intelligente.
- Adaptation automatique du rythme selon progression en direct.
- Guidance audio et integration wearables en temps reel.

## 21. Exemple concret - Saison type (10 mois)
### Hypothese de calendrier
- Debut de saison: septembre
- Fin de saison: juin
- Contexte: sport collectif avec 1 match officiel par semaine en periode competitive

### Phase 1 - Preparation generale (semaines 1 a 8)
- Objectif principal: developper la base physique (endurance, force generale, mobilite).
- Volume d'entrainement: eleve.
- Intensite moyenne: moderee.
- Repartition indicative: 60% physique general, 25% technique, 15% tactique.
- KPI de phase: assiduite, tolerance a la charge, progression tests physiques de base.

### Phase 2 - Preparation specifique (semaines 9 a 14)
- Objectif principal: transferer les acquis vers les exigences specifiques de la discipline.
- Volume d'entrainement: moyen a eleve.
- Intensite moyenne: moderee a elevee.
- Repartition indicative: 35% physique specifique, 35% technique, 30% tactique.
- KPI de phase: qualite d'execution des scenarios de jeu, RPE maitrise, reduction des ecarts entre postes.

### Phase 3 - Competition 1 (semaines 15 a 26)
- Objectif principal: maximiser la performance en match et stabiliser la fraicheur.
- Volume d'entrainement: moyen.
- Intensite moyenne: elevee sur seances cibles, allegee en veille de match.
- Repartition indicative: 20% physique maintien, 35% technique, 45% tactique.
- KPI de phase: disponibilite des athletes, performance match, maintien charge sans sur-fatigue.

### Phase 4 - Transition intermediaire (semaines 27 a 29)
- Objectif principal: recuperation active et prevention des blessures.
- Volume d'entrainement: faible.
- Intensite moyenne: faible a moderee.
- Repartition indicative: 50% recuperation/mobilite, 30% technique legere, 20% ludique.
- KPI de phase: baisse fatigue percue, retour de motivation, absence de blessures de surcharge.

### Phase 5 - Competition 2 (semaines 30 a 40)
- Objectif principal: pic de performance sur la fin de saison.
- Volume d'entrainement: moyen.
- Intensite moyenne: elevee avec microcycles de deload planifies.
- Repartition indicative: 20% physique maintien, 30% technique, 50% tactique.
- KPI de phase: forme sportive, regularite resultats, adherence plan de deload.

### Exemple de regles de planification associees
- Regle 1: toute phase doit contenir au moins 1 mesocycle et 2 microcycles.
- Regle 2: en phase competition, bloquer automatiquement un jour de recuperation post-match.
- Regle 3: declencher une alerte si charge hebdomadaire augmente de plus de 20% sur 2 semaines consecutives.
- Regle 4: imposer une semaine allegee toutes les 4 a 6 semaines selon le niveau du groupe.

### Valeur produit attendue
- Donner au coach une vision macro (saison) et micro (seance) dans un meme outil.
- Aligner staff sportif et medical sur une periodisation explicite.
- Faciliter les arbitrages de charge grace a des phases lisibles et mesurables.