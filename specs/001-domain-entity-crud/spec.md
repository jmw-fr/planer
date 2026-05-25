# Spécification de fonctionnalité : Fondation CRUD d'entité de domaine

**Branche de fonctionnalité** : `002-domain-entity-crud`

**Créé le** : 2026-05-20

**Statut** : Brouillon

**Entrée** : Description utilisateur : "Créer une première entité de domaine avec ajout, mise à jour et suppression. Les entités doivent utiliser des suppressions logiques. Lors de l'implémentation de l'entité, il faut mettre en place les fondations de base pour les autres entités afin d'éviter la duplication de code et d'accélérer le développement."

## Clarifications

### Session 2026-05-20

- Q : Quelle est la première entité de domaine et comment les valeurs initiales doivent-elles être fournies ? → A : L'entité est `Sport`, décrivant tous les sports disponibles, avec des valeurs par défaut créées par seed.

## Scénarios utilisateur et tests *(obligatoire)*

### Histoire utilisateur 1 - Créer un sport disponible (Priorité : P1)

Un utilisateur autorisé de l'application peut ajouter un sport disponible avec les informations métier requises, afin que PlanerSport dispose d'un catalogue de sports concret et d'un modèle réutilisable pour les futures données de domaine.

**Pourquoi cette priorité** : La création d'un sport est la plus petite tranche de valeur utile et prouve que l'entité `Sport` peut entrer dans le système avec une validation et un cycle de vie cohérents.

**Test indépendant** : Peut être testé entièrement en ajoutant un sport valide, puis en confirmant que le sport est disponible dans les vues normales des sports actifs et contient les valeurs soumises.

**Scénarios d'acceptation** :

1. **Étant donné** un utilisateur autorisé et des détails de sport valides, **Quand** l'utilisateur ajoute le sport, **Alors** le système stocke le sport et le rend disponible dans les vues normales des sports actifs.
2. **Étant donné** un utilisateur autorisé et des détails requis manquants, **Quand** l'utilisateur tente d'ajouter le sport, **Alors** le système rejette la demande avec un retour de validation clair et ne crée pas de sport partiel.

---

### Histoire utilisateur 2 - Mettre à jour un sport existant (Priorité : P2)

Un utilisateur autorisé de l'application peut modifier un sport actif tout en préservant son identité et son historique de cycle de vie.

**Pourquoi cette priorité** : Les données de planification évoluent dans le temps, et le comportement de mise à jour doit être cohérent avant que d'autres entités réutilisent la même fondation.

**Test indépendant** : Peut être testé entièrement en modifiant un champ valide sur un sport actif, puis en confirmant que la nouvelle valeur remplace l'ancienne sans créer de doublon.

**Scénarios d'acceptation** :

1. **Étant donné** qu'un sport actif existe, **Quand** un utilisateur autorisé met à jour des détails valides, **Alors** le sport reflète les nouveaux détails et reste actif.
2. **Étant donné** qu'un sport actif existe, **Quand** un utilisateur autorisé soumet des détails de mise à jour invalides, **Alors** le système rejette la mise à jour et conserve l'état valide précédent du sport.

---

### Histoire utilisateur 3 - Supprimer un sport sans perdre l'historique (Priorité : P3)

Un utilisateur autorisé de l'application peut supprimer un sport de l'usage normal tandis que le système le conserve pour l'intégrité, l'audit et les besoins futurs de récupération.

**Pourquoi cette priorité** : La suppression logique est un comportement de cycle de vie obligatoire pour toutes les entités, et l'entité `Sport` doit établir que les éléments supprimés ne disparaissent pas de l'historique protégé du système.

**Test indépendant** : Peut être testé entièrement en supprimant un sport actif, en confirmant qu'il n'apparaît plus dans les vues normales des sports actifs, puis en confirmant que l'historique protégé conserve toujours l'état supprimé du sport.

**Scénarios d'acceptation** :

1. **Étant donné** qu'un sport actif existe, **Quand** un utilisateur autorisé le supprime, **Alors** le sport est retiré des vues normales des sports actifs sans être effacé définitivement.
2. **Étant donné** qu'un sport a déjà été supprimé, **Quand** un utilisateur autorisé tente de le supprimer à nouveau, **Alors** le système indique que le sport est déjà indisponible et ne modifie aucune donnée sans rapport.

---

### Histoire utilisateur 4 - Réutiliser le comportement commun des entités futures (Priorité : P4)

Une équipe de planification peut introduire ultérieurement des entités de domaine avec les mêmes attentes de cycle de vie, de validation et d'audit, sans redéfinir le comportement commun à chaque fois.

**Pourquoi cette priorité** : L'entité `Sport` doit réduire le délai de livraison futur et la duplication, mais cette fondation dépend d'abord de la validation du cycle de vie créer, mettre à jour et supprimer.

**Test indépendant** : Peut être évalué en comparant le comportement de l'entité `Sport` avec une base réutilisable documentée et en confirmant que les exigences des futures entités peuvent référencer cette base.

**Scénarios d'acceptation** :

1. **Étant donné** que l'entité `Sport` a été livrée, **Quand** l'équipe définit une autre entité, **Alors** les attentes communes relatives à l'identité, aux horodatages, à la validation et à la suppression logique sont déjà documentées et réutilisables.
2. **Étant donné** que la base réutilisable existe, **Quand** une future entité nécessite des règles propres à cette entité, **Alors** ces règles peuvent être ajoutées sans modifier le comportement partagé des enregistrements existants.

### Cas limites

- Une tentative de mise à jour ou de suppression d'un sport inexistant indique que le sport est indisponible et ne crée pas de nouveau sport.
- Une tentative de création d'un sport en doublon, selon les règles métier d'unicité, est rejetée avec un retour exploitable.
- Les sports supprimés sont exclus des vues normales des sports actifs et des listes de sélection.
- Les sports qui possèdent des données métier dépendantes ne peuvent pas être supprimés si cela rendrait les données de planification actives incohérentes ; l'utilisateur reçoit un retour clair.
- Les modifications concurrentes sur le même sport empêchent les écrasements accidentels et préservent l'état valide le plus récent.
- Les valeurs par défaut créées par seed doivent rester cohérentes avec les règles d'unicité et ne doivent pas recréer de doublons si le seed est relancé.

## Exigences *(obligatoire)*

### Exigences fonctionnelles

- **FR-001** : Le système DOIT fournir l'entité `Sport` comme première entité de domaine, représentant tous les sports disponibles dans PlanerSport.
- **FR-002** : Le système DOIT permettre aux utilisateurs autorisés d'ajouter un sport avec tous les champs métier requis.
- **FR-003** : Le système DOIT créer des sports par défaut au moyen d'un seed afin qu'un catalogue initial de sports disponibles existe dès la mise en service.
- **FR-004** : Le système DOIT garantir que le seed des sports par défaut peut être relancé sans créer de doublons.
- **FR-005** : Le système DOIT valider les champs requis, les valeurs autorisées, les contraintes d'unicité et les règles métier avant de créer ou de mettre à jour un sport.
- **FR-006** : Le système DOIT permettre aux utilisateurs autorisés de mettre à jour un sport actif sans modifier son identité.
- **FR-007** : Le système DOIT permettre aux utilisateurs autorisés de supprimer un sport actif au moyen d'une suppression logique.
- **FR-008** : Le système DOIT conserver les sports supprimés logiquement en dehors des vues normales des sports actifs afin de maintenir l'intégrité historique.
- **FR-009** : Le système DOIT empêcher les opérations normales de mise à jour sur les sports supprimés logiquement, sauf si un futur flux de récupération l'autorise explicitement.
- **FR-010** : Le système DOIT enregistrer suffisamment d'informations de cycle de vie pour distinguer les sports actifs des sports supprimés et identifier le moment des changements.
- **FR-011** : Le système DOIT garantir que les résultats de création, de mise à jour et de suppression sont cohérents, qu'ils soient déclenchés par des flux utilisateur ou par des intégrations système.
- **FR-012** : Le système DOIT fournir un retour clair pour les échecs de validation, les sports manquants, les doublons, les sports déjà supprimés et les suppressions bloquées par des dépendances actives.
- **FR-013** : Le système DOIT établir une base réutilisable documentée pour les futures entités de domaine couvrant l'identité, l'état de cycle de vie, les attentes de validation et le comportement de suppression logique.
- **FR-014** : Le système DOIT permettre l'ajout de règles propres à une entité sans dupliquer le comportement de cycle de vie partagé dans chaque future entité.
- **FR-015** : Le système DOIT protéger les sports supprimés conservés contre toute exposition accidentelle dans les flux actifs normaux.

### Entités clés

- **Sport** : La première entité de domaine, représentant un sport disponible dans PlanerSport. Elle possède une identité stable, un nom unique, des informations descriptives requises, un état de cycle de vie, des horodatages de changement et des métadonnées de suppression.
- **Seed des sports par défaut** : Jeu initial de sports disponibles créé automatiquement pour fournir un catalogue de départ cohérent et réexécutable sans doublons.
- **Métadonnées de cycle de vie d'entité** : Informations d'enregistrement partagées utilisées pour prendre en charge l'identité, l'état actif ou supprimé, le suivi de création, le suivi de mise à jour et le suivi de suppression pour cette entité et les futures entités.
- **Base d'entité réutilisable** : Le comportement commun documenté que les futures entités doivent suivre pour la validation, la gestion du cycle de vie et la suppression logique.

## Critères de succès *(obligatoire)*

### Résultats mesurables

- **SC-001** : Les utilisateurs autorisés peuvent créer un sport valide en moins de 1 minute pendant les tests d'acceptation.
- **SC-002** : 100 % des tentatives invalides de création et de mise à jour sont rejetées sans stocker de données partielles ou incohérentes.
- **SC-003** : 100 % des sports supprimés sont masqués des vues normales des sports actifs immédiatement après la suppression, tout en restant conservés pour l'historique protégé.
- **SC-004** : Au moins 90 % des futures entités de domaine simples peuvent référencer la base réutilisable sans redéfinir l'identité, l'état de cycle de vie ou le comportement de suppression logique.
- **SC-005** : Les tests d'acceptation couvrent les scénarios de création réussie, mise à jour réussie, suppression logique réussie, échec de validation, sport manquant, doublon et sport déjà supprimé.
- **SC-006** : Après exécution du seed, au moins un sport par défaut est disponible dans les vues normales des sports actifs.

## Hypothèses

- L'entité `Sport` est le catalogue de référence des sports disponibles dans PlanerSport.
- Les sports par défaut exacts seront définis pendant la planification ou l'implémentation, à partir d'un ensemble minimal représentatif du domaine PlanerSport.
- Les utilisateurs qui effectuent les actions d'ajout, de mise à jour et de suppression sont déjà authentifiés et autorisés par les contrôles d'accès existants de l'application.
- Les enregistrements supprimés logiquement sont conservés indéfiniment, sauf si une future politique de rétention définit explicitement une purge ou un archivage.
- Les flux de restauration ou d'annulation de suppression sont hors périmètre pour cette fonctionnalité.
- La suppression définitive par les utilisateurs finaux est hors périmètre pour cette fonctionnalité.
- La fondation réutilisable doit s'aligner avec l'architecture PlanerSport existante et les attentes d'intégrité des données définies dans la constitution du projet.
