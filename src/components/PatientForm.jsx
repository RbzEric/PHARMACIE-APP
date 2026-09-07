import {
  useEffect,
  useState
} from "react";

import {
  getProduits,
  sortirProduit
} from "../services/stockService";


// ======================================================
// NOM AFFICHAGE
// ======================================================

function nomAffichage(produit) {

  if (!produit) return "";


  if (
    produit.origine ===
    "FOND D'URGENCE"
  ) {

    return `${produit.nom} (FU)`;

  }


  if (
    produit.origine ===
    "BUDGET DE L'ÉTAT"
  ) {

    return `${produit.nom} (BE)`;

  }


  return produit.nom;

}


// ======================================================
// ORIGINE COURTE
// ======================================================

function origineCourte(origine) {

  if (
    origine ===
    "FOND D'URGENCE"
  ) {

    return "FU";

  }


  if (
    origine ===
    "BUDGET DE L'ÉTAT"
  ) {

    return "BE";

  }


  return "FANOME";

}


// ======================================================
// COMPONENT
// ======================================================

export default function PatientForm() {

  const [
    produits,
    setProduits
  ] = useState([]);


  const [
    patient,
    setPatient
  ] = useState("");


  const [
    recherche,
    setRecherche
  ] = useState("");


  const [
    selection,
    setSelection
  ] = useState(null);


  const [
    quantite,
    setQuantite
  ] = useState("");


  const [
    ordonnance,
    setOrdonnance
  ] = useState([]);


  // ==================================================
  // CHARGER PRODUITS
  // ==================================================

  async function chargerProduits() {

    const data =
      await getProduits();


    console.log(
      "PRODUITS CHARGES :",
      data
    );


    setProduits(
      data
    );

  }


  useEffect(() => {

    chargerProduits();

  }, []);


  // ==================================================
  // RECHERCHE
  // ==================================================

  const resultat =
    recherche.trim() === ""

      ? []

      : produits.filter(p => {

          if (!p.nom) return false;


          return p.nom
            .toLowerCase()
            .includes(
              recherche
                .toLowerCase()
                .trim()
            );

        });


  // ==================================================
  // CHOISIR PRODUIT
  // ==================================================

  function choisirProduit(p) {

    console.log(
      "PRODUIT SELECTIONNE :",
      p
    );


    setSelection(p);


    setRecherche(
      nomAffichage(p)
    );

  }


  // ==================================================
  // AJOUT LIGNE
  // ==================================================

  function ajouterProduit() {

    if (!selection) {

      alert(
        "Veuillez choisir un produit"
      );

      return;

    }


    const qte =
      Number(quantite);


    if (!qte || qte <= 0) {

      alert(
        "Quantité incorrecte"
      );

      return;

    }


    // ==============================================
    // VERIFIER STOCK
    // ==============================================

    if (
      qte >
      Number(selection.quantite || 0)
    ) {

      alert(

        `Stock insuffisant pour ${nomAffichage(selection)}. Stock disponible : ${selection.quantite}`

      );

      return;

    }


    const ligne = {

      produit:
        selection,

      quantite:
        qte,

      prixUnitaire:
        Number(
          selection.prix || 0
        ),

      prixTotal:

        qte *
        Number(
          selection.prix || 0
        )

    };


    setOrdonnance(
      [
        ...ordonnance,
        ligne
      ]
    );


    setRecherche("");

    setSelection(null);

    setQuantite("");

  }


  // ==================================================
  // SUPPRIMER
  // ==================================================

  function supprimer(index) {

    setOrdonnance(

      ordonnance.filter(
        (_, i) =>
          i !== index
      )

    );

  }


  // ==================================================
  // TOTAL
  // ==================================================

  const total =
    ordonnance.reduce(

      (sum, item) =>

        sum +
        Number(
          item.prixTotal || 0
        ),

      0

    );


  // ==================================================
  // VALIDATION
  // ==================================================

  async function valider() {

    if (!patient.trim()) {

      alert(
        "Entrer le nom du patient"
      );

      return;

    }


    if (
      ordonnance.length === 0
    ) {

      alert(
        "Aucun produit sélectionné"
      );

      return;

    }


    // ==============================================
    // SORTIES
    // ==============================================

    for (
      const item of ordonnance
    ) {

      const success =
        await sortirProduit(

          item.produit.id,

          item.quantite

        );


      if (!success) {

        return;

      }

    }


    alert(
      "Vente enregistrée"
    );


    setPatient("");

    setRecherche("");

    setSelection(null);

    setQuantite("");

    setOrdonnance([]);


    // Recharger stock
    await chargerProduits();

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div>

      <h2>
        Ajout Patient / Vente
      </h2>


      {/* ==========================================
          PATIENT
      ========================================== */}

      <input

        placeholder="Nom du patient"

        value={patient}

        onChange={
          e =>
            setPatient(
              e.target.value
            )
        }

      />


      <br />
      <br />


      {/* ==========================================
          RECHERCHE
      ========================================== */}

      <input

        placeholder="Recherche produit : ex. para"

        value={recherche}

        onChange={e => {

          setRecherche(
            e.target.value
          );

          setSelection(null);

        }}

      />


      {/* ==========================================
          RESULTATS
      ========================================== */}

      {

        recherche &&
        !selection &&
        resultat.length > 0 && (

          <div
            style={{
              border: "1px solid #ccc",
              marginTop: "5px",
              maxWidth: "500px"
            }}
          >

            {

              resultat.map(p => (

                <div

                  key={p.id}

                  onClick={() =>
                    choisirProduit(p)
                  }

                  style={{

                    cursor:
                      "pointer",

                    padding:
                      "10px",

                    borderBottom:
                      "1px solid #ddd"

                  }}

                >

                  <b>
                    {
                      nomAffichage(p)
                    }
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

                    {
                      origineCourte(
                        p.origine
                      )
                    }

                    {" • Stock : "}

                    {
                      p.quantite
                    }

                  </small>

                </div>

              ))

            }

          </div>

        )

      }


      {

        recherche &&
        !selection &&
        resultat.length === 0 && (

          <p>
            Aucun produit trouvé
          </p>

        )

      }


      {/* ==========================================
          PRODUIT SELECTIONNE
      ========================================== */}

      {

        selection && (

          <div
            style={{
              marginTop: "15px"
            }}
          >

            <p>

              <b>
                Produit choisi :
              </b>{" "}

              {
                nomAffichage(
                  selection
                )
              }

              <br />


              <b>
                Type :
              </b>{" "}

              {

                selection.type ===
                "medicament"

                  ? "Médicament"

                  : "Consommable"

              }


              <br />


              <b>
                Origine :
              </b>{" "}

              {
                selection.origine
              }


              <br />


              <b>
                Stock disponible :
              </b>{" "}

              {
                selection.quantite
              }


              <br />


              <b>
                Prix :
              </b>{" "}

              {
                selection.prix
              }{" "}
              Ar

            </p>

          </div>

        )

      }


      {/* ==========================================
          QUANTITE
      ========================================== */}

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
        onClick={
          ajouterProduit
        }
      >

        Ajouter ligne

      </button>


      {/* ==========================================
          ORDONNANCE
      ========================================== */}

      <h3>
        Ordonnance
      </h3>


      <table border="1">

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
            </th>

          </tr>

        </thead>


        <tbody>

          {

            ordonnance.map(
              (item, index) => (

                <tr
                  key={index}
                >

                  <td>

                    {
                      nomAffichage(
                        item.produit
                      )
                    }

                  </td>


                  <td>

                    {
                      item.produit
                        .origine
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
                    }{" "}
                    Ar

                  </td>


                  <td>

                    {
                      item.prixTotal
                    }{" "}
                    Ar

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


          {

            ordonnance.length > 0 && (

              <tr>

                <td
                  colSpan="4"
                >

                  <b>
                    Total
                  </b>

                </td>


                <td>

                  <b>
                    {total} Ar
                  </b>

                </td>


                <td>
                </td>

              </tr>

            )

          }

        </tbody>

      </table>


      <br />


      {/* ==========================================
          VALIDER
      ========================================== */}

      <button
        onClick={valider}
      >

        Valider Vente

      </button>

    </div>

  );

}