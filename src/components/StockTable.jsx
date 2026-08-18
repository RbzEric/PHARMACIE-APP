export default function StockTable({data}){


    let stock=0;
    
    
    
    return (
    
    <table>
    
    
    <thead>
    
    <tr>
    
    <th>Date</th>
    <th>Produit</th>
    <th>Lot</th>
    <th>Expiration</th>
    <th>Entrée</th>
    <th>Sortie</th>
    <th>Stock</th>
    <th>Observation</th>
    
    
    </tr>
    
    </thead>
    
    
    <tbody>
    
    
    {
    
    data.map((m,i)=>{
    
    
    stock += Number(m.entree || 0);
    
    stock -= Number(m.sortie || 0);
    
    
    
    return (
    
    <tr key={i}>
    
    
    <td>
    {m.date}
    </td>
    
    
    <td>
    {m.nom}
    </td>
    
    
    <td>
    {m.lot}
    </td>
    
    
    <td>
    {m.expiration}
    </td>
    
    
    <td>
    {m.entree}
    </td>
    
    
    <td>
    {m.sortie}
    </td>
    
    
    <td>
    {stock}
    </td>
    
    
    <td>
    {m.observation}
    </td>
    
    
    </tr>
    
    
    );
    
    
    })
    
    
    }
    
    
    </tbody>
    
    
    </table>
    
    
    );
    
    
    }