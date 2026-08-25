import { useEffect, useState } from "react";

import {
getProduits,
sortirProduit
} from "../services/stockService";


export default function PatientForm(){


const [produits,setProduits] = useState([]);

const [patient,setPatient] = useState("");

const [recherche,setRecherche] = useState("");

const [selection,setSelection] = useState(null);

const [quantite,setQuantite] = useState("");

const [ordonnance,setOrdonnance] = useState([]);




// ======================
// CHARGER PRODUITS
// ======================


useEffect(()=>{


async function charger(){


const data = await getProduits();


setProduits(data);


}


charger();


},[]);




// ======================
// RECHERCHE
// ======================


const resultat = produits.filter(p=>

p.nom &&

p.nom
.toLowerCase()
.includes(
recherche.toLowerCase()
.trim()
)

);





// ======================
// AJOUT LIGNE
// ======================


function ajouterProduit(){


if(!selection || !quantite)
return;



const qte = Number(quantite);



const ligne = {


produit:selection,


quantite:qte,


prixUnitaire:Number(selection.prix),


prixTotal:

qte * Number(selection.prix)


};



setOrdonnance([

...ordonnance,

ligne

]);



setRecherche("");

setSelection(null);

setQuantite("");


}






// ======================
// SUPPRIMER
// ======================


function supprimer(index){


setOrdonnance(

ordonnance.filter(

(_,i)=>i!==index

)

);


}





// ======================
// VALIDATION VENTE
// ======================


async function valider(){


if(!patient || ordonnance.length===0)
return;



for(const item of ordonnance){


await sortirProduit(

item.produit.nom,

item.quantite

);


}



alert(
"Vente enregistrée"
);



setPatient("");

setOrdonnance([]);


}






return (

<div>


<h2>Patient</h2>



<input

placeholder="Nom patient"

value={patient}

onChange={
e=>setPatient(e.target.value)
}

/>





<input

placeholder="Recherche produit"

value={recherche}

onChange={

e=>{


setRecherche(e.target.value);


setSelection(null);


}

}

/>





{

recherche && resultat.length>0 &&

<div>


{

resultat.map(p=>(


<div

key={p.id}

onClick={()=>{


setSelection(p);


setRecherche(p.nom);


}}


style={{

cursor:"pointer"

}}

>


{p.nom}


</div>


))


}


</div>


}





{

selection &&

<p>

Produit choisi :

{selection.nom}

<br/>

Prix :

{selection.prix} Ar

</p>


}






<input

type="number"

placeholder="Quantité"

value={quantite}

onChange={
e=>setQuantite(e.target.value)
}

/>





<button

onClick={ajouterProduit}

>

Ajouter ligne

</button>






<h3>Ordonnance</h3>



<table border="1">


<thead>

<tr>

<th>Produit</th>

<th>Quantité</th>

<th>Prix</th>

<th>Total</th>

<th></th>

</tr>

</thead>



<tbody>


{

ordonnance.map((item,index)=>(


<tr key={index}>


<td>

{item.produit.nom}

</td>


<td>

{item.quantite}

</td>


<td>

{item.prixUnitaire} Ar

</td>


<td>

{item.prixTotal} Ar

</td>


<td>


<button

onClick={()=>supprimer(index)}

>

X

</button>


</td>


</tr>


))


}



</tbody>


</table>





<button

onClick={valider}

>

Valider Vente

</button>



</div>


);


}