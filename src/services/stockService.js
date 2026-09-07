import {

  getProduits as getProduitsSQLite,

  ajouterProduit as ajouterProduitSQLite,

  ajouterMouvement,

  getMouvements as getMouvementsSQLite,

  getStockProduit,

  getStockLot

} from "./sqliteService";


// ======================================================
// PRODUITS
// ======================================================

export async function getProduits() {

  return await getProduitsSQLite();

}


// ======================================================
// AJOUT PRODUIT
// ======================================================

export async function ajouterProduit(produit) {

  // Ajouter ou récupérer produit existant
  // selon NOM + TYPE + ORIGINE

  const produitId =
    await ajouterProduitSQLite(
      produit
    );


  // ==============================================
  // CREER MOUVEMENT D'ENTREE
  // ==============================================

  await ajouterMouvement({

    produit_id:
      produitId,

    nom:
      produit.nom,

    origine:
      produit.origine ||
      "FANOME",

    lot:
      produit.lot ||
      "",

    date:
      produit.dateEntree ||
      new Date().toLocaleDateString(
        "fr-FR"
      ),

    entree:
      Number(produit.quantite || 0),

    sortie:
      0,

    observation:
      "Entrée stock"

  });


  return produitId;

}


// ======================================================
// MOUVEMENTS
// ======================================================

export async function getMouvements() {

  return await getMouvementsSQLite();

}


// ======================================================
// STOCK PRODUIT
// ======================================================

export async function calculStock(
  produitId
) {

  return await getStockProduit(
    produitId
  );

}


// ======================================================
// STOCK LOT
// ======================================================

export async function calculStockLot(
  produitId,
  lot
) {

  return await getStockLot(
    produitId,
    lot
  );

}


// ======================================================
// SORTIE PRODUIT
// ======================================================

export async function sortirProduit(
  produitId,
  quantite
) {

  // ==============================================
  // PRODUITS
  // ==============================================

  const produits =
    await getProduitsSQLite();


  const produit =
    produits.find(

      p =>
        Number(p.id) ===
        Number(produitId)

    );


  if (!produit) {

    console.error(
      "Produit introuvable :",
      produitId
    );

    return false;

  }


  // ==============================================
  // QUANTITE
  // ==============================================

  const qte =
    Number(quantite);


  if (!qte || qte <= 0) {

    alert(
      "Quantité incorrecte"
    );

    return false;

  }


  // ==============================================
  // STOCK ACTUEL
  // ==============================================

  const stockActuel =
    await getStockProduit(
      produit.id
    );


  // ==============================================
  // VERIFICATION STOCK
  // ==============================================

  if (
    qte > Number(stockActuel)
  ) {

    alert(

      `Stock insuffisant pour ${produit.nom} (${produit.origine}). Stock disponible : ${stockActuel}`

    );

    return false;

  }


  // ==============================================
  // SORTIE
  // ==============================================

  await ajouterMouvement({

    produit_id:
      produit.id,

    nom:
      produit.nom,

    origine:
      produit.origine ||
      "FANOME",

    lot:
      produit.lot ||
      "",

    date:
      new Date().toLocaleDateString(
        "fr-FR"
      ),

    entree:
      0,

    sortie:
      qte,

    observation:
      "Vente"

  });


  return true;

}