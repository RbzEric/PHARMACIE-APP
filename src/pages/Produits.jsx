import { useEffect, useState } from "react";

import {
getProduits,
ajouterProduit
} from "../services/stockService";


export default function Produits(){


const [produits,setProduits] = useState([]);


const [form,setForm] = useState({

nom:"",
quantite:"",
prix:"",
lot:"",
dateEntree:"",
expiration:"",
type:"medicament"

});



// ======================
// CHARGER PRODUITS
// ======================


async function charger(){


const data = await getProduits();


setProduits(data);


}



useEffect(()=>{

charger();

},[]);




// ======================
// INPUT CHANGE
// ======================


function handleChange(e){


const {name,value}=e.target;


setForm({

...form,

[name]:value

});


}




// ======================
// FORMAT DATE
// ======================


function formaterDate(date){


if(!date)
return "";


const [annee,mois,jour]=date.split("-");


return `${jour}/${mois}/${annee}`;


}




// ======================
// AJOUT
// ======================


async function enregistrer(e){


e.preventDefault();



if(!form.nom || !form.quantite)
return;



await ajouterProduit({

nom: form.nom,
quantite:Number(form.quantite),
prix:Number(form.prix),
lot:form.lot,
date_expiration:formaterDate(form.expiration),
type:form.type

});


setForm({

nom:"",
quantite:"",
prix:"",
lot:"",
dateEntree:"",
expiration:"",
type:"medicament"

});



await charger();



alert("Produit ajouté");


}



return (

<div>


<h2>Ajout produit</h2>



<form onSubmit={enregistrer}>


<select

name="type"

value={form.type}

onChange={handleChange}

>

<option value="medicament">
Médicament
</option>


<option value="consommable">
Consommable
</option>


</select>




<input

name="nom"

placeholder="Nom produit"

value={form.nom}

onChange={handleChange}

/>



<input

name="quantite"

type="number"

placeholder="Quantité"

value={form.quantite}

onChange={handleChange}

/>



<input

name="prix"

type="number"

placeholder="Prix"

value={form.prix}

onChange={handleChange}

/>



<input

name="lot"

placeholder="N° lot"

value={form.lot}

onChange={handleChange}

/>


<label htmlFor="">Date d'entrée :</label> <br />
<input

name="dateEntree"

type="date"

value={form.dateEntree}

onChange={handleChange}

/>


<label htmlFor="">Date de péremption :</label> <br />
<input

name="expiration"

type="date"

value={form.expiration}

onChange={handleChange}

/>



<button type="submit">

Ajouter

</button>



</form>



<hr/>




<h2>Liste des produits</h2>



<table border="1">


<thead>

<tr>

<th>Nom</th>

<th>Quantité</th>

<th>Prix</th>

<th>Lot</th>

<th>Expiration</th>

<th>Type</th>


</tr>


</thead>



<tbody>


{

produits.map(p=>(


<tr key={p.id}>


<td>{p.nom}</td>


<td>{p.quantite}</td>


<td>{p.prix} Ar</td>


<td>{p.lot}</td>


<td>{p.date_expiration}</td>


<td>{p.type}</td>


</tr>


))


}



</tbody>


</table>



</div>

);


}