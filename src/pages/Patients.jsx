import { useState } from "react";
import { sortirProduit } from "../services/stockService";

function Patients() {

  const [nom, setNom] = useState("");
  const [produits, setProduits] = useState([
    { nom: "", quantite: 0, prix: 0 }
  ]);

  // ajout ligne produit
  const ajouterLigne = () => {
    setProduits([...produits, { nom: "", quantite: 0, prix: 0 }]);
  };

  // modification ligne
  const handleChange = (index, field, value) => {
    const newData = [...produits];
    newData[index][field] = value;
    setProduits(newData);
  };

  // calcul total
  const total = produits.reduce((sum, p) => {
    return sum + p.quantite * p.prix;
  }, 0);

  // ENREGISTRER VENTE
  const handleSubmit = () => {

    produits.forEach(p => {
      if (p.nom && p.quantite > 0) {
        sortirProduit(p.nom, p.quantite); // 🔥 MAJ STOCK
      }
    });

    alert("Vente enregistrée + stock mis à jour");

    setNom("");
    setProduits([{ nom: "", quantite: 0, prix: 0 }]);
  };

  return (
    <div>

      <h2>Ajout patient</h2>

      <input
        placeholder="Nom patient"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
      />

      <table border="1" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Nom produit</th>
            <th>Quantité</th>
            <th>Prix</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>

          {produits.map((p, i) => (
            <tr key={i}>

              <td>
                <input
                  value={p.nom}
                  onChange={(e) =>
                    handleChange(i, "nom", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  onChange={(e) =>
                    handleChange(i, "quantite", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  onChange={(e) =>
                    handleChange(i, "prix", e.target.value)
                  }
                />
              </td>

              <td>{p.quantite * p.prix}</td>

            </tr>
          ))}

        </tbody>

      </table>

      <button onClick={ajouterLigne}>
        + Ajouter ligne
      </button>

      <h3>Total : {total}</h3>

      <button onClick={handleSubmit}>
        Valider vente
      </button>

    </div>
  );
}

export default Patients;