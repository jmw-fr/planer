# Phase 1 — Séquence des étapes

## Objectif
Décrire l’ordre des travaux de la phase 1 pour lancer le développement, valider l’architecture et permettre un passage propre à la phase 2.

## 1. Préparation et cadrage initial (Semaine 1)

1. Vérifier le PRD et le document de choix techniques.
2. Créer ou valider la structure du repo Git.
3. Définir les branches Git principales : `main`, `dev`, `feature/*`.
4. Valider les outils et environnements : .NET, Docker, VS Code/Visual Studio, PostgreSQL local.

## 2. Mise en place du backend (Semaine 1-2)

1. Initialiser le projet ASP.NET Core.
2. Créer la structure de base : API, services, data, modèles partagés.
3. Ajouter EF Core et Npgsql pour PostgreSQL.
4. Définir le modèle de données initial de Phase 1 : organisation, utilisateur, rôle, séance, template.
5. Implémenter la configuration de la connexion PostgreSQL et la première migration.

## 3. Authentification et sécurité (Semaine 2)

1. Implémenter l’authentification JWT simple.
2. Créer les entités utilisateurs et rôles.
3. Protéger les routes API principales avec autorisation.
4. Ajouter la gestion des organisations.

## 4. Endpoints API de base (Semaine 2-3)

1. Implémenter les endpoints CRUD pour :
   - organisations
   - utilisateurs
   - rôles
   - templates d’exercices
   - séances
2. Ajouter la pagination/filtrage basique si nécessaire.
3. Valider les contrats API et documenter les routes.

## 5. Tests backend (Semaine 3-4)

1. Créer la base des tests unitaires pour services et logique métier.
2. Ajouter des tests d’intégration simples pour l’API.
3. Vérifier les migrations et le comportement PostgreSQL.

## 6. Mise en place du frontend Phase 1 (Semaine 4-6)

1. Initialiser le projet Blazor WebAssembly.
2. Implémenter le parcours de connexion/login.
3. Créer un tableau de bord simple pour coach/manager.
4. Ajouter les écrans CRUD de base pour organisations, utilisateurs, séances et templates.
5. Consommer l’API backend et vérifier le flux de données.

## 7. Intégration et pipeline (Semaine 5-6)

1. Configurer un pipeline GitHub Actions pour build et tests.
2. Vérifier le build backend et frontend.
3. Automatiser l’exécution des tests unitaires.
4. Valider le déploiement de base sur un environnement de dev ou local.

## 8. Livraison Phase 1 (Fin de semaine 6)

1. Réaliser une revue d’architecture des composants livrés.
2. Documents : architecture, endpoints API, schéma de base de données.
3. Vérifier la conformité aux choix techniques définis.
4. Préparer la transition vers Phase 2.

## Remarques
- Prioriser les éléments qui apportent le maximum de valeur et de stabilité.
- Ne pas complexifier les premiers livrables : l’objectif est une base solide.
- Tous les éléments doivent rester facilement extensibles pour Phase 2.
