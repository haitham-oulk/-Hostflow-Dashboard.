# Hostflow – Findings (Recherches, Découvertes, Contraintes)
> *Dernière mise à jour : 2026-03-01*

---

## 1. État de l'existant

### Stack technique en place
| Élément       | Technologie                  | Version  |
|---------------|------------------------------|----------|
| Framework     | React + Vite                 | 18 / 6   |
| Styling       | Tailwind CSS + shadcn/radix  | 3.4      |
| Routing       | react-router-dom             | 7.1      |
| Charts        | Recharts                     | 2.15     |
| Language      | TypeScript                   | 5.7      |

### Pages existantes
| Page                | Fichier               | Fonctionnalité principale                 |
|---------------------|-----------------------|-------------------------------------------|
| Dashboard           | `Dashboard.tsx`       | KPIs, graphiques revenus, perf plateformes |
| Bookings            | `Bookings.tsx`        | Liste réservations, import CSV, modal ajout |
| Calendar            | `Calendar.tsx`        | Vue calendrier des réservations            |
| Documents           | `Documents.tsx`       | Gestion documentaire (squelette)           |
| Finance             | `Finance.tsx`         | Vue financière                             |
| Partners            | `Partners.tsx`        | Gestion des partenaires                    |
| Pricing Simulator   | `PricingSimulator.tsx`| Simulateur de prix inversé                 |
| Settings            | `Settings.tsx`        | Paramètres                                 |
| Tasks               | `Tasks.tsx`           | Tâches (ménage, clés)                      |

### Données actuelles
- Source : **CSV local** parsé côté client
- Persistance : **state React** (pas de backend)
- Colonnes CSV : Hosted names, Number of guest, Platforme booked, Check-in, Check-out, Net

---

## 2. Contraintes identifiées

| # | Contrainte | Impact |
|---|------------|--------|
| C1 | Pas de backend — tout est local-first | Migration vers Supabase nécessaire |
| C2 | Devise unique MAD dans le code actuel | Module EUR/MAD à ajouter |
| C3 | Pas de système d'authentification | Supabase Auth à intégrer |
| C4 | Pas de stockage fichiers (PDFs, IDs) | Supabase Storage requis |
| C5 | Messagerie absente | Module entier à construire |

---

## 3. Questions ouvertes (Phase 2 – Link)
> ⚠️ Ces questions doivent être résolues **avant** de concevoir le schéma Supabase.

*Voir section "Questions clarificatrices" dans le message de restitution.*

---

## 4. Intégrations requises

| Intégration       | Rôle                                    | Statut     |
|-------------------|-----------------------------------------|------------|
| Supabase          | Base de données, Auth, Storage, RLS     | 🔴 À faire |
| Zapier MCP        | Centraliser WhatsApp + emails Airbnb    | 🔴 À faire |
| xe.com API        | Taux de change EUR/MAD temps réel       | 🔴 À faire |
| AI Payout Auditor | Analyse PDF factures (OCR + LLM)        | 🔴 À faire |
