import { NavLink } from "react-router-dom";


export default function Sidebar(){


return (

<div className="sidebar">


<h2>
💊 Pharmacie
</h2>


<NavLink to="/">
Dashboard
</NavLink>


<NavLink to="/produits">
Produits
</NavLink>


<NavLink to="/stock">
Fiche Stock
</NavLink>


<NavLink to="/patients">
Patients
</NavLink>


<NavLink to="/rapport">
Rapport
</NavLink>


</div>

);


}