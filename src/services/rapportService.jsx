import {
  getProduits,
  getMouvements
} from "./stockService";

// ======================================================
// NORMALISER ORIGINE
// ======================================================

function normaliserOrigine(value) {
  const origine = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, " ");

  if (origine === "FANOME") {
    return "FANOME";
  }

  if (
    origine === "FOND D'URGENCE" ||
    origine === "FOND D URGENCE" ||
    origine === "FOND URGENCE"
  ) {
    return "FOND D'URGENCE";
  }

  if (
    origine === "BUDGET DE L'ÉTAT" ||
    origine === "BUDGET DE L'ETAT" ||
    origine === "BUDGET DE LETAT"
  ) {
    return "BUDGET DE L'ÉTAT";
  }

  return origine || "FANOME";
}

// ======================================================
// NORMALISER TEXTE
// ======================================================

function normaliserTexte(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

// ======================================================
// CONVERSION DATE
// ======================================================

function convertirDate(date) {
  if (!date) {
    return null;
  }

  // ====================================================
  // FORMAT DD/MM/YYYY
  // ====================================================

  if (
    typeof date === "string" &&
    date.includes("/")
  ) {
    const parties = date.split("/");

    if (parties.length === 3) {
      const jour = Number(parties[0]);
      const mois = Number(parties[1]) - 1;
      const annee = Number(parties[2]);

      const d = new Date(
        annee,
        mois,
        jour
      );

      if (!isNaN(d.getTime())) {
        return d;
      }
    }
  }

  // ====================================================
  // FORMAT YYYY-MM-DD
  // ====================================================

  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return null;
  }

  return d;
}

// ======================================================
// CLE PRODUIT
// NOM + TYPE + ORIGINE
// LOT IGNORE
// ======================================================

function cleProduit(produit) {
  return [
    normaliserTexte(produit.nom),
    normaliserTexte(produit.type),
    normaliserOrigine(produit.origine)
  ].join("|");
}

// ======================================================
// NOM AFFICHAGE
// ======================================================

function nomAffichage(produit) {
  if (!produit) {
    return "";
  }

  const origine =
    normaliserOrigine(produit.origine);

  if (origine === "FOND D'URGENCE") {
    return `${produit.nom} (FU)`;
  }

  if (origine === "BUDGET DE L'ÉTAT") {
    return `${produit.nom} (BE)`;
  }

  return produit.nom;
}

// ======================================================
// GENERER RAPPORT
// ======================================================

export async function genererRapport(
  mois,
  annee
) {
  // ====================================================
  // RECUPERATION DONNEES
  // ====================================================

  const produits =
    await getProduits();

  const mouvements =
    await getMouvements();

  console.log(
    "PRODUITS RAPPORT :",
    produits
  );

  console.log(
    "MOUVEMENTS RAPPORT :",
    mouvements
  );

  // ====================================================
  // DATE DEBUT DU MOIS
  // ====================================================

  const debutMois =
    new Date(
      Number(annee),
      Number(mois),
      1
    );

  // ====================================================
  // DATE FIN DU MOIS
  // ====================================================

  const finMois =
    new Date(
      Number(annee),
      Number(mois) + 1,
      1
    );

  // ====================================================
  // GROUPER LES PRODUITS
  // NOM + TYPE + ORIGINE
  // ====================================================

  const groupes = new Map();

  produits.forEach((produit) => {
    const produitNormalise = {
      ...produit,

      origine:
        normaliserOrigine(
          produit.origine
        )
    };

    const key =
      cleProduit(
        produitNormalise
      );

    if (!groupes.has(key)) {
      groupes.set(
        key,
        {
          nom:
            produitNormalise.nom,

          type:
            produitNormalise.type ||
            "medicament",

          origine:
            produitNormalise.origine,

          produits: []
        }
      );
    }

    groupes
      .get(key)
      .produits
      .push(
        produitNormalise
      );
  });

  // ====================================================
  // CONSTRUCTION RAPPORT
  // ====================================================

  const rapport = [];

  for (
    const groupe of groupes.values()
  ) {

    // ==================================================
    // PRODUIT REFERENCE
    // ==================================================

    const produitReference =
      [...groupe.produits]
        .sort(
          (a, b) =>
            Number(b.id) -
            Number(a.id)
        )[0];

    // ==================================================
    // IDS PRODUITS DU GROUPE
    // ==================================================

    const idsProduits =
      new Set(
        groupe.produits.map(
          (p) =>
            Number(p.id)
        )
      );

    // ==================================================
    // MOUVEMENTS DU GROUPE
    // ==================================================

    const mouvementsGroupe =
      mouvements.filter((m) => {

        // =================================================
        // NOUVELLE STRUCTURE :
        // produit_id
        // =================================================

        if (
          m.produit_id !== null &&
          m.produit_id !== undefined
        ) {
          return idsProduits.has(
            Number(m.produit_id)
          );
        }

        // =================================================
        // ANCIENNES DONNEES :
        // nom + origine
        // =================================================

        return (
          normaliserTexte(
            m.nom
          ) ===
          normaliserTexte(
            groupe.nom
          ) &&

          normaliserOrigine(
            m.origine
          ) ===
          normaliserOrigine(
            groupe.origine
          )
        );
      });

    // ==================================================
    // STOCK DEBUT
    // ==================================================

    let stockDebut = 0;

    mouvementsGroupe.forEach((m) => {
      const date =
        convertirDate(
          m.date
        );

      if (
        date &&
        date < debutMois
      ) {
        stockDebut +=
          Number(
            m.entree || 0
          );

        stockDebut -=
          Number(
            m.sortie || 0
          );
      }
    });

    // ==================================================
    // MOUVEMENTS DU MOIS
    // ==================================================

    const mouvementMois =
      mouvementsGroupe.filter((m) => {
        const date =
          convertirDate(
            m.date
          );

        if (!date) {
          return false;
        }

        return (
          date >= debutMois &&
          date < finMois
        );
      });

    // ==================================================
    // TOTAL ENTREE
    // ==================================================

    const entree =
      mouvementMois.reduce(
        (total, m) =>
          total +
          Number(
            m.entree || 0
          ),
        0
      );

    // ==================================================
    // TOTAL SORTIE
    // ==================================================

    const sortie =
      mouvementMois.reduce(
        (total, m) =>
          total +
          Number(
            m.sortie || 0
          ),
        0
      );

    // ==================================================
    // STOCK FIN
    // ==================================================

    const stockFin =
      stockDebut +
      entree -
      sortie;

    // ==================================================
    // PRIX
    // ==================================================

    const prix =
      Number(
        produitReference.prix || 0
      );

    // ==================================================
    // AJOUT RAPPORT
    // ==================================================

    rapport.push({
      type:
        groupe.type,

      origine:
        normaliserOrigine(
          groupe.origine
        ),

      nom:
        nomAffichage({
          nom:
            groupe.nom,

          origine:
            groupe.origine
        }),

      lot:
        produitReference.lot || "",

      expiration:
        produitReference.date_expiration ||
        "",

      prix,

      stockDebut,

      valeurDebut:
        stockDebut * prix,

      entree,

      valeurEntree:
        entree * prix,

      sortie,

      valeurSortie:
        sortie * prix,

      stockFin,

      valeurStock:
        stockFin * prix,

      cmm:
        sortie
    });
  }

  // ====================================================
  // TRI
  // TYPE → ORIGINE → NOM
  // ====================================================

  rapport.sort((a, b) => {
    const typeCompare =
      String(a.type).localeCompare(
        String(b.type)
      );

    if (typeCompare !== 0) {
      return typeCompare;
    }

    const origineCompare =
      String(a.origine).localeCompare(
        String(b.origine)
      );

    if (origineCompare !== 0) {
      return origineCompare;
    }

    return String(a.nom).localeCompare(
      String(b.nom)
    );
  });

  // ====================================================
  // DEBUG ORIGINES
  // ====================================================

  console.log(
    "ORIGINES DISPONIBLES DANS RAPPORT :",
    [
      ...new Set(
        rapport.map(
          (p) => p.origine
        )
      )
    ]
  );

  console.log(
    "RAPPORT CONSOLIDE :",
    rapport
  );

  return rapport;
}