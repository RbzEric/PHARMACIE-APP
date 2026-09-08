
import { useEffect, useMemo, useState } from "react";

import {
  enregistrerInventaires,
  getInventaire
} from "../services/stockService";

import { genererRapport } from "../services/rapportService";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =====================================================
   NORMALISATION ORIGINE
===================================================== */

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

/* =====================================================
   TYPE
===================================================== */

function normaliserType(value) {
  const type = String(value || "")
    .trim()
    .toLowerCase();

  if (
    type === "consommable" ||
    type === "consommables"
  ) {
    return "consommable";
  }

  return "medicament";
}

/* =====================================================
   NETTOYAGE NOM PRODUIT
   Évite :
   Paracetamol (BE) (BE)
   Paracetamol (FU) (FU)
===================================================== */

function nettoyerNomProduit(value) {
  let nom = String(value || "").trim();

  /*
   * On retire les suffixes connus à répétition.
   */
  let ancienNom = "";

  while (ancienNom !== nom) {
    ancienNom = nom;

    nom = nom
      .replace(
        /\s*\((?:BE|FU|FANOME)\)\s*$/i,
        ""
      )
      .trim();
  }

  return nom;
}

/* =====================================================
   NOM AFFICHAGE
===================================================== */

function nomAffichage(produit) {
  if (!produit) return "";

  const nom = nettoyerNomProduit(
    produit.nomOriginal || produit.nom
  );

  const origine = normaliserOrigine(
    produit.origine
  );

  if (origine === "FOND D'URGENCE") {
    return `${nom} (FU)`;
  }

  if (origine === "BUDGET DE L'ÉTAT") {
    return `${nom} (BE)`;
  }

  return nom;
}

/* =====================================================
   MOIS
===================================================== */

const moisListe = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre"
];

/* =====================================================
   PAGE INVENTAIRE
===================================================== */

export default function Inventaire() {
  const maintenant = new Date();

  const [mois, setMois] = useState(
    maintenant.getMonth()
  );

  const [annee, setAnnee] = useState(
    maintenant.getFullYear()
  );

  const [rapport, setRapport] = useState([]);

  const [historique, setHistorique] = useState([]);

  const [origineSelectionnee, setOrigineSelectionnee] =
    useState("");

  const [recherche, setRecherche] = useState("");

  const [produitsSelectionnes, setProduitsSelectionnes] =
    useState([]);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  /* ===================================================
     CLE PRODUIT
     Sert à identifier :
     nom + type + origine
  =================================================== */

  function cleProduit(produit) {
    const nom = nettoyerNomProduit(
      produit?.nomOriginal || produit?.nom
    )
      .trim()
      .toLowerCase();

    const type = normaliserType(
      produit?.type
    );

    const origine = normaliserOrigine(
      produit?.origine
    );

    return `${nom}|${type}|${origine}`;
  }

  /* ===================================================
     TROUVER STOCK THEORIQUE DANS RAPPORT
  =================================================== */

  function trouverStockRapport(
    produitNom,
    type,
    origine
  ) {
    const nomRecherche = nettoyerNomProduit(
      produitNom
    )
      .trim()
      .toLowerCase();

    const typeRecherche =
      normaliserType(type);

    const origineRecherche =
      normaliserOrigine(origine);

    const produitRapport =
      rapport.find((p) => {
        const nomRapport =
          nettoyerNomProduit(
            p.nom
          )
            .trim()
            .toLowerCase();

        const typeRapport =
          normaliserType(p.type);

        const origineRapport =
          normaliserOrigine(
            p.origine
          );

        return (
          nomRapport === nomRecherche &&
          typeRapport === typeRecherche &&
          origineRapport ===
            origineRecherche
        );
      });

    if (!produitRapport) {
      return 0;
    }

    return Number(
      produitRapport.stockFin || 0
    );
  }

  /* ===================================================
     CHARGER RAPPORT + INVENTAIRE
  =================================================== */

  async function chargerInventaire() {
    setLoading(true);
    setMessage("");

    try {
      const resultatRapport =
        await genererRapport(
          Number(mois),
          Number(annee)
        );

      const resultatHistorique =
        await getInventaire(
          Number(mois),
          Number(annee)
        );

      const rapportNormalise =
        resultatRapport || [];

      const historiqueNormalise =
        resultatHistorique || [];

      setRapport(
        rapportNormalise
      );

      setHistorique(
        historiqueNormalise
      );

      /*
       * On reconstruit les produits déjà
       * enregistrés.
       *
       * IMPORTANT :
       * le stock théorique vient du RAPPORT.
       */
      const produitsExistants =
        historiqueNormalise.map(
          (item, index) => {
            const nomOriginal =
              nettoyerNomProduit(
                item.produit_nom
              );

            const type =
              normaliserType(
                item.type
              );

            const origine =
              normaliserOrigine(
                item.origine
              );

            const stockTheorique =
              (() => {
                const nomRecherche =
                  nomOriginal
                    .trim()
                    .toLowerCase();

                const rapportCorrespondant =
                  rapportNormalise.find(
                    (p) => {
                      const nomRapport =
                        nettoyerNomProduit(
                          p.nom
                        )
                          .trim()
                          .toLowerCase();

                      return (
                        nomRapport ===
                          nomRecherche &&
                        normaliserType(
                          p.type
                        ) === type &&
                        normaliserOrigine(
                          p.origine
                        ) === origine
                      );
                    }
                  );

                if (
                  rapportCorrespondant
                ) {
                  return Number(
                    rapportCorrespondant.stockFin ||
                      0
                  );
                }

                return Number(
                  item.stock_theorique ||
                    0
                );
              })();

            const stockPhysique =
              item.stock_physique ===
                null ||
              item.stock_physique ===
                undefined ||
              item.stock_physique === ""
                ? 0
                : Number(
                    item.stock_physique
                  );

            return {
              id: `historique-${cleProduit(
                {
                  nomOriginal,
                  type,
                  origine
                }
              )}-${index}`,

              nom: nomAffichage({
                nomOriginal,
                type,
                origine
              }),

              nomOriginal,

              type,

              origine,

              stockTheorique,

              stockPhysique,

              ecart:
                stockPhysique -
                stockTheorique,

              dejaEnregistre: true
            };
          }
        );

      setProduitsSelectionnes(
        produitsExistants
      );
    } catch (error) {
      console.error(
        "Erreur chargement inventaire :",
        error
      );

      setMessage(
        "Erreur lors du chargement de l'inventaire."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===================================================
     CHARGEMENT MOIS / ANNEE
  =================================================== */

  useEffect(() => {
    chargerInventaire();
  }, [mois, annee]);

  /* ===================================================
     ORIGINES DISPONIBLES
  =================================================== */

  const originesDisponibles = useMemo(() => {
    return [
      ...new Set(
        rapport
          .map((p) =>
            normaliserOrigine(
              p.origine
            )
          )
          .filter(Boolean)
      )
    ].sort((a, b) =>
      a.localeCompare(b, "fr")
    );
  }, [rapport]);

  /* ===================================================
     RAPPORT FILTRE PAR ORIGINE
  =================================================== */

  const produitsOrigine = useMemo(() => {
    if (!origineSelectionnee) {
      return [];
    }

    return rapport.filter((p) => {
      return (
        normaliserOrigine(
          p.origine
        ) === origineSelectionnee
      );
    });
  }, [
    rapport,
    origineSelectionnee
  ]);

  /* ===================================================
     RECHERCHE
  =================================================== */

  const resultatsRecherche =
    useMemo(() => {
      const texte =
        recherche
          .trim()
          .toLowerCase();

      if (!origineSelectionnee) {
        return [];
      }

      if (!texte) {
        return [];
      }

      return produitsOrigine.filter(
        (p) => {
          const nom =
            nettoyerNomProduit(
              p.nom
            ).toLowerCase();

          return nom.includes(
            texte
          );
        }
      );
    }, [
      produitsOrigine,
      recherche,
      origineSelectionnee
    ]);

  /* ===================================================
     PRODUITS DE L'ORIGINE ACTUELLE
     
     IMPORTANT :
     Même si produitsSelectionnes contient
     plusieurs origines, on affiche UNIQUEMENT
     l'origine sélectionnée.
  =================================================== */

  const produitsOrigineSelectionnee =
    useMemo(() => {
      if (!origineSelectionnee) {
        return [];
      }

      return produitsSelectionnes.filter(
        (item) =>
          normaliserOrigine(
            item.origine
          ) ===
          origineSelectionnee
      );
    }, [
      produitsSelectionnes,
      origineSelectionnee
    ]);

  /* ===================================================
     AJOUTER PRODUIT A L'INVENTAIRE
  =================================================== */

  function ajouterProduitInventaire(
    produit
  ) {
    if (!produit) return;

    const origine =
      normaliserOrigine(
        produit.origine
      );

    /*
     * Sécurité :
     * on ne peut ajouter que le produit
     * de l'origine sélectionnée.
     */
    if (
      !origineSelectionnee ||
      origine !==
        origineSelectionnee
    ) {
      return;
    }

    const nom =
      nettoyerNomProduit(
        produit.nom
      );

    const type =
      normaliserType(
        produit.type
      );

    /*
     * Vérifier si déjà présent
     */
    const existe =
      produitsSelectionnes.some(
        (item) =>
          cleProduit(item) ===
          cleProduit({
            nomOriginal: nom,
            type,
            origine
          })
      );

    if (existe) {
      setMessage(
        "Ce produit est déjà dans l'inventaire."
      );

      return;
    }

    /*
     * Stock théorique = stockFin du RAPPORT
     */
    const stockTheorique =
      Number(
        produit.stockFin || 0
      );

    const nouveau = {
      id: `nouveau-${Date.now()}-${Math.random()}`,

      nom: nomAffichage({
        nomOriginal: nom,
        type,
        origine
      }),

      nomOriginal: nom,

      type,

      origine,

      stockTheorique,

      /*
       * Vide visuellement.
       * Lors de l'enregistrement = 0.
       */
      stockPhysique: "",

      ecart: null,

      dejaEnregistre: false
    };

    setProduitsSelectionnes(
      (ancien) => [
        ...ancien,
        nouveau
      ]
    );

    setRecherche("");
  }

  /* ===================================================
     MODIFIER STOCK PHYSIQUE
  =================================================== */

  function modifierStockPhysique(
    id,
    valeur
  ) {
    setProduitsSelectionnes(
      (ancien) =>
        ancien.map((item) => {
          if (
            item.id !== id
          ) {
            return item;
          }

          /*
           * Champ vide :
           * affichage vide.
           * À l'enregistrement = 0.
           */
          if (valeur === "") {
            return {
              ...item,

              stockPhysique: "",

              ecart: null
            };
          }

          const physique =
            Number(valeur);

          if (
            Number.isNaN(
              physique
            )
          ) {
            return item;
          }

          return {
            ...item,

            stockPhysique:
              physique,

            ecart:
              physique -
              Number(
                item.stockTheorique ||
                  0
              )
          };
        })
    );
  }

  /* ===================================================
     SUPPRIMER PRODUIT
  =================================================== */

  function supprimerProduit(id) {
    setProduitsSelectionnes(
      (ancien) =>
        ancien.filter(
          (item) =>
            item.id !== id
        )
    );
  }

  /* ===================================================
     ENREGISTRER INVENTAIRE
  =================================================== */

  async function enregistrer() {
    if (!origineSelectionnee) {
      alert(
        "Veuillez sélectionner une origine."
      );

      return;
    }

    /*
     * IMPORTANT :
     * On sauvegarde UNIQUEMENT les produits
     * de l'origine sélectionnée.
     */
    const produitsAEnregistrer =
      produitsSelectionnes.filter(
        (item) =>
          normaliserOrigine(
            item.origine
          ) ===
          origineSelectionnee
      );

    if (
      produitsAEnregistrer.length ===
      0
    ) {
      alert(
        "Aucun produit n'a été ajouté à l'inventaire pour cette origine."
      );

      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const donnees =
        produitsAEnregistrer.map(
          (item) => {
            const stockPhysique =
              item.stockPhysique ===
                "" ||
              item.stockPhysique ===
                null ||
              item.stockPhysique ===
                undefined
                ? 0
                : Number(
                    item.stockPhysique
                  );

            /*
             * Le stock théorique est celui
             * du rapport.
             */
            const stockTheorique =
              trouverStockRapport(
                item.nomOriginal,
                item.type,
                item.origine
              );

            /*
             * Si le rapport ne trouve pas
             * le produit, on conserve celui
             * déjà présent.
             */
            const stockFinal =
              stockTheorique !== 0
                ? stockTheorique
                : Number(
                    item.stockTheorique ||
                      0
                  );

            const ecart =
              stockPhysique -
              stockFinal;

            return {
              mois: Number(mois),

              annee: Number(annee),

              produit_nom:
                nettoyerNomProduit(
                  item.nomOriginal
                ),

              type:
                normaliserType(
                  item.type
                ),

              origine:
                normaliserOrigine(
                  item.origine
                ),

              stock_theorique:
                stockFinal,

              stock_physique:
                stockPhysique,

              ecart,

              date_inventaire:
                new Date().toLocaleDateString(
                  "fr-FR"
                )
            };
          }
        );

      await enregistrerInventaires(
        donnees
      );

      /*
       * Recharger les données.
       */
      await chargerInventaire();

      setMessage(
        `Inventaire ${origineSelectionnee} de ${moisListe[Number(mois)]} ${annee} enregistré avec succès.`
      );
    } catch (error) {
      console.error(
        "Erreur enregistrement inventaire :",
        error
      );

      setMessage(
        "Erreur lors de l'enregistrement de l'inventaire."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ===================================================
     MEDICAMENTS / CONSOMMABLES
     
     IMPORTANT :
     On utilise uniquement l'origine
     actuellement sélectionnée.
  =================================================== */

  const medicaments =
    produitsOrigineSelectionnee.filter(
      (item) =>
        normaliserType(
          item.type
        ) === "medicament"
    );

  const consommables =
    produitsOrigineSelectionnee.filter(
      (item) =>
        normaliserType(
          item.type
        ) === "consommable"
    );

  /* ===================================================
     RESUME
  =================================================== */

  const nombreProduits =
    produitsOrigineSelectionnee.length;

  const nombreComptes =
    produitsOrigineSelectionnee.filter(
      (item) =>
        item.stockPhysique !== "" &&
        item.stockPhysique !==
          null &&
        item.stockPhysique !==
          undefined
    ).length;

  const totalEcart =
    produitsOrigineSelectionnee.reduce(
      (total, item) => {
        const physique =
          item.stockPhysique ===
          ""
            ? 0
            : Number(
                item.stockPhysique ||
                  0
              );

        const theorique =
          Number(
            item.stockTheorique ||
              0
          );

        return (
          total +
          (physique -
            theorique)
        );
      },
      0
    );

  /* ===================================================
     TABLEAU INVENTAIRE
  =================================================== */

  function afficherTableau(
    titre,
    liste
  ) {
    if (
      liste.length === 0
    ) {
      return null;
    }

    return (
      <div
        style={{
          marginBottom: "35px"
        }}
      >
        <h2
          style={{
            marginBottom:
              "15px"
          }}
        >
          {titre}
        </h2>

        <div
          style={{
            overflowX:
              "auto"
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse"
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>
                  N°
                </th>

                <th style={thStyle}>
                  Produit
                </th>

                <th style={thStyle}>
                  Stock théorique
                </th>

                <th style={thStyle}>
                  Stock physique
                </th>

                <th style={thStyle}>
                  Écart
                </th>

                <th style={thStyle}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {liste.map(
                (
                  item,
                  index
                ) => {
                  const physique =
                    item.stockPhysique ===
                    ""
                      ? 0
                      : Number(
                          item.stockPhysique ||
                            0
                        );

                  const ecart =
                    physique -
                    Number(
                      item.stockTheorique ||
                        0
                    );

                  return (
                    <tr
                      key={
                        item.id
                      }
                    >
                      <td
                        style={{
                          ...tdStyle,
                          textAlign:
                            "center"
                        }}
                      >
                        {index +
                          1}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {nomAffichage(
                          item
                        )}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign:
                            "center"
                        }}
                      >
                        {Number(
                          item.stockTheorique ||
                            0
                        )}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign:
                            "center"
                        }}
                      >
                        <input
                          type="number"
                          min="0"
                          value={
                            item.stockPhysique
                          }
                          placeholder="0"
                          onChange={(
                            e
                          ) =>
                            modifierStockPhysique(
                              item.id,
                              e
                                .target
                                .value
                            )
                          }
                          style={{
                            width:
                              "100px",
                            padding:
                              "7px",
                            textAlign:
                              "center"
                          }}
                        />
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign:
                            "center",
                          fontWeight:
                            "bold"
                        }}
                      >
                        {ecart >
                        0
                          ? `+${ecart}`
                          : ecart}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign:
                            "center"
                        }}
                      >
                        <button
                          onClick={() =>
                            supprimerProduit(
                              item.id
                            )
                          }
                          style={{
                            background:
                              "#d32f2f",
                            color:
                              "white",
                            border:
                              "none",
                            borderRadius:
                              "5px",
                            padding:
                              "6px 10px",
                            cursor:
                              "pointer"
                          }}
                        >
                          Retirer
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ===================================================
     EXPORT PDF
     
     IMPORTANT :
     PDF = UNIQUEMENT origine sélectionnée
  =================================================== */

  function exporterPDF() {
    if (!origineSelectionnee) {
      alert(
        "Veuillez sélectionner une origine avant d'exporter le PDF."
      );

      return;
    }

    if (
      produitsOrigineSelectionnee.length ===
      0
    ) {
      alert(
        "Aucun produit dans l'inventaire pour cette origine."
      );

      return;
    }

    const doc =
      new jsPDF(
        "landscape"
      );

    const largeur =
      doc.internal.pageSize.getWidth();

    const hauteur =
      doc.internal.pageSize.getHeight();

    /* ===============================================
       TITRE
    =============================================== */

    doc.setFontSize(
      14
    );

    doc.setFont(
      undefined,
      "bold"
    );

    doc.text(
      "FICHE D'INVENTAIRE PHARMACIE",
      largeur / 2,
      15,
      {
        align: "center"
      }
    );

    doc.setFont(
      undefined,
      "normal"
    );

    /* ===============================================
       INFORMATIONS
    =============================================== */

    doc.setFontSize(
      10
    );

    doc.text(
      `Origine : ${origineSelectionnee}`,
      14,
      25
    );

    doc.text(
      `Mois : ${
        moisListe[
          Number(mois)
        ]
      } ${annee}`,
      14,
      30
    );

    doc.text(
      `Date : ${new Date().toLocaleDateString(
        "fr-FR"
      )}`,
      14,
      35
    );

    /* ===============================================
       POSITION
    =============================================== */

    let positionY = 43;

    /* ===============================================
       MEDICAMENTS
    =============================================== */

    if (
      medicaments.length >
      0
    ) {
      doc.setFontSize(
        11
      );

      doc.setFont(
        undefined,
        "bold"
      );

      doc.text(
        "MÉDICAMENTS",
        largeur / 2,
        positionY,
        {
          align: "center"
        }
      );

      doc.setFont(
        undefined,
        "normal"
      );

      autoTable(
        doc,
        {
          startY:
            positionY + 5,

          head: [
            [
              "N°",
              "Produit",
              "Stock théorique",
              "Stock physique",
              "Écart"
            ]
          ],

          body:
            medicaments.map(
              (
                item,
                index
              ) => {
                const physique =
                  item.stockPhysique ===
                  ""
                    ? 0
                    : Number(
                        item.stockPhysique ||
                          0
                      );

                const theorique =
                  Number(
                    item.stockTheorique ||
                      0
                  );

                const ecart =
                  physique -
                  theorique;

                return [
                  index +
                    1,

                  nomAffichage(
                    item
                  ),

                  theorique,

                  physique,

                  ecart >
                  0
                    ? `+${ecart}`
                    : ecart
                ];
              }
            ),

          theme:
            "grid",

          styles: {
            halign:
              "center",

            valign:
              "middle",

            lineWidth:
              0.2,

            lineColor: [
              0,
              0,
              0
            ]
          },

          headStyles: {
            halign:
              "center",

            valign:
              "middle",

            lineWidth:
              0.3,

            lineColor: [
              0,
              0,
              0
            ]
          },

          columnStyles: {
            1: {
              halign:
                "left"
            }
          }
        }
      );

      positionY =
        doc.lastAutoTable
          ? doc.lastAutoTable
              .finalY +
            12
          : positionY +
            20;
    }

    /* ===============================================
       CONSOMMABLES
    =============================================== */

    if (
      consommables.length >
      0
    ) {
      /*
       * Nouvelle page si nécessaire.
       */
      if (
        positionY >
        hauteur - 35
      ) {
        doc.addPage();

        positionY = 20;
      }

      doc.setFontSize(
        11
      );

      doc.setFont(
        undefined,
        "bold"
      );

      doc.text(
        "CONSOMMABLES",
        largeur / 2,
        positionY,
        {
          align: "center"
        }
      );

      doc.setFont(
        undefined,
        "normal"
      );

      autoTable(
        doc,
        {
          startY:
            positionY + 5,

          head: [
            [
              "N°",
              "Produit",
              "Stock théorique",
              "Stock physique",
              "Écart"
            ]
          ],

          body:
            consommables.map(
              (
                item,
                index
              ) => {
                const physique =
                  item.stockPhysique ===
                  ""
                    ? 0
                    : Number(
                        item.stockPhysique ||
                          0
                      );

                const theorique =
                  Number(
                    item.stockTheorique ||
                      0
                  );

                const ecart =
                  physique -
                  theorique;

                return [
                  index +
                    1,

                  nomAffichage(
                    item
                  ),

                  theorique,

                  physique,

                  ecart >
                  0
                    ? `+${ecart}`
                    : ecart
                ];
              }
            ),

          theme:
            "grid",

          styles: {
            halign:
              "center",

            valign:
              "middle",

            lineWidth:
              0.2,

            lineColor: [
              0,
              0,
              0
            ]
          },

          headStyles: {
            halign:
              "center",

            valign:
              "middle",

            lineWidth:
              0.3,

            lineColor: [
              0,
              0,
              0
            ]
          },

          columnStyles: {
            1: {
              halign:
                "left"
            }
          }
        }
      );
    }

    /* ===============================================
       NOM FICHIER
    =============================================== */

    const origineNom =
      origineSelectionnee
        .replace(
          /[^a-zA-Z0-9]+/g,
          "-"
        )
        .toLowerCase();

    const moisNom =
      moisListe[
        Number(mois)
      ].toLowerCase();

    doc.save(
      `inventaire-${origineNom}-${moisNom}-${annee}.pdf`
    );
  }

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div
      style={{
        padding: "25px"
      }}
    >
      <h1>
        Inventaire
      </h1>

      <p
        style={{
          color: "#666"
        }}
      >
        Inventaire physique de fin de mois
      </p>

      {/* ============================================
          CONTROLES
      ============================================ */}

      <div
        style={{
          display:
            "flex",

          gap:
            "10px",

          flexWrap:
            "wrap",

          alignItems:
            "center",

          marginBottom:
            "20px"
        }}
      >
        {/* MOIS */}

        <select
          value={mois}
          onChange={(e) =>
            setMois(
              Number(
                e.target.value
              )
            )
          }
          style={
            selectStyle
          }
        >
          {moisListe.map(
            (
              nom,
              index
            ) => (
              <option
                key={index}
                value={index}
              >
                {nom}
              </option>
            )
          )}
        </select>

        {/* ANNEE */}

        <select
          value={annee}
          onChange={(e) =>
            setAnnee(
              Number(
                e.target.value
              )
            )
          }
          style={
            selectStyle
          }
        >
          {Array.from(
            {
              length: 10
            },
            (
              _,
              index
            ) =>
              maintenant.getFullYear() -
              5 +
              index
          ).map(
            (year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            )
          )}
        </select>

        {/* ORIGINE */}

        <select
          value={
            origineSelectionnee
          }
          onChange={(e) => {
            const nouvelleOrigine =
              e.target.value;

            setOrigineSelectionnee(
              nouvelleOrigine
            );

            setRecherche("");

            /*
             * IMPORTANT :
             * On ne supprime PAS les produits
             * des autres origines.
             *
             * Ils sont simplement cachés.
             */
          }}
          style={{
            ...selectStyle,
            minWidth:
              "230px"
          }}
        >
          <option value="">
            Sélectionner une origine
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

        {/* RECHERCHE */}

        <input
          type="text"
          placeholder={
            origineSelectionnee
              ? "Rechercher un produit..."
              : "Sélectionnez d'abord une origine"
          }
          value={
            recherche
          }
          disabled={
            !origineSelectionnee
          }
          onChange={(e) =>
            setRecherche(
              e.target.value
            )
          }
          style={{
            ...inputStyle,
            minWidth:
              "250px"
          }}
        />

        {/* ACTUALISER */}

        <button
          onClick={
            chargerInventaire
          }
          style={
            buttonPrimary
          }
        >
          Actualiser
        </button>
      </div>

      {/* ============================================
          RESULTATS RECHERCHE
      ============================================ */}

      {origineSelectionnee &&
        recherche.trim() !==
          "" && (
          <div
            style={{
              marginBottom:
                "20px",

              border:
                "1px solid #ddd",

              borderRadius:
                "8px",

              background:
                "white",

              overflow:
                "hidden"
            }}
          >
            <div
              style={{
                padding:
                  "12px",

                background:
                  "#f5f5f5",

                fontWeight:
                  "bold"
              }}
            >
              Résultats pour :
              {" "}
              "{recherche}"
            </div>

            {resultatsRecherche.length ===
            0 ? (
              <div
                style={{
                  padding:
                    "15px",

                  color:
                    "#777"
                }}
              >
                Aucun produit trouvé
                pour l'origine{" "}
                <strong>
                  {
                    origineSelectionnee
                  }
                </strong>
                .
              </div>
            ) : (
              resultatsRecherche.map(
                (
                  produit
                ) => (
                  <div
                    key={`${nettoyerNomProduit(
                      produit.nom
                    )}-${normaliserType(
                      produit.type
                    )}-${normaliserOrigine(
                      produit.origine
                    )}`}
                    onClick={() =>
                      ajouterProduitInventaire(
                        produit
                      )
                    }
                    style={{
                      padding:
                        "12px 15px",

                      borderTop:
                        "1px solid #eee",

                      cursor:
                        "pointer"
                    }}
                  >
                    <strong>
                      {nomAffichage(
                        produit
                      )}
                    </strong>

                    <span
                      style={{
                        marginLeft:
                          "10px",

                        color:
                          "#777"
                      }}
                    >
                      (
                      {normaliserType(
                        produit.type
                      ) ===
                      "medicament"
                        ? "Médicament"
                        : "Consommable"}
                      )
                    </span>
                  </div>
                )
              )
            )}
          </div>
        )}

      {/* ============================================
          ORIGINE SELECTIONNEE
      ============================================ */}

      {origineSelectionnee && (
        <div
          style={{
            padding:
              "12px 15px",

            marginBottom:
              "20px",

            background:
              "#e3f2fd",

            borderRadius:
              "8px",

            fontWeight:
              "bold"
          }}
        >
          Origine sélectionnée :
          {" "}
          {origineSelectionnee}
        </div>
      )}

      {/* ============================================
          MESSAGE
      ============================================ */}

      {message && (
        <div
          style={{
            padding:
              "12px",

            marginBottom:
              "20px",

            background:
              "#e8f5e9",

            borderRadius:
              "8px"
          }}
        >
          {message}
        </div>
      )}

      {/* ============================================
          RESUME
      ============================================ */}

      <div
        style={{
          display:
            "flex",

          gap:
            "15px",

          flexWrap:
            "wrap",

          marginBottom:
            "30px"
        }}
      >
        <div
          style={
            cardStyle
          }
        >
          <strong>
            Produits
          </strong>

          <div
            style={
              cardNumber
            }
          >
            {
              nombreProduits
            }
          </div>
        </div>

        <div
          style={
            cardStyle
          }
        >
          <strong>
            Comptés
          </strong>

          <div
            style={
              cardNumber
            }
          >
            {
              nombreComptes
            }
          </div>
        </div>

        <div
          style={
            cardStyle
          }
        >
          <strong>
            Écart total
          </strong>

          <div
            style={
              cardNumber
            }
          >
            {totalEcart >
            0
              ? `+${totalEcart}`
              : totalEcart}
          </div>
        </div>
      </div>

      {/* ============================================
          CHARGEMENT
      ============================================ */}

      {loading ? (
        <p>
          Chargement de l'inventaire...
        </p>
      ) : (
        <>
          {afficherTableau(
            "Médicaments",
            medicaments
          )}

          {afficherTableau(
            "Consommables",
            consommables
          )}

          {origineSelectionnee &&
            produitsOrigineSelectionnee.length ===
              0 &&
            !loading && (
              <div
                style={{
                  padding:
                    "35px",

                  textAlign:
                    "center",

                  background:
                    "#f5f5f5",

                  borderRadius:
                    "10px",

                  color:
                    "#666"
                }}
              >
                <strong>
                  Aucun produit sélectionné
                  pour cette origine
                </strong>

                <br />

                <span>
                  Recherchez un produit
                  de l'origine{" "}
                  <strong>
                    {
                      origineSelectionnee
                    }
                  </strong>
                  {" "}pour l'ajouter.
                </span>
              </div>
            )}

          {!origineSelectionnee &&
            !loading && (
              <div
                style={{
                  padding:
                    "35px",

                  textAlign:
                    "center",

                  background:
                    "#f5f5f5",

                  borderRadius:
                    "10px",

                  color:
                    "#666"
                }}
              >
                <strong>
                  Sélectionnez une origine
                </strong>

                <br />

                <span>
                  Choisissez une origine
                  avant de rechercher
                  et d'ajouter des produits.
                </span>
              </div>
            )}
        </>
      )}

      {/* ============================================
          BOUTONS
      ============================================ */}

      {origineSelectionnee &&
        produitsOrigineSelectionnee.length >
          0 && (
          <div
            style={{
              marginTop:
                "30px",

              paddingTop:
                "20px",

              borderTop:
                "1px solid #ddd",

              display:
                "flex",

              gap:
                "10px",

              flexWrap:
                "wrap"
            }}
          >
            <button
              onClick={
                enregistrer
              }
              disabled={
                saving
              }
              style={{
                ...buttonPrimary,

                padding:
                  "12px 25px",

                fontSize:
                  "16px"
              }}
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer l'inventaire"}
            </button>

            <button
              onClick={
                exporterPDF
              }
              style={{
                ...buttonPDF,

                padding:
                  "12px 25px",

                fontSize:
                  "16px"
              }}
            >
              📄 Exporter PDF
            </button>
          </div>
        )}
    </div>
  );
}

/* =====================================================
   STYLES
===================================================== */

const thStyle = {
  border:
    "1px solid #ddd",

  padding:
    "10px",

  background:
    "#f5f5f5",

  textAlign:
    "left"
};

const tdStyle = {
  border:
    "1px solid #ddd",

  padding:
    "10px"
};

const selectStyle = {
  padding:
    "9px 12px",

  border:
    "1px solid #ccc",

  borderRadius:
    "6px",

  background:
    "white"
};

const inputStyle = {
  padding:
    "9px 12px",

  border:
    "1px solid #ccc",

  borderRadius:
    "6px"
};

const buttonPrimary = {
  border:
    "none",

  borderRadius:
    "6px",

  padding:
    "9px 15px",

  cursor:
    "pointer",

  background:
    "#1976d2",

  color:
    "white"
};

const buttonPDF = {
  border:
    "none",

  borderRadius:
    "6px",

  padding:
    "9px 15px",

  cursor:
    "pointer",

  background:
    "#388e3c",

  color:
    "white"
};

const cardStyle = {
  padding:
    "15px 25px",

  border:
    "1px solid #ddd",

  borderRadius:
    "10px",

  minWidth:
    "140px"
};

const cardNumber = {
  fontSize:
    "24px",

  fontWeight:
    "bold",

  marginTop:
    "5px"
};

