# data-model.md

## Entités et structure de données

### Sport (entité de domaine)

- `Id : Guid` — Identifiant stable de l'entité.
- `Name : string` — Nom unique du sport, requis.
- `Code : string?` — Identifiant métier court facultatif pour certaines intégrations.
- `Description : string?` — Texte descriptif métier.
- `IsDeleted : bool` — Indique la suppression logique.
- `DeletedAtUtc : DateTime?` — Horodatage de la suppression logique.
- `DeletedById : string?` — Identifiant de l'utilisateur ayant supprimé l'entité.
- `CreatedAtUtc : DateTime` — Date de création.
- `UpdatedAtUtc : DateTime` — Date de dernière mise à jour.

### Métadonnées de cycle de vie réutilisables

- `DomainEntityBase`
  - `Id : Guid`
  - `CreatedAtUtc : DateTime`
  - `UpdatedAtUtc : DateTime`
  - `IsDeleted : bool`
  - `DeletedAtUtc : DateTime?`
  - `DeletedById : string?`

- `Sport` dérive de `DomainEntityBase` et ajoute les champs métier propres au sport.

### Relations

- `Sport` est une entité racine autonome pour l'instant.
- Aucune relation directe nécessaire pour la première itération, mais le modèle doit rester compatible avec des relations futures comme `TrainingSession`, `Category` ou `SportPreference`.

## Règles de validation

- `Name` est requis, non vide et unique parmi les sports non supprimés.
- `Code` doit être unique si fourni.
- `Description` doit respecter les limites métier (par exemple longueur maximale, caractères valides).
- `Sport` ne doit pas être créé en double lorsque le seed par défaut est relancé.
- Les mises à jour ne doivent pas changer l'identité `Id`.
- Les opérations normales de mise à jour et de suppression sont interdites sur un `Sport` avec `IsDeleted = true`, sauf via un futur flux de restauration.

## Transitions d'état

- Création : nouveau `Sport` créé avec `IsDeleted = false`, `CreatedAtUtc` et `UpdatedAtUtc` initialisés.
- Mise à jour : `UpdatedAtUtc` mis à jour, les champs métier sont validés, l'identité reste stable.
- Suppression logique : `IsDeleted` passe à `true`, `DeletedAtUtc` reçoit l'horodatage courant, `DeletedById` est défini, et l'entité est exclue des vues actives normales.
- Comportement après suppression logique : l'entité reste dans la base de données, visible uniquement via des requêtes historiques ou d'administration qui explicitement incluent les éléments supprimés.

## Implémentation EF Core

- Ajouter `DbSet<Sport>` dans `ApplicationDbContext`.
- Configurer l'entité `Sport` avec :
  - clé primaire `Id`.
  - index unique conditionnel sur `Name` lorsque `IsDeleted = false`.
  - filtre global EF Core pour `IsDeleted = false` sur les requêtes actives.
  - colonnes `CreatedAtUtc`, `UpdatedAtUtc`, `IsDeleted`, `DeletedAtUtc`, `DeletedById`.
- Créer une migration initiale pour `Sport` et appliquer la seed de données.

## Points de réutilisation future

- `DomainEntityBase` sera la base pour toutes les entités de domaine futures, fournissant l'identité, les horodatages et les métadonnées de suppression logique.
- Les règles de suppression logique et de validation de l'état doivent être encapsulées dans le noyau de domaine ou les services de use case, afin de réduire la duplication pour les entités ultérieures.
- L'approche de filtrage global garantit que la logique de visibilité active reste cohérente pour tous les objets de domaine utilisant ce modèle.
