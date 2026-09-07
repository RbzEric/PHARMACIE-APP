import { useState } from "react";
import { genererRapport } from "../services/rapportService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================
   NORMALISATION ORIGINE
========================= */
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

/* =========================
   TABLEAU RAPPORT
========================= */
function TableauRapport({ titre, data }) {
  return (
    <div className="card">
      <h3>{titre}</h3>

      <table>
        <thead>
          <tr>
            <th>N°</th>
            <th>Produit</th>
            <th>Lot</th>
            <th>Expiration</th>
            <th>Prix Unitaire (Ar)</th>
            <th>Stock début</th>
            <th>Valeur début</th>
            <th>Entrée</th>
            <th>Valeur entrée</th>
            <th>Sortie</th>
            <th>Valeur sortie</th>
            <th>Stock fin</th>
            <th>Valeur stock fin</th>
            <th>CMM</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan="14"
                style={{
                  textAlign: "center",
                  padding: "15px"
                }}
              >
                Aucun produit
              </td>
            </tr>
          ) : (
            data.map((p, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{p.nom}</td>
                <td>{p.lot}</td>
                <td>{p.expiration}</td>
                <td>{p.prix}</td>
                <td>{p.stockDebut}</td>
                <td>{p.valeurDebut}</td>
                <td>{p.entree}</td>
                <td>{p.valeurEntree}</td>
                <td>{p.sortie}</td>
                <td>{p.valeurSortie}</td>
                <td>{p.stockFin}</td>
                <td>{p.valeurStock}</td>
                <td>{p.cmm}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================
   COMPOSANT PRINCIPAL
========================= */
export default function Rapport() {
  const [data, setData] = useState([]);

  const [mois, setMois] = useState(
    new Date().getMonth()
  );

  const [annee, setAnnee] = useState(
    new Date().getFullYear()
  );

  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [fs, setFs] = useState("");

  const [origineSelectionnee, setOrigineSelectionnee] =
    useState("tous");

  /* =========================
     MOIS
  ========================= */
  const nomsMois = [
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

  /* =========================
     GENERER RAPPORT
  ========================= */
  async function generer() {
    try {
      const resultat = await genererRapport(
        Number(mois),
        Number(annee)
      );

      console.log(
        "RESULTAT RAPPORT :",
        resultat
      );

      setData(resultat);

      /*
       * Si l'origine actuellement sélectionnée
       * n'existe plus dans les nouvelles données,
       * on revient automatiquement sur "tous".
       */
      if (
        origineSelectionnee !== "tous" &&
        !resultat.some(
          (p) =>
            normaliserOrigine(p.origine) ===
            normaliserOrigine(origineSelectionnee)
        )
      ) {
        setOrigineSelectionnee("tous");
      }
    } catch (error) {
      console.error(
        "Erreur génération rapport :",
        error
      );

      alert(
        "Une erreur est survenue lors de la génération du rapport."
      );
    }
  }

  /* =========================
     ORIGINES AUTOMATIQUES
  =========================
  
  Les origines sont récupérées directement
  depuis les données du rapport.

  Exemple :
  FANOME
  FOND D'URGENCE
  BUDGET DE L'ÉTAT
  DON
  PROJET
  PARTENAIRE

  Si une nouvelle origine est ajoutée dans
  la base de données, elle apparaîtra
  automatiquement ici.
  ========================= */
  const originesDisponibles = Array.from(
    new Set(
      data
        .map((p) =>
          normaliserOrigine(p.origine)
        )
        .filter(Boolean)
    )
  ).sort((a, b) =>
    a.localeCompare(b, "fr")
  );

  /* =========================
     FILTRE ORIGINE
  ========================= */
  const dataFiltre =
    origineSelectionnee === "tous"
      ? data
      : data.filter((p) => {
          const origineProduit =
            normaliserOrigine(p.origine);

          const origineChoisie =
            normaliserOrigine(
              origineSelectionnee
            );

          return (
            origineProduit ===
            origineChoisie
          );
        });

  /* =========================
     FILTRE TYPE
  ========================= */
  const medicaments =
    dataFiltre.filter(
      (p) =>
        String(p.type || "")
          .trim()
          .toLowerCase() ===
        "medicament"
    );

  const consommables =
    dataFiltre.filter(
      (p) =>
        String(p.type || "")
          .trim()
          .toLowerCase() ===
        "consommable"
    );

  /* =========================
     TITRE RAPPORT
  ========================= */
  const titreRapport =
    origineSelectionnee === "tous"
      ? "RAPPORT MENSUEL PHARMACIE"
      : `RAPPORT MENSUEL PHARMACIE - ${origineSelectionnee}`;

  /* =========================
     EXPORT PDF
  ========================= */
  function exporterPDF() {
    if (dataFiltre.length === 0) {
      alert(
        "Aucun produit à exporter pour cette origine."
      );
      return;
    }

    const doc = new jsPDF("landscape");

    /* =========================
       TITRE
    ========================= */
    doc.setFontSize(14);

    doc.text(
      titreRapport,
      doc.internal.pageSize.getWidth() / 2,
      15,
      {
        align: "center"
      }
    );

    /* =========================
       INFORMATIONS
    ========================= */
    doc.setFontSize(10);

    doc.text(
      `Région : ${region}`,
      14,
      25
    );

    doc.text(
      `District : ${district}`,
      14,
      30
    );

    doc.text(
      `FS : ${fs}`,
      14,
      35
    );

    doc.text(
      `Mois : ${
        nomsMois[Number(mois)]
      } ${annee}`,
      14,
      40
    );

    /* =========================
       TABLE MEDICAMENTS
    ========================= */
    let positionY = 45;

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");

    doc.text(
      "MÉDICAMENTS",
      doc.internal.pageSize.getWidth() / 2,
      positionY,
      {
        align: "center"
      }
    );

    doc.setFont(undefined, "normal");

    autoTable(doc, {
      startY: positionY + 5,

      head: [
        [
          "N°",
          "Produit",
          "Lot",
          "Exp",
          "Prix unitaire",
          "Stock Début",
          "Valeur début",
          "Entrée",
          "Valeur entrée",
          "Sortie",
          "Valeur sortie",
          "Stock Fin",
          "Valeur stock fin",
          "CMM"
        ]
      ],

      body: medicaments.map(
        (p, i) => [
          i + 1,
          p.nom,
          p.lot,
          p.expiration,
          p.prix,
          p.stockDebut,
          p.valeurDebut,
          p.entree,
          p.valeurEntree,
          p.sortie,
          p.valeurSortie,
          p.stockFin,
          p.valeurStock,
          p.cmm
        ]
      ),

      theme: "grid",

      styles: {
        halign: "center",
        valign: "middle",
        lineWidth: 0.2,
        lineColor: [
          0,
          0,
          0
        ]
      },

      headStyles: {
        halign: "center",
        valign: "middle",
        lineWidth: 0.3,
        lineColor: [
          0,
          0,
          0
        ]
      }
    });

    const finMedicaments =
      doc.lastAutoTable
        ? doc.lastAutoTable.finalY
        : positionY + 10;

    /* =========================
       TABLE CONSOMMABLES
    ========================= */
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");

    doc.text(
      "CONSOMMABLES",
      doc.internal.pageSize.getWidth() / 2,
      finMedicaments + 7,
      {
        align: "center"
      }
    );

    doc.setFont(undefined, "normal");

    autoTable(doc, {
      startY: finMedicaments + 10,

      head: [
        [
          "N°",
          "Produit",
          "Lot",
          "Exp",
          "Prix unitaire",
          "Stock Début",
          "Valeur début",
          "Entrée",
          "Valeur entrée",
          "Sortie",
          "Valeur sortie",
          "Stock Fin",
          "Valeur stock fin",
          "CMM"
        ]
      ],

      body: consommables.map(
        (p, i) => [
          i + 1,
          p.nom,
          p.lot,
          p.expiration,
          p.prix,
          p.stockDebut,
          p.valeurDebut,
          p.entree,
          p.valeurEntree,
          p.sortie,
          p.valeurSortie,
          p.stockFin,
          p.valeurStock,
          p.cmm
        ]
      ),

      theme: "grid",

      styles: {
        halign: "center",
        valign: "middle",
        lineWidth: 0.2,
        lineColor: [
          0,
          0,
          0
        ]
      },

      headStyles: {
        halign: "center",
        valign: "middle",
        lineWidth: 0.3,
        lineColor: [
          0,
          0,
          0
        ]
      }
    });

    /* =========================
       NOM DU FICHIER
    ========================= */
    const origineNom =
      origineSelectionnee === "tous"
        ? "tous"
        : origineSelectionnee
            .replace(
              /[^a-zA-Z0-9]+/g,
              "-"
            )
            .toLowerCase();

    doc.save(
      `rapport-pharmacie-${origineNom}-${nomsMois[Number(mois)]}-${annee}.pdf`
    );
  }

  /* =========================
     AFFICHAGE
  ========================= */
  return (
    <div className="rapport-container">

      {/* =========================
          HEADER
      ========================= */}
      <div className="rapport-header">

        <div className="info">

          <div className="field">
            <label>Région</label>

            <input
              value={region}
              onChange={(e) =>
                setRegion(e.target.value)
              }
            />
          </div>

          <div className="field">
            <label>District</label>

            <input
              value={district}
              onChange={(e) =>
                setDistrict(e.target.value)
              }
            />
          </div>

          <div className="field">
            <label>FS</label>

            <input
              value={fs}
              onChange={(e) =>
                setFs(e.target.value)
              }
            />
          </div>

        </div>

        <h2>
          {titreRapport}
        </h2>

        <p>
          Mois :{" "}
          {nomsMois[Number(mois)]}{" "}
          {annee}
        </p>

        <p>
          Date :{" "}
          {new Date().toLocaleDateString()}
        </p>

      </div>

      {/* =========================
          CONTROLES
      ========================= */}
      <div className="card">

        {/* MOIS */}
        <select
          value={mois}
          onChange={(e) =>
            setMois(e.target.value)
          }
        >
          <option value="0">
            Janvier
          </option>

          <option value="1">
            Février
          </option>

          <option value="2">
            Mars
          </option>

          <option value="3">
            Avril
          </option>

          <option value="4">
            Mai
          </option>

          <option value="5">
            Juin
          </option>

          <option value="6">
            Juillet
          </option>

          <option value="7">
            Août
          </option>

          <option value="8">
            Septembre
          </option>

          <option value="9">
            Octobre
          </option>

          <option value="10">
            Novembre
          </option>

          <option value="11">
            Décembre
          </option>
        </select>

        {/* ANNEE */}
        <input
          type="number"
          value={annee}
          onChange={(e) =>
            setAnnee(e.target.value)
          }
        />

        {/* =========================
            ORIGINE AUTOMATIQUE
        ========================= */}
        <select
          value={origineSelectionnee}
          onChange={(e) =>
            setOrigineSelectionnee(
              e.target.value
            )
          }
          style={{
            minWidth: "220px",
            padding: "8px",
            marginLeft: "10px"
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

        {/* GENERER */}
        <button onClick={generer}>
          Générer
        </button>

        {/* PDF */}
        <button
          onClick={exporterPDF}
        >
          Exporter PDF
        </button>

      </div>

      {/* =========================
          INFORMATION FILTRE
      ========================= */}
      {origineSelectionnee !==
        "tous" && (
        <div
          className="card"
          style={{
            marginTop: "10px",
            fontWeight: "bold"
          }}
        >
          Origine sélectionnée :{" "}
          {origineSelectionnee}
          {" — "}
          {dataFiltre.length}{" "}
          produit(s)
        </div>
      )}

      {/* =========================
          TABLE MEDICAMENTS
      ========================= */}
      <TableauRapport
        titre="Médicaments"
        data={medicaments}
      />

      {/* =========================
          TABLE CONSOMMABLES
      ========================= */}
      <TableauRapport
        titre="Consommables"
        data={consommables}
      />

    </div>
  );
}