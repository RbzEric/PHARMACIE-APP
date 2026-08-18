import { HashRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Produits from "./pages/Produits";
import Stock from "./pages/Stock";
import PatientForm from "./components/PatientForm";
import Rapport from "./pages/Rapport";

import { initDB } from "./services/sqliteService";


export default function App(){

const [ready,setReady] = useState(false);


useEffect(()=>{

async function start(){

await initDB();

setReady(true);

}

start();

},[]);



if(!ready){

return <h2>Chargement base de données...</h2>;

}



return (

<HashRouter>

<div className="app">

<Sidebar />

<div className="main">

<Routes>

<Route path="/" element={<Dashboard />} />

<Route path="/produits" element={<Produits />} />

<Route path="/stock" element={<Stock />} />

<Route path="/patients" element={<PatientForm />} />

<Route path="/rapport" element={<Rapport />} />

</Routes>

</div>

</div>

</HashRouter>

);

}