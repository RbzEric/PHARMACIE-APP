import { useState } from "react";
import { genererRapport } from "../services/rapportService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================
   TABLEAU COMPONENT
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
          {data.map((p, i) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
export default function Rapport() {
  const [data, setData] = useState([]);

  const [mois, setMois] = useState(new Date().getMonth());
  const [annee, setAnnee] = useState(new Date().getFullYear());

  // EN-TÊTE
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [fs, setFs] = useState("");

  /* =========================
     GENERER RAPPORT
  ========================= */
  async function generer() {
    const resultat = await genererRapport(
      Number(mois),
      Number(annee)
    );
    setData(resultat);
  }

  const medicaments = data.filter(p => p.type === "medicament");
  const consommables = data.filter(p => p.type === "consommable");

  /* =========================
     EXPORT PDF
  ========================= */
  function exporterPDF() {
    const doc = new jsPDF("landscape");

    // TITRE
    doc.setFontSize(14);
    doc.text(
      "RAPPORT MENSUEL PHARMACIE",
      doc.internal.pageSize.getWidth() / 2,
      15,
      { align: "center" }
    );

    // EN-TÊTE

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

    doc.setFontSize(10);
    doc.text(`Région : ${region}`, 14, 25);
    doc.text(`District : ${district}`, 14, 30);
    doc.text(`FS : ${fs}`, 14, 35);
   doc.text(
  `Mois : ${nomsMois[Number(mois)]} ${annee}`,
  14,
  40
);

    // MEDICAMENTS
    doc.setFontSize(11);
doc.setFont(undefined, "bold");

doc.text(
  "MÉDICAMENTS",
  doc.internal.pageSize.getWidth() / 2,
  40,
  { align: "center" }
);

doc.setFont(undefined, "normal");
    autoTable(doc, {
      startY: 45,

      head: [[
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
        "Valeur sortie"
,       "Stock Fin",
        "Valeur stock fin",
        "CMM"
      ]],
      body: medicaments.map((p, i) => [
        i+1,p.nom,p.lot,p.expiration,p.prix,
        p.stockDebut,p.valeurDebut,p.entree,p.valeurEntree,p.sortie,p.valeurSortie,p.stockFin
        ,p.valeurStock,p.cmm
      ]),

       theme: "grid",

  styles: {
    halign: "center",
    valign: "middle",
    lineWidth: 0.2,
    lineColor: [0, 0, 0]
  },

  headStyles: {
    halign: "center",
    valign: "middle",
    lineWidth: 0.3,
    lineColor: [0, 0, 0]
  }
    });

    // CONSOMMABLES
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");

    doc.text(
  "CONSOMMABLES",
  doc.internal.pageSize.getWidth() / 2,
  doc.lastAutoTable.finalY + 7,
  { align: "center" }
);

doc.setFont(undefined, "normal");
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [[
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
        "Valeur sortie"
,       "Stock Fin",
        "Valeur stock fin",
        "CMM"
      ]],
      body: consommables.map((p, i) => [
        i+1,p.nom,p.lot,p.expiration,p.prix,
        p.stockDebut,p.valeurDebut,p.entree,p.valeurEntree,p.sortie,p.valeurSortie,p.stockFin,
        p.valeurStock,p.cmm
      ]),

       theme: "grid",

  styles: {
    halign: "center",
    valign: "middle",
    lineWidth: 0.2,
    lineColor: [0, 0, 0]
  },

  headStyles: {
    halign: "center",
    valign: "middle",
    lineWidth: 0.3,
    lineColor: [0, 0, 0]
  }
    });

    doc.save("rapport-pharmacie.pdf");
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="rapport-container">

      {/* EN-TÊTE */}
      <div className="rapport-header">

        <div className="info">

          <div className="field">
            <label>Région</label>
            <input
              value={region}
              onChange={e => setRegion(e.target.value)}
            />
          </div>

          <div className="field">
            <label>District</label>
            <input
              value={district}
              onChange={e => setDistrict(e.target.value)}
            />
          </div>

          <div className="field">
            <label>FS</label>
            <input
              value={fs}
              onChange={e => setFs(e.target.value)}
            />
          </div>

        </div>

        <h2>RAPPORT MENSUEL PHARMACIE</h2>

       <p>
  Mois : {
    [
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
    ][Number(mois)]
  } {annee}
</p>
        <p>Date : {new Date().toLocaleDateString()}</p>

      </div>

      {/* FILTRE */}
        <div className="card">
            <select
    value={mois}
    onChange={e => setMois(e.target.value)}
    >
    <option value="0">Janvier</option>
    <option value="1">Février</option>
    <option value="2">Mars</option>
    <option value="3">Avril</option>
    <option value="4">Mai</option>
    <option value="5">Juin</option>
    <option value="6">Juillet</option>
    <option value="7">Août</option>
    <option value="8">Septembre</option>
    <option value="9">Octobre</option>
    <option value="10">Novembre</option>
    <option value="11">Décembre</option>
    </select>

        <input
          type="number"
          value={annee}
          onChange={e => setAnnee(e.target.value)}
        />

        <button onClick={generer}>Générer</button>
        <button onClick={exporterPDF}>Exporter PDF</button>
      </div>

      {/* TABLEAUX */}
      <TableauRapport
        titre="Médicaments"
        data={medicaments}
      />

      <TableauRapport
        titre="Consommables"
        data={consommables}
      />

    </div>
  );
}