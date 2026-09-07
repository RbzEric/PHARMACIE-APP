# 💊 Pharmacie App

> Application web de gestion de pharmacie développée avec React.js, Vite et SQLite/sql.js.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Pharmacie%20App-success?style=for-the-badge)](https://rbzeric.github.io/PHARMACIE-APP/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

## 🌐 Démo en ligne

👉 **[Accéder à Pharmacie App](https://rbzeric.github.io/PHARMACIE-APP/)**

---

## 📋 Présentation

**Pharmacie App** est une application de gestion destinée à faciliter le suivi des produits pharmaceutiques, des consommables et des mouvements de stock.

L'application a été conçue pour offrir une interface simple, rapide et adaptée à une utilisation quotidienne en pharmacie.

Elle permet notamment de gérer les produits, les patients, les stocks et les rapports mensuels.

---

## ✨ Fonctionnalités

### 📊 Tableau de bord
- Vue d'ensemble de l'activité
- Suivi des produits
- Accès rapide aux différentes fonctionnalités

### 💊 Gestion des produits
- Ajout de médicaments
- Ajout de consommables
- Gestion des informations des produits
- Organisation des produits

### 📦 Gestion du stock
- Fiche de stock
- Entrées et sorties
- Suivi des mouvements
- Consultation de l'état du stock

### 👥 Gestion des patients
- Ajout des patients
- Consultation des informations
- Gestion des données patients

### 📑 Rapports
- Rapport mensuel
- Suivi des mouvements
- Séparation des médicaments et consommables
- Génération de rapports

### 📱 Progressive Web App
- Installation possible comme application
- Fonctionnement adapté aux appareils mobiles
- Support du mode offline selon les fonctionnalités

---

## 🛠️ Technologies utilisées

- **React.js**
- **Vite**
- **JavaScript**
- **React Router**
- **SQLite / sql.js**
- **Vite PWA**
- **jsPDF**
- **jsPDF AutoTable**
- **html2canvas**
- **HTML5**
- **CSS3**

---

## 🗂️ Structure du projet

```text
PHARMACIE-APP/
│
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
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
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── package.json
├── vite.config.js
└── index.html
