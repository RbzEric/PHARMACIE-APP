import {
  getProduits as getProduitsSQLite,
  ajouterProduit as ajouterProduitSQLite,
  ajouterMouvement,
  getMouvements as getMouvementsSQLite,
  getStockProduit,
  getStockLot,

  enregistrerInventaire as enregistrerInventaireSQLite,
  enregistrerInventaires as enregistrerInventairesSQLite,
  getInventaire as getInventaireSQLite,
  getHistoriqueInventaires as getHistoriqueInventairesSQLite,
  supprimerInventaire as supprimerInventaireSQLite

} from "./sqliteService";


// ======================================================
// PRODUITS
// ======================================================

export async function getProduits() {

  return await getProduitsSQLite();

}


// ======================================================
// AJOUTER PRODUIT
// ======================================================

export async function ajouterProduit(produit) {

  const produitId =
    await ajouterProduitSQLite(produit);


  await ajouterMouvement({

    produit_id:
      produitId,

    nom:
      produit.nom,

    origine:
      produit.origine || "FANOME",

    lot:
      produit.lot || "",

    date:
      produit.dateEntree ||
      new Date().toLocaleDateString("fr-FR"),

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
// STOCK
// ======================================================

export async function calculStock(
  produitId
) {

  return await getStockProduit(
    produitId
  );

}


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


  const qte =
    Number(quantite);


  if (!qte || qte <= 0) {

    alert(
      "Quantité incorrecte"
    );

    return false;

  }


  const stockActuel =
    await getStockProduit(
      produit.id
    );


  if (
    qte >
    Number(stockActuel)
  ) {

    alert(

      `Stock insuffisant pour ${
        produit.nom
      } (${produit.origine}). Stock disponible : ${
        stockActuel
      }`

    );

    return false;

  }


  await ajouterMouvement({

    produit_id:
      produit.id,

    nom:
      produit.nom,

    origine:
      produit.origine || "FANOME",

    lot:
      produit.lot || "",

    date:
      new Date().toLocaleDateString("fr-FR"),

    entree:
      0,

    sortie:
      qte,

    observation:
      "Vente"

  });


  return true;

}


// ======================================================
// INVENTAIRE
// ======================================================

export async function enregistrerInventaire(
  inventaire
) {

  return await enregistrerInventaireSQLite(
    inventaire
  );

}


export async function enregistrerInventaires(
  inventaires
) {

  return await enregistrerInventairesSQLite(
    inventaires
  );

}


export async function getInventaire(
  mois,
  annee
) {

  return await getInventaireSQLite(
    mois,
    annee
  );

}


export async function getHistoriqueInventaires() {

  return await getHistoriqueInventairesSQLite();

}


export async function supprimerInventaire(
  mois,
  annee
) {

  return await supprimerInventaireSQLite(
    mois,
    annee
  );

}