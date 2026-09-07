import { useEffect, useState } from "react";

import {
  getProduits,
  sortirProduit
} from "../services/stockService";


// ==========================================
// AFFICHAGE NOM PRODUIT
// ==========================================

function afficherNomProduit(produit) {

  if (!produit) return "";

  const nom = produit.nom || "";

  const origine = (
    produit.origine || ""
  ).toUpperCase().trim();


  // FOND D'URGENCE
  if (
    origine === "FOND D'URGENCE" ||
    origine === "FU"
  ) {

    return `${nom} (FU)`;

  }


  // BUDGET DE L'ETAT
  if (
    origine === "BUDGET DE L'ÉTAT" ||
    origine === "BUDGET DE L'ETAT" ||
    origine === "BE"
  ) {

    return `${nom} (BE)`;

  }


  // FANOME
  return nom;

}



function Patients() {

 console.log("PATIENTS JSX MIVOAKA");
  // ==========================================
  // PATIENT
  // ==========================================

  const [nom, setNom] = useState("");


  // ==========================================
  // PRODUITS STOCK
  // ==========================================

  const [produitsStock, setProduitsStock] =
    useState([]);


  // ==========================================
  // RECHERCHE
  // ==========================================

  const [recherche, setRecherche] =
    useState("");


  // ==========================================
  // PRODUIT SELECTIONNE
  // ==========================================

  const [selection, setSelection] =
    useState(null);


  // ==========================================
  // QUANTITE
  // ==========================================

  const [quantite, setQuantite] =
    useState("");


  // ==========================================
  // ORDONNANCE
  // ==========================================

  const [produits, setProduits] =
    useState([]);



  // ==========================================
  // CHARGER PRODUITS
  // ==========================================

  async function chargerProduits() {

    const data = await getProduits();

    console.log(
      "PRODUITS STOCK PATIENT :",
      data
    );

    setProduitsStock(data);

  }



  useEffect(() => {

    chargerProduits();

  }, []);



  // ==========================================
  // RECHERCHE DYNAMIQUE
  // ==========================================

  const resultat =
    produitsStock.filter(p => {

      if (!p.nom) return false;

      return p.nom
        .toLowerCase()
        .includes(
          recherche
            .toLowerCase()
            .replace("(fu)", "")
            .replace("(be)", "")
            .trim()
        );

    });



  // ==========================================
  // CHOISIR PRODUIT
  // ==========================================

  function choisirProduit(p) {

    console.log(
      "PRODUIT CHOISI :",
      p
    );


    setSelection(p);

    setRecherche(
      afficherNomProduit(p)
    );

  }



  // ==========================================
  // AJOUTER LIGNE
  // ==========================================

  function ajouterLigne() {


    if (!selection) {

      alert(
        "Veuillez choisir un produit dans la recherche"
      );

      return;

    }



    if (
      !quantite ||
      Number(quantite) <= 0
    ) {

      alert(
        "Veuillez entrer une quantité"
      );

      return;

    }



    // ========================================
    // VERIFICATION STOCK
    // ========================================

    if (
      Number(quantite) >
      Number(selection.quantite || 0)
    ) {

      alert(

        `Stock insuffisant pour ${afficherNomProduit(selection)}.\n\nStock disponible : ${selection.quantite}`

      );

      return;

    }



    const ligne = {

      produit: selection,

      quantite: Number(quantite),

      prix: Number(
        selection.prix || 0
      )

    };



    setProduits([

      ...produits,

      ligne

    ]);



    setSelection(null);

    setRecherche("");

    setQuantite("");

  }



  // ==========================================
  // SUPPRIMER LIGNE
  // ==========================================

  function supprimerLigne(index) {

    setProduits(

      produits.filter(
        (_, i) => i !== index
      )

    );

  }



  // ==========================================
  // TOTAL
  // ==========================================

  const total =
    produits.reduce(

      (sum, p) =>

        sum +

        (
          Number(p.quantite || 0) *
          Number(p.prix || 0)
        ),

      0

    );



  // ==========================================
  // VALIDER VENTE
  // ==========================================

  async function handleSubmit() {


    if (!nom) {

      alert(
        "Veuillez entrer le nom du patient"
      );

      return;

    }



    if (produits.length === 0) {

      alert(
        "Aucun produit sélectionné"
      );

      return;

    }



    // ========================================
    // SORTIE PAR ID
    // ========================================

    for (const ligne of produits) {

      await sortirProduit(

        ligne.produit.id,

        ligne.quantite

      );

    }



    alert(
      "Vente enregistrée + stock mis à jour"
    );



    setNom("");

    setRecherche("");

    setSelection(null);

    setQuantite("");

    setProduits([]);



    await chargerProduits();

  }


      console.log("PRODUITS:", produitsStock);
  // ==========================================
  // AFFICHAGE
  // ==========================================

  return (

    <div>


      <h2>
        Ajout patient
      </h2>



      {/* ====================================
          PATIENT
      ==================================== */}

      <input

        placeholder="Nom patient"

        value={nom}

        onChange={
          e =>
            setNom(e.target.value)
        }

      />



      <h3>
        Rechercher produit
      </h3>



      {/* ====================================
          RECHERCHE DYNAMIQUE
      ==================================== */}

      <input

        placeholder="Ex : para"

        value={recherche}

        onChange={e => {

          setRecherche(
            e.target.value
          );

          setSelection(null);

        }}

      />



      {/* ====================================
          RESULTATS
      ==================================== */}

      {

        recherche &&
        !selection && (

          <div
            className="liste-recherche"
          >


            {

              resultat.length === 0 && (

                <p>
                  Aucun produit trouvé
                </p>

              )

            }



            {

             resultat.map(p => (

                <div
                  key={p.id}
                  className="suggestion"
                  onClick={() => choisirProduit(p)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    borderBottom: "1px solid #ddd"
                  }}
                >

                  <strong>
                    {p.nom}
                  </strong>

                  {" "}

                  <strong>
                    ({p.origine})
                  </strong>

                  <br />

                  <small>
                    ID: {p.id}
                    {" • "}
                    Stock: {p.quantite}
                    {" • "}
                    Lot: {p.lot || "-"}
                  </small>

                </div>

                  ))
            }


          </div>

        )

      }



      {/* ====================================
          PRODUIT CHOISI
      ==================================== */}

      {

        selection && (

          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              border: "1px solid #ccc"
            }}
          >

            <strong>
              Produit choisi :
            </strong>


            <br />


            {

              afficherNomProduit(
                selection
              )

            }


            <br />


            Origine :

            {" "}

            {

              selection.origine ||
              "-"

            }


            <br />


            Lot :

            {" "}

            {

              selection.lot ||
              "-"

            }


            <br />


            Stock :

            {" "}

            {

              selection.quantite

            }


            <br />


            Prix :

            {" "}

            {

              selection.prix

            } Ar

          </div>

        )

      }



      {/* ====================================
          QUANTITE
      ==================================== */}

      {

        selection && (

          <div
            style={{
              marginTop: "10px"
            }}
          >

            <input

              type="number"

              min="1"

              placeholder="Quantité"

              value={quantite}

              onChange={
                e =>
                  setQuantite(
                    e.target.value
                  )
              }

            />


            <button
              onClick={ajouterLigne}
            >

              Ajouter ligne

            </button>

          </div>

        )

      }



      {/* ====================================
          ORDONNANCE
      ==================================== */}

      <h3>
        Ordonnance
      </h3>



      <table
        border="1"
        style={{
          marginTop: "20px",
          width: "100%"
        }}
      >

        <thead>

          <tr>

            <th>
              Produit
            </th>

            <th>
              Origine
            </th>

            <th>
              Quantité
            </th>

            <th>
              Prix
            </th>

            <th>
              Total
            </th>

            <th>
              Action
            </th>

          </tr>

        </thead>



        <tbody>


          {

            produits.map(
              (p, i) => (

                <tr key={i}>


                  <td>

                    {
                      afficherNomProduit(
                        p.produit
                      )
                    }

                  </td>



                  <td>

                    {
                      p.produit.origine
                    }

                  </td>



                  <td>

                    {
                      p.quantite
                    }

                  </td>



                  <td>

                    {
                      p.prix
                    } Ar

                  </td>



                  <td>

                    {

                      Number(
                        p.quantite
                      ) *

                      Number(
                        p.prix
                      )

                    } Ar

                  </td>



                  <td>

                    <button

                      onClick={() =>
                        supprimerLigne(i)
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
              colSpan="4"
            >

              <strong>
                Total
              </strong>

            </td>


            <td>

              <strong>

                {total} Ar

              </strong>

            </td>


            <td></td>

          </tr>


        </tbody>

      </table>



      <button

        onClick={handleSubmit}

        style={{
          marginTop: "20px"
        }}

      >

        Valider vente

      </button>


    </div>

  );

}


export default Patients;