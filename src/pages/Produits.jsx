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
    type:"medicament",
    origine:"FANOME"

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

    const {name,value} = e.target;

    setForm({

      ...form,

      [name]: value

    });

  }



  // ======================
  // FORMAT DATE
  // ======================

  function formaterDate(date){

    if(!date)
      return "";

    const [annee,mois,jour] =
      date.split("-");

    return `${jour}/${mois}/${annee}`;

  }



  // ======================
  // AJOUT PRODUIT
  // ======================

  async function enregistrer(e){

    e.preventDefault();


    if(!form.nom || !form.quantite){

      alert(
        "Veuillez remplir le nom et la quantité"
      );

      return;

    }


    if(Number(form.quantite) <= 0){

      alert(
        "La quantité doit être supérieure à 0"
      );

      return;

    }



    await ajouterProduit({

      nom: form.nom,

      quantite:
        Number(form.quantite),

      prix:
        Number(form.prix || 0),

      lot:
        form.lot,

      // IMPORTANT :
      // stockService attend dateEntree

      dateEntree:
        formaterDate(
          form.dateEntree
        ),

      date_expiration:
        formaterDate(
          form.expiration
        ),

      type:
        form.type,

      origine:
        form.origine

    });



    // Réinitialiser formulaire

    setForm({

      nom:"",

      quantite:"",

      prix:"",

      lot:"",

      dateEntree:"",

      expiration:"",

      type:"medicament",

      origine:"FANOME"

    });



    await charger();


    alert(
      "Produit ajouté avec succès"
    );

  }



  return (

    <div>


      <h2>
        Ajout produit
      </h2>



      <form onSubmit={enregistrer}>


        {/* ======================
            TYPE
        ====================== */}

        <label>
          Type de produit :
        </label>


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



        {/* ======================
            ORIGINE
        ====================== */}

        <label>
          Origine / Source :
        </label>


        <select

          name="origine"

          value={form.origine}

          onChange={handleChange}

        >

          <option value="FANOME">
            FANOME
          </option>

          <option value="FOND D'URGENCE">
            FOND D'URGENCE
          </option>

          <option value="BUDGET DE L'ÉTAT">
            BUDGET DE L'ÉTAT
          </option>

        </select>



        {/* ======================
            NOM
        ====================== */}

        <label>
          Nom du produit :
        </label>


        <input

          name="nom"

          placeholder="Ex: Paracétamol 500 mg"

          value={form.nom}

          onChange={handleChange}

        />



        {/* ======================
            QUANTITE
        ====================== */}

        <label>
          Quantité :
        </label>


        <input

          name="quantite"

          type="number"

          min="1"

          placeholder="Quantité"

          value={form.quantite}

          onChange={handleChange}

        />



        {/* ======================
            PRIX
        ====================== */}

        <label>
          Prix :
        </label>


        <input

          name="prix"

          type="number"

          min="0"

          placeholder="Prix"

          value={form.prix}

          onChange={handleChange}

        />



        {/* ======================
            LOT
        ====================== */}

        <label>
          N° lot :
        </label>


        <input

          name="lot"

          placeholder="N° lot"

          value={form.lot}

          onChange={handleChange}

        />



        {/* ======================
            DATE ENTREE
        ====================== */}

        <label>
          Date d'entrée :
        </label>


        <br />


        <input

          name="dateEntree"

          type="date"

          value={form.dateEntree}

          onChange={handleChange}

        />



        {/* ======================
            EXPIRATION
        ====================== */}

        <label>
          Date de péremption :
        </label>


        <br />


        <input

          name="expiration"

          type="date"

          value={form.expiration}

          onChange={handleChange}

        />



        <br />
        <br />


        <button type="submit">

          Ajouter

        </button>


      </form>



      <hr />



      {/* ======================
          LISTE PRODUITS
      ====================== */}

      <h2>
        Liste des produits
      </h2>



      <table border="1">


        <thead>

          <tr>

            <th>
              Nom
            </th>

            <th>
              Quantité
            </th>

            <th>
              Prix
            </th>

            <th>
              Lot
            </th>

            <th>
              Date entrée
            </th>

            <th>
              Expiration
            </th>

            <th>
              Type
            </th>

            <th>
              Origine
            </th>

          </tr>

        </thead>



        <tbody>


          {

            produits.map(p => (

              <tr key={p.id}>


                <td>
                  {p.nom}
                </td>


                <td>
                  {p.quantite}
                </td>


                <td>
                  {p.prix} Ar
                </td>


                <td>
                  {p.lot}
                </td>


                <td>
                  {p.date_entree}
                </td>


                <td>
                  {p.date_expiration}
                </td>


                <td>
                  {p.type}
                </td>


                <td>
                  {p.origine}
                </td>


              </tr>

            ))

          }


        </tbody>


      </table>


    </div>

  );

}