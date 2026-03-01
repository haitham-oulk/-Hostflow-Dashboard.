# Hostflow – Master Task Plan (BLAST Framework)
> *Dernière mise à jour : 2026-03-01*

---

## Phase 0 : Protocole d'initialisation
- [x] Créer `task_plan.md` (ce fichier)
- [x] Créer `findings.md`
- [x] Créer `progress.md`
- [x] Créer `gemini.mmd`
- [ ] Poser les questions clarificatrices sur la base de données Supabase

---

## Phase 1 : Blueprint (Vision & Logique)
> Objectif : Définir le « North Star », valider les modules core, figer les user stories.

- [ ] Valider le Singular Desired Outcome avec l'utilisateur
- [ ] Lister les modules core et leurs dépendances
  - [ ] Simulateur de Prix (calcul inversé Airbnb +3 %, Booking +22 %)
  - [ ] Intelligence Financière (convertisseur EUR/MAD, AI Payout Auditor)
  - [ ] Portail Invité & Conformité (upload pièces d'identité, certificats)
  - [ ] Messagerie Unifiée (3 panneaux, brouillons IA)
- [ ] Figer le schéma conceptuel de données dans `gemini.mmd`

---

## Phase 2 : Link (Source of Truth & Intégrations)
> Objectif : Concevoir le schéma Supabase et lister les intégrations MCP/API.

- [ ] Questions clarificatrices → réponses dans `findings.md`
- [ ] Concevoir le schéma Supabase (tables, relations, RLS)
  - [ ] `properties` (biens locatifs)
  - [ ] `bookings` (réservations)
  - [ ] `guests` (profils invités)
  - [ ] `payouts` (factures & payements)
  - [ ] `documents` (pièces d'identité, certificats)
  - [ ] `messages` (messagerie unifiée)
  - [ ] `exchange_rates` (taux de change)
- [ ] Configurer Supabase MCP
- [ ] Configurer Zapier MCP (WhatsApp + emails Airbnb)
- [ ] Configurer l'API de taux de change (xe.com ou alternative)
- [ ] Migrer les données CSV existantes vers Supabase

---

## Phase 3 : Architect (Architecture technique)
> Objectif : Structurer le code front-end et back-end.

- [ ] Définir l'architecture front-end (React/Vite/Tailwind – existant)
- [ ] Intégrer Supabase client dans le projet
- [ ] Créer les hooks et services data-first
- [ ] Restructurer les pages existantes pour consommer Supabase
- [ ] Ajouter les nouvelles pages/modules manquants

---

## Phase 4 : Style (UI/UX ultra-moderne)
> Objectif : Appliquer le design system premium.

- [ ] Auditer le design existant (composants shadcn/radix)
- [ ] Appliquer le thème Hostflow (palette, typographie, glassmorphism)
- [ ] Animations et micro-interactions
- [ ] Responsive & accessibilité

---

## Phase 5 : Trigger (Déploiement & Auto-réparation)
> Objectif : Rendre l'app déployable et robuste.

- [ ] CI/CD pipeline
- [ ] Tests E2E critiques
- [ ] Monitoring & alertes
- [ ] Mécanismes d'auto-réparation (retry, fallback)
