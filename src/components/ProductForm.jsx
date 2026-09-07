import { useEffect, useState } from "react";

import {
  getProduits,
  sortirProduit
} from "../services/stockService";


// ==========================================
// NOM AFFICHAGE SELON ORIGINE
// ==========================================

function nomAffichage(produit) {

  if (!produit) return "";

  if (produit.origine === "FOND D'URGENCE") {

    return `${produit.nom} (FU)`;

  }

  if (produit.origine === "BUDGET DE L'ÉTAT") {

    return `${produit.nom} (BE)`;

  }

  return produit.nom;

}



// ==========================================
// LABEL ORIGINE COURT
// ==========================================

function origineCourt(origine) {

  if (origine === "FOND D'URGENCE") {
    return "FU";
  }

  if (origine === "BUDGET DE L'ÉTAT") {
    return "BE";
  }

  return "FANOME";

}



export default function PatientForm(){


  const [produits,setProduits] = useState([]);

  const [patient,setPatient] = useState("");

  const [recherche,setRecherche] = useState("");

  const [selection,setSelection] = useState(null);

  const [quantite,setQuantite] = useState("");

  const [ordonnance,setOrdonnance] = useState([]);



  // ==========================================
  // CHARGEMENT DES PRODUITS
  // ==========================================

  async function charger(){

    const data = await getProduits();

    console.log("PRODUITS RECUS PAR PATIENT :", data);

    setProduits(data);

  }



  useEffect(()=>{

    charger();

  },[]);



  // ==========================================
  // RECHERCHE
  // ==========================================

  const resultat = produits.filter(p =>

    p.nom &&

    p.nom
      .toLowerCase()
      .includes(
        recherche.toLowerCase()
      )

  );



  // ==========================================
  // CHOISIR PRODUIT
  // ==========================================

  function choisirProduit(p){

    setSelection(p);

    setRecherche(
      nomAffichage(p)
    );

  }



  // ==========================================
  // AJOUTER LIGNE
  // ==========================================

  function ajouterProduit(){

    if(!selection){

      alert(
        "Veuillez choisir un produit dans la liste"
      );

      return;

    }



    if(
      !quantite ||
      Number(quantite) <= 0
    ){

      alert(
        "Quantité incorrecte"
      );

      return;

    }



    // Vérifier si le même produit
    // est déjà dans l'ordonnance

    const existe = ordonnance.find(
      item =>
        Number(item.produit.id) ===
        Number(selection.id)
    );


    if(existe){

      alert(
        "Ce produit est déjà ajouté à l'ordonnance"
      );

      return;

    }



    const ligne = {

      produit: selection,

      quantite:
        Number(quantite),

      prixUnitaire:
        Number(selection.prix || 0),

      prixTotal:

        Number(quantite) *
        Number(selection.prix || 0)

    };



    setOrdonnance([

      ...ordonnance,

      ligne

    ]);



    setSelection(null);

    setRecherche("");

    setQuantite("");

  }



  // ==========================================
  // SUPPRIMER
  // ==========================================

  function supprimer(index){

    setOrdonnance(

      ordonnance.filter(
        (_,i) => i !== index
      )

    );

  }



  // ==========================================
  // TOTAL
  // ==========================================

  const totalGeneral =
    ordonnance.reduce(

      (total,item) =>

        total + item.prixTotal,

      0

    );



  // ==========================================
  // VALIDATION
  // ==========================================

  async function valider(){

    if(!patient){

      alert(
        "Entrer le nom du patient"
      );

      return;

    }



    if(ordonnance.length === 0){

      alert(
        "Aucun produit sélectionné"
      );

      return;

    }



    // ========================================
    // SORTIES
    // ========================================

    for(const item of ordonnance){

      const success =
        await sortirProduit(

          item.produit.id,

          item.quantite

        );


      // Si une sortie échoue
      if(!success){

        return;

      }

    }



    // ========================================
    // SUCCÈS
    // ========================================

    alert(
      "Vente enregistrée"
    );


    setPatient("");

    setOrdonnance([]);

    setRecherche("");

    setSelection(null);

    setQuantite("");


    // Recharger les produits
    await charger();

  }



  return (

    <div className="card">


      <h2>
        Ajout Patient / Vente
      </h2>



      {/* ==================================
          PATIENT
      ================================== */}

      <input

        placeholder="Nom du patient"

        value={patient}

        onChange={e =>
          setPatient(e.target.value)
        }

      />



      <h3>
        Rechercher médicament
      </h3>



      {/* ==================================
          RECHERCHE
      ================================== */}

      <input

        placeholder="Ex: para"

        value={recherche}

        onChange={e => {

          setRecherche(
            e.target.value
          );

          setSelection(null);

        }}

      />



      {/* ==================================
          LISTE RECHERCHE
      ================================== */}

      {

        recherche &&
        !selection && (

          <div className="liste-recherche">


            {

              resultat.length === 0 ? (

                <div className="suggestion">

                  Aucun produit trouvé

                </div>

              ) : (

                resultat.map(p => (

                  <div

                    key={p.id}

                    className="suggestion"

                    onClick={() =>
                      choisirProduit(p)
                    }

                  >

                    <b>

                      {nomAffichage(p)}

                    </b>


                    <br />


                    <small>

                      {

                        p.type ===
                        "medicament"

                          ? "Médicament"

                          : "Consommable"

                      }


                      {" • "}


                      <strong>

                        {
                          origineCourt(
                            p.origine
                          )
                        }

                      </strong>


                      {" • Lot: "}


                      {
                        p.lot || "-"
                      }


                      {" • Stock: "}


                      {
                        p.quantite
                      }

                    </small>

                  </div>

                ))

              )

            }


          </div>

        )

      }



      {/* ==================================
          PRODUIT CHOISI
      ================================== */}

      {

        selection && (

          <div>


            <p>

              Produit choisi :


              {" "}


              <b>

                {
                  nomAffichage(
                    selection
                  )
                }

              </b>


              <br />


              Origine :


              {" "}


              {
                selection.origine
              }


              <br />


              Lot :


              {" "}


              {
                selection.lot || "-"
              }


              <br />


              Stock disponible :


              {" "}


              <b>

                {
                  selection.quantite
                }

              </b>


              <br />


              Prix :


              {" "}


              {
                selection.prix
              } Ar

            </p>


          </div>

        )

      }



      {/* ==================================
          QUANTITE
      ================================== */}

      <input

        type="number"

        min="1"

        placeholder="Quantité"

        value={quantite}

        onChange={e =>
          setQuantite(e.target.value)
        }

      />



      <button
        onClick={ajouterProduit}
      >

        Ajouter ligne

      </button>



      {/* ==================================
          FACTURE
      ================================== */}

      <h3>
        Facture
      </h3>



      <table>


        <thead>

          <tr>

            <th>
              Produit
            </th>

            <th>
              Origine
            </th>

            <th>
              Lot
            </th>

            <th>
              Quantité
            </th>

            <th>
              Prix unitaire
            </th>

            <th>
              Total
            </th>

            <th>
            </th>

          </tr>

        </thead>



        <tbody>


          {

            ordonnance.map(
              (item,index) => (

                <tr key={index}>


                  <td>

                    {
                      item.produit.nom
                    }

                  </td>


                  <td>

                    {
                      origineCourt(
                        item.produit.origine
                      )
                    }

                  </td>


                  <td>

                    {
                      item.produit.lot ||
                      "-"
                    }

                  </td>


                  <td>

                    {
                      item.quantite
                    }

                  </td>


                  <td>

                    {
                      item.prixUnitaire
                    } Ar

                  </td>


                  <td>

                    {
                      item.prixTotal
                    } Ar

                  </td>


                  <td>

                    <button

                      onClick={() =>
                        supprimer(index)
                      }

                    >

                      X

                    </button>

                  </td>


                </tr>

              )

            )

          }



          <tr>


            <td
              colSpan="5"
            >

              <b>
                Total
              </b>

            </td>


            <td>

              <b>

                {
                  totalGeneral
                } Ar

              </b>

            </td>


            <td>
            </td>


          </tr>


        </tbody>


      </table>



      {/* ==================================
          VALIDER
      ================================== */}

      <button
        onClick={valider}
      >

        Valider Vente

      </button>



    </div>

  );

}