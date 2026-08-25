import {

getProduits as getProduitsSQLite,

ajouterProduit as ajouterProduitSQLite,

ajouterMouvement,

getMouvements as getMouvementsSQLite

} from "./sqliteService";




// PRODUITS

export async function getProduits(){

return await getProduitsSQLite();

}




export async function ajouterProduit(produit){


await ajouterProduitSQLite(produit);



await ajouterMouvement({

nom:produit.nom,

date:produit.dateEntree 
? produit.dateEntree
: new Date().toLocaleDateString("fr-FR"),

entree:Number(produit.quantite),

sortie:0,

observation:"Entrée stock"

});


}





// MOUVEMENTS


export async function getMouvements(){

return await getMouvementsSQLite();

}





// STOCK


export async function calculStock(nom){

const data = await getMouvements();


return data

.filter(m=>m.nom===nom)

.reduce(

(total,m)=>

total + Number(m.entree) - Number(m.sortie),

0

);

}





// SORTIE

export async function sortirProduit(nom,quantite){


await ajouterMouvement({

nom:nom,

date:new Date().toLocaleDateString("fr-FR"),

entree:0,

sortie:Number(quantite),

observation:"Vente"

});


}