# Phase 1 — Choix techniques

## 1. Objectif de la phase 1
- Mettre en place la fondation technique du produit.
- Livrer une API backend stable et un prototype web basique.
- Valider les choix de stack, la chaîne de développement et la stratégie de déploiement.
- Prioriser l’architecture pour permettre l’évolution vers Phase 2 et 3.

## 2. Portée
- Backend REST API en ASP.NET Core.
- Projet Aspire pour l'environnement de tests,
- Base de données PostgreSQL.
- Frontend Web avec Blazor WebAssembly.
- Authentification par JWT pour l’instant.
- Mise en place de tests unitaires.
- Mise en place de tests d'intégrations avec Aspire.
- Documentation initiale de l’architecture.

## 3. Choix technologiques

### 3.1 Backend
- `ASP.NET Core` (C#) pour l’API.
- Raison : maturité .NET, productivité C#, bonne intégration Azure, évolutivité.
- Architecture recommandée :
  - couche API (controllers)
  - couche application / services
  - couche données (EF Core / repository simple)
  - modèle partagé / DTOs

### 3.2 Base de données
- `PostgreSQL`
- Raison :
  - open source, robuste, performant
  - bon support cloud et containers
  - facile à migrer vers Azure Database for PostgreSQL ou équivalent managed
  - support des types avancés utiles plus tard (JSONB, arrays, etc.)
- Stratégie Phase 1 :
  - local dev : Aspire
  - production planifiée : Azure Database for PostgreSQL ou équivalent managed

### 3.3 ORM / accès données
- `Entity Framework Core` + `Npgsql` pour PostgreSQL
- Raison :
  - productivité Data Access
  - migrations EF Core
  - compatibilité avec .NET

### 3.4 Frontend Web
- `Blazor WebAssembly`
- Raison :
  - partage de compétence C# avec backend
  - rapidité de prototypage
  - bon fit pour un dashboard coach/manager
- Phase 1 : interface de base pour login, dashboard, navigation et quelques écrans CRUD.

### 3.5 Mobile
- `Flutter` reste la cible mobile.
- Phase 1 : documentation de l’API mobile, pas de développement mobile prioritaire.
- Objectif : définir les endpoints REST et les contrats de données utilisables par Flutter.

### 3.6 Authentification et sécurité
- Phase 1 : `JWT`
  - backend génère access tokens.
  - API sécurisée par token.
- Utilisateurs : organisation, rôle coach/athlète/admin.
- Future phase : migration vers Azure AD B2C si besoin d’authentification enterprise.

### 3.7 Notifications
- Phase 1 : notifications par email et système d’événements internes.
- Push réel et Notification Hubs en Phase 2/3.

### 3.8 Infrastructure et hébergement
- Option principale : `Azure`
  - App Service pour backend
  - Static Web Apps ou App Service pour Blazor
  - Azure Database for PostgreSQL
- Phase 1 peut rester en dev local + hébergement simple.
- Pipeline CI : `GitHub Actions`.

## 4. Architecture cible

### 4.1 Schéma fonctionnel
- Frontend web Blazor <-> API ASP.NET Core
- API <-> PostgreSQL via EF Core
- Authentification JWT gérée dans API
- Données métiers : utilisateurs, organisations, rôles, plans, séances, templates, feedback

### 4.2 Principales entités Phase 1
- Organisation
- Utilisateur
- Rôle
- Calendrier / Planning
- Séance
- Template d’exercice
- Charge / feedback basique

### 4.3 Principes
- découpler la logique métier de l’accès données
- définir des contrats API stables
- privilégier la simplicité et une base solide
- prévoir l’extension du modèle vers les fonctionnalités avancées

## 5. Environnement de développement
- .NET 8+ ou 9 (selon disponibilité)
- Visual Studio / VS Code
- PostgreSQL local via Aspire
- GitHub repo + branches `main`, `dev`, `feature/*`

## 6. Tests et qualité
- tests unitaires backend (service + data)
- tests d’intégration simples pour l’API
- vérification des migrations EF Core
- revue architecture et documentation

## 7. Planning de Phase 1
- Semaine 1-2 :
  - mise en place du repo
  - structure projet
  - choix backend / DB / authentification
- Semaine 3-4 :
  - API utilisateurs/organisation
  - modèle de données PostgreSQL
  - premières routes CRUD
- Semaine 5-6 :
  - frontend Blazor prototype
  - tests
  - documentation technique
  - validation de l’architecture

## 8. Risques et mitigations
- Risque : mauvaise structuration du backend.
  - Mitigation : définition claire des couches et des contracts API.
- Risque : choix DB inadapté.
  - Mitigation : PostgreSQL choisi pour flexibilité et cloud.
- Risque : accroche sur l’authentification.
  - Mitigation : démarrer simple avec JWT, remplacer progressivement.

## 9. Recommandations
- Commencer par l’API et le modèle de données.
- Documenter les endpoints et le schéma PostgreSQL.
- Ne pas essayer de livrer tout le produit en Phase 1 : valider la fondation.
- Préparer une base propre pour passer à la planification/calendrier Phase 2.
