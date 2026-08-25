import { useEffect, useState } from "react";
import {
  getProduits
} from "../services/stockService";


export default function Dashboard(){


const [produits,setProduits] = useState([]);




useEffect(()=>{


async function charger(){

const data = await getProduits();

setProduits(data);

}


charger();


},[]);




const medicaments = produits.filter(

p=>p.type==="medicament"

).length;



const consommables = produits.filter(

p=>p.type==="consommable"

).length;





return (

<div className="content">


<h1>

Dashboard Pharmacie

</h1>



<div className="dashboard">



<div className="box">

<h3>

Produits total

</h3>


<p>

{produits.length}

</p>


</div>





<div className="box">

<h3>

Médicaments

</h3>


<p>

{medicaments}

</p>


</div>





<div className="box">

<h3>

Consommables

</h3>


<p>

{consommables}

</p>


</div>




</div>



</div>

);


}