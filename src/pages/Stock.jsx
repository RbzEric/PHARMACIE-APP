import { useEffect, useState } from "react";

import {
getMouvements,
calculStock
} from "../services/stockService";


export default function Stock(){


const [mouvements,setMouvements] = useState([]);

const [produitSelectionne,setProduitSelectionne] = useState("");



// ======================
// CHARGER MOUVEMENTS
// ======================


async function charger(){


const data = await getMouvements();


console.log("MOUVEMENTS:",data);


setMouvements(data);


}



useEffect(()=>{


charger();


},[]);





// ======================
// PRODUITS UNIQUE
// ======================


const produits = [

...new Set(

mouvements.map(
m=>m.nom
)

)

];





const mouvementsFiltres = mouvements.filter(

m=>m.nom===produitSelectionne

);





return (

<div>


<h2>Fiche de stock</h2>



<select

value={produitSelectionne}

onChange={
e=>setProduitSelectionne(e.target.value)
}

>


<option value="">

Choisir produit

</option>



{

produits.map((nom,index)=>(


<option

key={index}

value={nom}

>

{nom}

</option>


))


}


</select>





{

produitSelectionne &&

<table border="1" style={{marginTop:"20px"}}>


<thead>

<tr>

<th>Date</th>

<th>Entrée</th>

<th>Sortie</th>

<th>Stock</th>

<th>Observation</th>


</tr>

</thead>



<tbody>


{

(() => {


let stock = 0;


return mouvementsFiltres.map((m,index)=>{


stock =

stock

+

Number(m.entree || 0)

-

Number(m.sortie || 0);



return (

<tr key={index}>


<td>{m.date}</td>


<td>{m.entree}</td>


<td>{m.sortie}</td>


<td>{stock}</td>


<td>{m.observation}</td>


</tr>


);


});


})()


}



</tbody>


</table>


}





{

produitSelectionne &&


<h3>

Stock actuel :

{

/* calcul async tsy azo atao directement */

}

</h3>


}



</div>

);


}