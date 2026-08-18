const DB_NAME = "pharmacieDB";


const initialData = {
  produits: [],
  mouvements: [],
  patients: []
};


// Lire base

export function getDB(){

  const data = localStorage.getItem(DB_NAME);


  if(!data){

    localStorage.setItem(
      DB_NAME,
      JSON.stringify(initialData)
    );

    return initialData;

  }


  return JSON.parse(data);

}



// Sauvegarder base

export function saveDB(data){

  localStorage.setItem(
    DB_NAME,
    JSON.stringify(data)
  );

}



// Reset (test)

export function resetDB(){

  localStorage.removeItem(DB_NAME);

}