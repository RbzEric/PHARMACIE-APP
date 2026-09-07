import initSqlJs from "sql.js";

let db = null;
let dbReady = null;


// ======================================================
// SAUVEGARDE DATABASE
// ======================================================

function saveDatabase() {

  if (!db) return;

  const data = db.export();

  const array = Array.from(data);

  localStorage.setItem(
    "pharmacie-db",
    JSON.stringify(array)
  );
}


// ======================================================
// NORMALISATION
// ======================================================

function normaliserTexte(value) {

  return String(value || "")
    .trim()
    .toUpperCase();
}


// ======================================================
// INITIALISATION DATABASE
// ======================================================

export function initDB() {

  if (!dbReady) {

    dbReady = initSqlJs({

      locateFile: file => {

        return new URL(
          `./${file}`,
          window.location.href
        ).href;

      }

    })
      .then(SQL => {

        // ==============================================
        // CHARGER DATABASE EXISTANTE
        // ==============================================

        const saved =
          localStorage.getItem("pharmacie-db");


        if (saved) {

          try {

            const binary =
              new Uint8Array(
                JSON.parse(saved)
              );

            db = new SQL.Database(binary);

          } catch (error) {

            console.error(
              "Erreur chargement database :",
              error
            );

            db = new SQL.Database();

          }

        } else {

          db = new SQL.Database();

        }


        // ==============================================
        // TABLE PRODUITS
        // ==============================================

        db.run(`

          CREATE TABLE IF NOT EXISTS produits (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nom TEXT,

            quantite INTEGER,

            prix REAL,

            lot TEXT,

            date_entree TEXT,

            date_expiration TEXT,

            type TEXT,

            origine TEXT

          );

        `);


        // ==============================================
        // TABLE MOUVEMENTS
        // ==============================================

        db.run(`

          CREATE TABLE IF NOT EXISTS mouvements (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            produit_id INTEGER,

            nom TEXT,

            origine TEXT,

            lot TEXT,

            date TEXT,

            entree INTEGER,

            sortie INTEGER,

            observation TEXT

          );

        `);


        // ==============================================
        // MIGRATION PRODUITS
        // ==============================================

        let produitsColumns =
          db.exec(
            "PRAGMA table_info(produits)"
          );

        let nomsProduits =
          produitsColumns.length
            ? produitsColumns[0].values.map(
                row => row[1]
              )
            : [];


        if (!nomsProduits.includes("date_entree")) {

          db.run(`
            ALTER TABLE produits
            ADD COLUMN date_entree TEXT
          `);

        }


        if (!nomsProduits.includes("origine")) {

          db.run(`
            ALTER TABLE produits
            ADD COLUMN origine TEXT
          `);

        }


        // ==============================================
        // MIGRATION MOUVEMENTS
        // ==============================================

        let mouvementsColumns =
          db.exec(
            "PRAGMA table_info(mouvements)"
          );

        let nomsMouvements =
          mouvementsColumns.length
            ? mouvementsColumns[0].values.map(
                row => row[1]
              )
            : [];


        if (!nomsMouvements.includes("produit_id")) {

          db.run(`
            ALTER TABLE mouvements
            ADD COLUMN produit_id INTEGER
          `);

        }


        if (!nomsMouvements.includes("origine")) {

          db.run(`
            ALTER TABLE mouvements
            ADD COLUMN origine TEXT
          `);

        }


        if (!nomsMouvements.includes("lot")) {

          db.run(`
            ALTER TABLE mouvements
            ADD COLUMN lot TEXT
          `);

        }


        // ==============================================
        // VALEURS PAR DEFAUT
        // ==============================================

        db.run(`

          UPDATE produits

          SET origine = 'FANOME'

          WHERE origine IS NULL
          OR TRIM(origine) = ''

        `);


        db.run(`

          UPDATE produits

          SET type = 'medicament'

          WHERE type IS NULL
          OR TRIM(type) = ''

        `);


        db.run(`

          UPDATE mouvements

          SET origine = 'FANOME'

          WHERE origine IS NULL
          OR TRIM(origine) = ''

        `);


        // ==============================================
        // CONSOLIDATION DES DOUBLONS
        //
        // IMPORTANT :
        // nom + type + origine
        //
        // LOT NON PRIS EN COMPTE
        // ==============================================

        consoliderDoublons();


        console.log(
          "Database pharmacie initialisée"
        );


        saveDatabase();

      });

  }


  return dbReady;
}


// ======================================================
// CONSOLIDER LES DOUBLONS
// ======================================================

function consoliderDoublons() {

  if (!db) return;


  const res = db.exec(`

    SELECT
      id,
      nom,
      type,
      origine

    FROM produits

    ORDER BY id ASC

  `);


  if (
    res.length === 0 ||
    res[0].values.length === 0
  ) {

    return;

  }


  const produits =
    res[0].values.map(row => ({

      id: Number(row[0]),

      nom: row[1] || "",

      type:
        row[2] || "medicament",

      origine:
        row[3] || "FANOME"

    }));


  const groupes = new Map();


  // ==============================================
  // GROUPEMENT
  // ==============================================

  for (const produit of produits) {

    const key = [

      normaliserTexte(produit.nom),

      normaliserTexte(produit.type),

      normaliserTexte(produit.origine)

    ].join("|");


    if (!groupes.has(key)) {

      groupes.set(
        key,
        []
      );

    }


    groupes
      .get(key)
      .push(produit);

  }


  // ==============================================
  // FUSION
  // ==============================================

  for (const groupe of groupes.values()) {

    if (groupe.length <= 1) {

      continue;

    }


    // Le plus petit ID devient le produit principal

    const principal =
      groupe[0];


    const doublons =
      groupe.slice(1);


    for (const doublon of doublons) {

      // ==========================================
      // TRANSFERER LES MOUVEMENTS
      // ==========================================

      db.run(`

        UPDATE mouvements

        SET produit_id = ?

        WHERE produit_id = ?

      `,

      [

        principal.id,

        doublon.id

      ]);


      // ==========================================
      // SUPPRIMER DOUBLON
      // ==========================================

      db.run(`

        DELETE FROM produits

        WHERE id = ?

      `,

      [

        doublon.id

      ]);

    }


    // ==========================================
    // RECALCUL QUANTITE
    // ==========================================

    const stock =
      calculerStockInterne(
        principal.id
      );


    db.run(`

      UPDATE produits

      SET quantite = ?

      WHERE id = ?

    `,

    [

      stock,

      principal.id

    ]);

  }

}


// ======================================================
// CALCUL STOCK INTERNE
// ======================================================

function calculerStockInterne(produitId) {

  const res = db.exec(`

    SELECT

      COALESCE(SUM(entree), 0)
      -
      COALESCE(SUM(sortie), 0)

    FROM mouvements

    WHERE produit_id = ?

  `,

  [

    Number(produitId)

  ]);


  if (
    res.length === 0 ||
    res[0].values.length === 0
  ) {

    return 0;

  }


  return Number(
    res[0].values[0][0] || 0
  );

}


// ======================================================
// GET PRODUITS
// ======================================================

export async function getProduits() {

  await initDB();


  const res = db.exec(`

    SELECT *

    FROM produits

    ORDER BY nom ASC, type ASC, origine ASC, id ASC

  `);


  if (res.length === 0) {

    return [];

  }


  return res[0].values.map(row => ({

    id: Number(row[0]),

    nom: row[1] || "",

    quantite:
      Number(row[2] || 0),

    prix:
      Number(row[3] || 0),

    lot:
      row[4] || "",

    date_entree:
      row[5] || "",

    date_expiration:
      row[6] || "",

    type:
      row[7] || "medicament",

    origine:
      row[8] || "FANOME"

  }));

}


// ======================================================
// AJOUTER PRODUIT
//
// Si même nom + type + origine existe déjà :
// ON NE CREE PAS UN NOUVEAU PRODUIT.
//
// On retourne simplement l'ID existant.
// ======================================================

export async function ajouterProduit(p) {

  await initDB();


  const nom =
    String(p.nom || "").trim();


  const type =
    p.type || "medicament";


  const origine =
    p.origine || "FANOME";


  // ==============================================
  // CHERCHER PRODUIT EXISTANT
  // ==============================================

  const existant =
    db.exec(`

      SELECT id

      FROM produits

      WHERE UPPER(TRIM(nom)) = UPPER(TRIM(?))

      AND UPPER(TRIM(type)) =
          UPPER(TRIM(?))

      AND UPPER(TRIM(origine)) =
          UPPER(TRIM(?))

      ORDER BY id ASC

      LIMIT 1

    `,

    [

      nom,

      type,

      origine

    ]);


  // ==============================================
  // PRODUIT EXISTE
  // ==============================================

  if (
    existant.length > 0 &&
    existant[0].values.length > 0
  ) {

    const id =
      Number(
        existant[0].values[0][0]
      );


    // Mettre à jour certaines informations

    db.run(`

      UPDATE produits

      SET

        prix = ?,

        date_expiration =
          CASE
            WHEN ? != '' THEN ?
            ELSE date_expiration
          END

      WHERE id = ?

    `,

    [

      Number(p.prix || 0),

      p.date_expiration || "",

      p.date_expiration || "",

      id

    ]);


    saveDatabase();


    return id;

  }


  // ==============================================
  // NOUVEAU PRODUIT
  // ==============================================

  db.run(`

    INSERT INTO produits

    (

      nom,

      quantite,

      prix,

      lot,

      date_entree,

      date_expiration,

      type,

      origine

    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?)

  `,

  [

    nom,

    Number(p.quantite || 0),

    Number(p.prix || 0),

    p.lot || "",

    p.dateEntree || "",

    p.date_expiration || "",

    type,

    origine

  ]);


  const result =
    db.exec(`

      SELECT last_insert_rowid()

    `);


  const id =
    Number(
      result[0].values[0][0]
    );


  saveDatabase();


  return id;

}


// ======================================================
// MODIFIER QUANTITE
// ======================================================

export async function modifierQuantiteProduit(
  produitId,
  quantite
) {

  await initDB();


  db.run(`

    UPDATE produits

    SET quantite = ?

    WHERE id = ?

  `,

  [

    Number(quantite),

    Number(produitId)

  ]);


  saveDatabase();

}


// ======================================================
// AJOUTER MOUVEMENT
// ======================================================

export async function ajouterMouvement(m) {

  await initDB();


  db.run(`

    INSERT INTO mouvements

    (

      produit_id,

      nom,

      origine,

      lot,

      date,

      entree,

      sortie,

      observation

    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?)

  `,

  [

    m.produit_id !== undefined &&
    m.produit_id !== null

      ? Number(m.produit_id)

      : null,

    m.nom || "",

    m.origine || "FANOME",

    m.lot || "",

    m.date || "",

    Number(m.entree || 0),

    Number(m.sortie || 0),

    m.observation || ""

  ]);


  // ==============================================
  // METTRE A JOUR QUANTITE PRODUIT
  // ==============================================

  if (
    m.produit_id !== undefined &&
    m.produit_id !== null
  ) {

    const stock =
      calculerStockInterne(
        m.produit_id
      );


    db.run(`

      UPDATE produits

      SET quantite = ?

      WHERE id = ?

    `,

    [

      stock,

      Number(m.produit_id)

    ]);

  }


  saveDatabase();

}


// ======================================================
// GET MOUVEMENTS
// ======================================================

export async function getMouvements() {

  await initDB();


  const res = db.exec(`

    SELECT *

    FROM mouvements

    ORDER BY id ASC

  `);


  if (res.length === 0) {

    return [];

  }


  return res[0].values.map(row => ({

    id:
      Number(row[0]),

    produit_id:
      row[1] !== null
        ? Number(row[1])
        : null,

    nom:
      row[2] || "",

    origine:
      row[3] || "FANOME",

    lot:
      row[4] || "",

    date:
      row[5] || "",

    entree:
      Number(row[6] || 0),

    sortie:
      Number(row[7] || 0),

    observation:
      row[8] || ""

  }));

}


// ======================================================
// MOUVEMENTS D'UN PRODUIT
// ======================================================

export async function getMouvementsProduit(
  produitId
) {

  await initDB();


  const res = db.exec(`

    SELECT *

    FROM mouvements

    WHERE produit_id = ?

    ORDER BY id ASC

  `,

  [

    Number(produitId)

  ]);


  if (res.length === 0) {

    return [];

  }


  return res[0].values.map(row => ({

    id:
      Number(row[0]),

    produit_id:
      row[1] !== null
        ? Number(row[1])
        : null,

    nom:
      row[2] || "",

    origine:
      row[3] || "FANOME",

    lot:
      row[4] || "",

    date:
      row[5] || "",

    entree:
      Number(row[6] || 0),

    sortie:
      Number(row[7] || 0),

    observation:
      row[8] || ""

  }));

}


// ======================================================
// STOCK PRODUIT
// ======================================================

export async function getStockProduit(
  produitId
) {

  await initDB();


  return calculerStockInterne(
    produitId
  );

}


// ======================================================
// STOCK PAR LOT
//
// Conservé pour compatibilité.
// Mais la logique principale du système
// ne dépend PAS du lot.
// ======================================================

export async function getStockLot(
  produitId,
  lot
) {

  await initDB();


  const res = db.exec(`

    SELECT

      COALESCE(SUM(entree), 0)

      -

      COALESCE(SUM(sortie), 0)

      AS stock

    FROM mouvements

    WHERE produit_id = ?

    AND lot = ?

  `,

  [

    Number(produitId),

    lot || ""

  ]);


  if (
    res.length === 0 ||
    res[0].values.length === 0
  ) {

    return 0;

  }


  return Number(
    res[0].values[0][0] || 0
  );

}