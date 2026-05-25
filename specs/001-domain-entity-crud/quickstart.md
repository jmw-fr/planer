# quickstart.md

## Objectif

Fournir un guide de démarrage pour implémenter la fonctionnalité `Sport` dans l'architecture existante PlanerSport.

## Étapes clés

1. Ajouter le modèle de domaine `Sport` à `src/PlanerSport.Core`.
   - Créer `src/PlanerSport.Core/SportAggregate/Sport.cs`.
   - Créer `src/PlanerSport.Core/DomainEntityBase.cs` ou équivalent pour les métadonnées de cycle de vie.

2. Ajouter le mapping EF Core et les migrations à `src/PlanerSport.Infrastructure`.
   - Mettre à jour `ApplicationDbContext.cs` pour exposer `DbSet<Sport>`.
   - Configurer l'entité `Sport` et le filtre global de suppression logique.
   - Créer une migration EF Core pour le schéma `Sport`.

3. Ajouter le contrat gRPC dans `src/PlanerSport.Api/Protos`.
   - Créer `sport.proto` avec `SportService`, `CreateSport`, `UpdateSport`, `DeleteSport`, `GetSport`, `ListSports`.
   - Générer les classes C# via le projet API build.

4. Implémenter la logique de cas d'utilisation dans `src/PlanerSport.UseCases`.
   - Ajouter des commandes/handlers pour créer, mettre à jour et supprimer logiquement un sport.
   - Valider les règles métier : identité stable, unicité, champs requis, suppression logique.

5. Ajouter le seed de données des sports par défaut.
   - Créer une routine de seed répétable qui n'ajoute pas de doublons.
   - Exécuter le seed depuis l'hôte de démarrage (`src/PlanerSport.AppHost` ou une extension Infrastructure).

6. Ajouter des tests automatiques.
   - `tests/PlanerSport.Core.Tests` : validation du modèle, état de cycle de vie et règles métier.
   - `tests/PlanerSport.Api.Tests` : tests d'intégration gRPC pour création, mise à jour, suppression logique et visibilité active.

## Commandes de démarrage

```powershell
cd c:\Users\jmw_f\source\repos\PlanerSport
# Compiler la solution
dotnet build PlanerSport.slnx
# Exécuter les tests de domaine
dotnet test tests\PlanerSport.Core.Tests\PlanerSport.Core.Tests.csproj
# Exécuter les tests API
dotnet test tests\PlanerSport.Api.Tests\PlanerSport.Api.Tests.csproj
```

## Vérification

- Vérifier que la migration EF Core créée `Sport` et que le filtre global exclut les éléments supprimés.
- Vérifier que le seed est réexécutable sans doublons.
- Vérifier que les requêtes de liste retournent uniquement les sports actifs.
- Vérifier que les tentatives de mise à jour ou suppression sur un sport supprimé échouent proprement.

## Notes d'architecture

- La mise en œuvre doit rester cohérente avec l'architecture existante : `src/PlanerSport.Core`, `src/PlanerSport.Infrastructure`, `src/PlanerSport.Api`, `src/PlanerSport.UseCases`.
- Ne pas introduire de nouvelle plateforme ou nouveau framework majeur.
- L'implémentation doit s'appuyer sur les pratiques de sécurité et de validation existantes dans la solution.
