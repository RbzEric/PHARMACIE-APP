import {
getProduits,
getMouvements
} from "./stockService";



function convertirDate(date){


if(!date)
return null;



if(date.includes("/")){


const [jour,mois,annee] = date.split("/");


return new Date(

Number(annee),

Number(mois)-1,

Number(jour)

);


}



return new Date(date);


}





export async function genererRapport(mois,annee){



const produits = await getProduits();


const mouvements = await getMouvements();



console.log(
"MOUVEMENTS RAPPORT:",
mouvements
);



return produits.map(p=>{


const mouvementsProduit = mouvements.filter(

m=>

m.nom.toLowerCase()
===

p.nom.toLowerCase()

);





// STOCK DEBUT

let stockDebut = 0;



mouvementsProduit.forEach(m=>{


const date = convertirDate(m.date);



if(

date < new Date(
Number(annee),
Number(mois),
1
)

){


stockDebut += Number(m.entree || 0);


stockDebut -= Number(m.sortie || 0);


}



});






// MOUVEMENT DU MOIS


const mouvementMois = mouvementsProduit.filter(m=>{


const date = convertirDate(m.date);



return (

date.getMonth()
=== Number(mois)

&&

date.getFullYear()
=== Number(annee)

);


});







const entree = mouvementMois.reduce(

(total,m)=>

total + Number(m.entree || 0),

0

);





const sortie = mouvementMois.reduce(

(total,m)=>

total + Number(m.sortie || 0),

0

);





const stockFin =

stockDebut

+

entree

-

sortie;





return {

type:p.type,

nom:p.nom,

lot:p.lot || "",

expiration:p.date_expiration || "",

prix:Number(p.prix || 0),

stockDebut,

valeurDebut:
stockDebut * Number(p.prix || 0),

entree,

valeurEntree:
entree * Number(p.prix || 0),

sortie,

valeurSortie:
sortie * Number(p.prix || 0),

stockFin,

valeurStock:
stockFin * Number(p.prix || 0),

cmm: sortie

};


});


}