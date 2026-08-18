# 💊 Pharmacie App

**Pharmacie App** est une application web de gestion de pharmacie développée avec **React.js**, conçue pour faciliter la gestion quotidienne des médicaments, consommables, patients et mouvements de stock.

L'application fonctionne principalement en **mode hors ligne (offline)** et utilise une base de données SQLite côté application afin de conserver les données localement.

## 🚀 Fonctionnalités

### 📊 Tableau de bord

* Vue générale de l'activité de la pharmacie
* Suivi des produits et du stock
* Accès rapide aux différentes fonctionnalités

### 💊 Gestion des produits

* Ajout de médicaments
* Ajout de consommables
* Nom du produit
* Date d'entrée
* Numéro de lot
* Date d'expiration
* Quantité entrée
* Prix unitaire
* Gestion des différentes catégories/origines de produits

### 📦 Gestion du stock

* Fiche de stock
* Suivi des entrées
* Suivi des sorties
* Stock disponible
* Numéro de lot
* Date d'expiration
* Observations
* Historique des mouvements

### 👨‍⚕️ Gestion des patients

* Ajout des patients
* Enregistrement des informations nécessaires
* Recherche et sélection des produits associés

### 📑 Rapports

* Rapport mensuel
* Stock initial
* Entrées du mois
* Sorties du mois
* Stock final
* CMM (Consommation Moyenne Mensuelle)
* Séparation des rapports **médicaments** et **consommables**
* Génération de rapports au format PDF

### 💾 Base de données

L'application utilise une base de données locale permettant de conserver les informations de l'application sans dépendre d'un serveur distant.

La solution est basée notamment sur :

* SQLite
* sql.js
* WebAssembly (`sql-wasm-browser.wasm`)

## 📴 Fonctionnement hors ligne

Pharmacie App a été conçue pour fonctionner même sans connexion Internet.

Les données sont stockées localement afin de permettre une utilisation dans des environnements où la connexion Internet peut être limitée ou indisponible.

## 🛠️ Technologies utilisées

* **React.js**
* **Vite**
* **JavaScript**
* **CSS**
* **SQLite**
* **sql.js**
* **WebAssembly**
* **React Router**
* **jsPDF**
* **jsPDF-AutoTable**
* **html2canvas**
* **vite-plugin-pwa**

## 📁 Structure du projet

```text
pharmacie-app/
│
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icons.svg
│   └── sql-wasm-browser.wasm
│
├── src/
│   ├── components/
│   │   ├── PatientForm.jsx
│   │   ├── ProductForm.jsx
│   │   ├── Sidebar.jsx
│   │   └── StockTable.jsx
│   │
│   ├── database/
│   │   └── pharmacie.db
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Patients.jsx
│   │   ├── Produits.jsx
│   │   ├── Rapport.jsx
│   │   └── Stock.jsx
│   │
│   ├── services/
│   │   ├── db.jsx
│   │   ├── rapportService.jsx
│   │   ├── sqliteService.js
│   │   └── stockService.js
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## 💻 Installation

Cloner le projet :

```bash
git clone https://github.com/RbzEric/PHARMACIE-APP.git
```

Entrer dans le dossier :

```bash
cd PHARMACIE-APP
```

Installer les dépendances :

```bash
npm install
```

Lancer l'application en développement :

```bash
npm run dev
```

L'application sera accessible sur l'adresse indiquée par Vite, généralement :

```text
http://localhost:5173/
```

## 🏗️ Build

Pour générer la version de production :

```bash
npm run build
```

Les fichiers générés seront placés dans :

```text
dist/
```

## 👨‍💻 Auteur

**RbzEric**

Développeur Front-End | Créateur de solutions web

## 📌 Projet

**Pharmacie App** est un projet destiné à faciliter la gestion informatisée d'une pharmacie, notamment dans les environnements hospitaliers où la gestion des médicaments, consommables et stocks nécessite un suivi précis.

---

⭐ Si ce projet vous intéresse, n'hésitez pas à consulter le code source et à suivre son évolution.
