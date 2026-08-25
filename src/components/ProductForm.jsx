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



// Chargement des produits ajoutés

useEffect(()=>{

setProduits(getProduits());

},[]);





// Recherche dynamique

const resultat = produits.filter(p=>

p.nom &&

p.nom
.toLowerCase()
.includes(
recherche.toLowerCase()
)

);





// Choisir produit dans suggestion

function choisirProduit(p){

setSelection(p);

setRecherche(p.nom);

}





// Ajouter ligne facture

function ajouterProduit(){


if(!selection){

alert("Veuillez choisir un médicament dans la liste");

return;

}



if(!quantite || Number(quantite)<=0){

alert("Quantité incorrecte");

return;

}




const ligne={


produit:selection,


quantite:Number(quantite),


prixUnitaire:Number(selection.prix),


prixTotal:

Number(quantite) *
Number(selection.prix)


};



setOrdonnance([

...ordonnance,

ligne

]);



setSelection(null);

setRecherche("");

setQuantite("");

}





// Supprimer ligne

function supprimer(index){

setOrdonnance(

ordonnance.filter(

(_,i)=>i!==index

)

);

}





// Total

const totalGeneral = ordonnance.reduce(

(total,item)=>

total + item.prixTotal,

0

);






// Validation vente

function valider(){


if(!patient){

alert("Entrer le nom du patient");

return;

}



if(ordonnance.length===0){

alert("Aucun produit sélectionné");

return;

}




ordonnance.forEach(item=>{


sortirProduit(

item.produit.nom,

item.quantite

);


});



alert("Vente enregistrée");



setPatient("");

setOrdonnance([]);

}





return (

<div className="card">


<h2>
Ajout Patient / Vente
</h2>



<input

placeholder="Nom du patient"

value={patient}

onChange={e=>setPatient(e.target.value)}

/>





<h3>
Rechercher médicament
</h3>



<input

placeholder="Ex: para"

value={recherche}

onChange={e=>{

setRecherche(e.target.value);

setSelection(null);

}}

/>





{

recherche && !selection && (

<div className="liste-recherche">


{

resultat.map(p=>(


<div

key={p.id}

className="suggestion"

onClick={()=>choisirProduit(p)}

>

{p.nom}

</div>


))


}



</div>

)

}







{

selection && (

<p>

Produit choisi :

<b>
{selection.nom}
</b>

<br/>

Prix :

{selection.prix} Ar

</p>

)

}







<input

type="number"

placeholder="Quantité"

value={quantite}

onChange={e=>setQuantite(e.target.value)}

/>





<button onClick={ajouterProduit}>

Ajouter ligne

</button>






<h3>
Facture
</h3>



<table>


<thead>

<tr>

<th>Produit</th>

<th>Quantité</th>

<th>Prix unitaire</th>

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



<tr>

<td colSpan="3">

<b>Total</b>

</td>


<td>

<b>
{totalGeneral} Ar
</b>

</td>


</tr>



</tbody>


</table>






<button onClick={valider}>

Valider Vente

</button>



</div>

);

}