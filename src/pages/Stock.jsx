
import { useEffect, useState } from "react";

import {
  getMouvements,
  getProduits,
  calculStock
} from "../services/stockService";


/* ==================================================
   NORMALISER ORIGINE
================================================== */

function normaliserOrigine(value) {
  const origine = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, " ");

  if (origine === "FANOME") {
    return "FANOME";
  }

  if (
    origine === "FOND D'URGENCE" ||
    origine === "FOND D URGENCE" ||
    origine === "FOND URGENCE"
  ) {
    return "FOND D'URGENCE";
  }

  if (
    origine === "BUDGET DE L'ÉTAT" ||
    origine === "BUDGET DE L'ETAT" ||
    origine === "BUDGET DE LETAT"
  ) {
    return "BUDGET DE L'ÉTAT";
  }

  return origine || "FANOME";
}


/* ==================================================
   NOM AFFICHAGE
================================================== */

function nomAffichage(p) {
  if (!p) return "";

  const origine = normaliserOrigine(
    p.origine
  );

  if (origine === "FOND D'URGENCE") {
    return `${p.nom} (FU)`;
  }

  if (origine === "BUDGET DE L'ÉTAT") {
    return `${p.nom} (BE)`;
  }

  /*
   * Pour les nouvelles origines comme PF,
   * on affiche automatiquement le code.
   */
  if (
    origine !== "FANOME" &&
    origine
  ) {
    return `${p.nom} (${origine})`;
  }

  return p.nom;
}


/* ==================================================
   COMPOSANT PRINCIPAL
================================================== */

export default function Stock() {

  const [
    mouvements,
    setMouvements
  ] = useState([]);


  const [
    produits,
    setProduits
  ] = useState([]);


  const [
    produitSelectionne,
    setProduitSelectionne
  ] = useState("");


  const [
    origineSelectionnee,
    setOrigineSelectionnee
  ] = useState("tous");


  const [
    stockActuel,
    setStockActuel
  ] = useState(0);


  /* ==================================================
     CHARGER DONNEES
  ================================================== */

  async function charger() {

    try {

      const produitsData =
        await getProduits();

      const mouvementsData =
        await getMouvements();

      setProduits(
        produitsData || []
      );

      setMouvements(
        mouvementsData || []
      );

    } catch (error) {

      console.error(
        "Erreur chargement fiche de stock :",
        error
      );

    }

  }


  useEffect(() => {

    charger();

  }, []);


  /* ==================================================
     ORIGINES DISPONIBLES
     
     Les origines sont récupérées automatiquement
     depuis les produits de la base de données.
  ================================================== */

  const originesDisponibles =
    Array.from(
      new Set(
        produits
          .map((p) =>
            normaliserOrigine(
              p.origine
            )
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b, "fr")
    );


  /* ==================================================
     PRODUITS FILTRES PAR ORIGINE
  ================================================== */

  const produitsFiltres =
    origineSelectionnee === "tous"
      ? produits
      : produits.filter(
          (p) =>
            normaliserOrigine(
              p.origine
            ) ===
            normaliserOrigine(
              origineSelectionnee
            )
        );


  /* ==================================================
     PRODUIT SELECTIONNE
  ================================================== */

  const produit =
    produits.find(
      (p) =>
        Number(p.id) ===
        Number(produitSelectionne)
    );


  /* ==================================================
     MOUVEMENTS DU PRODUIT
  ================================================== */

  const mouvementsFiltres =
    mouvements.filter(
      (m) =>
        Number(m.produit_id) ===
        Number(produitSelectionne)
    );


  /* ==================================================
     STOCK ACTUEL
  ================================================== */

  useEffect(() => {

    async function chargerStock() {

      if (!produitSelectionne) {

        setStockActuel(0);

        return;

      }

      try {

        const stock =
          await calculStock(
            produitSelectionne
          );

        setStockActuel(
          stock || 0
        );

      } catch (error) {

        console.error(
          "Erreur calcul stock :",
          error
        );

        setStockActuel(0);

      }

    }

    chargerStock();

  }, [
    produitSelectionne,
    mouvements
  ]);


  /* ==================================================
     CHANGEMENT ORIGINE
     
     Quand on change d'origine,
     le produit sélectionné est réinitialisé.
  ================================================== */

  function changerOrigine(e) {

    const nouvelleOrigine =
      e.target.value;

    setOrigineSelectionnee(
      nouvelleOrigine
    );

    /*
     * On évite qu'un produit FU reste sélectionné
     * lorsqu'on passe par exemple à BE.
     */
    setProduitSelectionne("");

    setStockActuel(0);

  }


  /* ==================================================
     RENDER
  ================================================== */

  return (

    <div>

      <h2>
        Fiche de stock
      </h2>


      {/* ==================================================
          FILTRE ORIGINE
      ================================================== */}

      <div
        style={{
          marginBottom: "20px"
        }}
      >

        <label>
          <b>
            Origine / Source :
          </b>
        </label>

        <br />

        <select
          value={
            origineSelectionnee
          }
          onChange={
            changerOrigine
          }
          style={{
            minWidth: "250px",
            padding: "8px",
            marginTop: "5px"
          }}
        >

          <option value="tous">
            Tous les produits
          </option>


          {originesDisponibles.map(
            (origine) => (

              <option
                key={origine}
                value={origine}
              >
                {origine}
              </option>

            )
          )}

        </select>

      </div>


      {/* ==================================================
          PRODUIT
      ================================================== */}

      <label>
        <b>
          Produit :
        </b>
      </label>

      <br />

      <select
        value={
          produitSelectionne
        }
        onChange={
          (e) =>
            setProduitSelectionne(
              e.target.value
            )
        }
        style={{
          minWidth: "300px",
          padding: "8px",
          marginTop: "5px"
        }}
      >

        <option value="">
          Choisir produit
        </option>


        {

          produitsFiltres.map(
            (p) => (

              <option
                key={p.id}
                value={p.id}
              >

                {nomAffichage(p)}

              </option>

            )
          )

        }

      </select>


      {/* ==================================================
          INFORMATION FILTRE
      ================================================== */}

      {origineSelectionnee !==
        "tous" && (

        <p
          style={{
            marginTop: "10px",
            fontWeight: "bold"
          }}
        >

          Origine sélectionnée :{" "}

          {origineSelectionnee}

          {" — "}

          {produitsFiltres.length}

          {" produit(s)"}

        </p>

      )}


      {/* ==================================================
          INFORMATIONS PRODUIT
      ================================================== */}

      {

        produit && (

          <div
            style={{
              marginTop: "20px"
            }}
          >

            <h3>
              {nomAffichage(produit)}
            </h3>


            <p>

              <b>
                Type :
              </b>{" "}

              {

                produit.type ===
                "medicament"

                  ? "Médicament"

                  : "Consommable"

              }

            </p>


            <p>

              <b>
                Origine :
              </b>{" "}

              {produit.origine}

            </p>


            <p>

              <b>
                Lot :
              </b>{" "}

              {produit.lot || "-"}

            </p>


            <p>

              <b>
                Date d'expiration :
              </b>{" "}

              {

                produit.date_expiration ||
                "-"

              }

            </p>

          </div>

        )
      }


      {/* ==================================================
          TABLEAU MOUVEMENTS
      ================================================== */}

      {

        produitSelectionne && (

          <table

            border="1"

            style={{
              marginTop: "20px",
              width: "100%",
              borderCollapse:
                "collapse"
            }}

          >

            <thead>

              <tr>

                <th>
                  Date
                </th>

                <th>
                  Entrée
                </th>

                <th>
                  Sortie
                </th>

                <th>
                  Stock
                </th>

                <th>
                  Observation
                </th>

              </tr>

            </thead>


            <tbody>

              {

                mouvementsFiltres.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "15px"
                      }}
                    >

                      Aucun mouvement

                    </td>

                  </tr>

                ) : (

                  (() => {

                    let stock = 0;


                    return mouvementsFiltres.map(
                      (m, index) => {

                        stock =
                          stock +
                          Number(
                            m.entree || 0
                          ) -
                          Number(
                            m.sortie || 0
                          );


                        return (

                          <tr
                            key={
                              m.id ||
                              index
                            }
                          >

                            <td>
                              {m.date}
                            </td>


                            <td>
                              {m.entree}
                            </td>


                            <td>
                              {m.sortie}
                            </td>


                            <td>
                              <b>
                                {stock}
                              </b>
                            </td>


                            <td>
                              {m.observation}
                            </td>

                          </tr>

                        );

                      }
                    );

                  })()

                )

              }

            </tbody>

          </table>

        )

      }


      {/* ==================================================
          STOCK ACTUEL
      ================================================== */}

      {

        produitSelectionne && (

          <h3
            style={{
              marginTop: "20px"
            }}
          >

            Stock actuel :{" "}

            <b>
              {stockActuel}
            </b>

          </h3>

        )

      }

    </div>

  );

}

