import initSqlJs from "sql.js";

let db = null;
let dbReady = null;


function saveDatabase(){

const data = db.export();

const array = Array.from(data);

localStorage.setItem(
"pharmacie-db",
JSON.stringify(array)
);

}



export function initDB(){

if(!dbReady){

dbReady = initSqlJs({

 locateFile: file => {
  return new URL(`./${file}`, window.location.href).href;
}
})

.then(SQL=>{


const saved = localStorage.getItem(
"pharmacie-db"
);


if(saved){

const binary = new Uint8Array(
JSON.parse(saved)
);

db = new SQL.Database(binary);


}else{

db = new SQL.Database();


db.run(`

CREATE TABLE IF NOT EXISTS produits (

id INTEGER PRIMARY KEY AUTOINCREMENT,

nom TEXT,

quantite INTEGER,

prix REAL,

lot TEXT,

date_expiration TEXT,

type TEXT

);


CREATE TABLE IF NOT EXISTS mouvements (

id INTEGER PRIMARY KEY AUTOINCREMENT,

nom TEXT,

date TEXT,

entree INTEGER,

sortie INTEGER,

observation TEXT

);

`);

saveDatabase();

}


console.log("DB OK");


});

}


return dbReady;

}



export async function getProduits(){

await initDB();

const res = db.exec(
"SELECT * FROM produits"
);

if(res.length === 0) return [];

return res[0].values.map(row=>({

id: row[0],
nom: row[1],
quantite: row[2],
prix: Number(row[3] || 0),
lot: row[4],
date_expiration: row[5],
type: row[6] || "medicament"

}));

}




export async function ajouterProduit(p){

await initDB();

db.run(
`
INSERT INTO produits
(nom, quantite, prix, lot, date_expiration, type)
VALUES (?, ?, ?, ?, ?, ?)
`,
[
p.nom,
Number(p.quantite),
Number(p.prix),
p.lot,
p.date_expiration,
p.type
]

);

saveDatabase();

}




export async function ajouterMouvement(m){

await initDB();


db.run(

`
INSERT INTO mouvements
(
nom,
date,
entree,
sortie,
observation
)

VALUES(?,?,?,?,?)

`
,

[

m.nom,
m.date,
Number(m.entree),
Number(m.sortie),
m.observation || ""

]

);

saveDatabase();

}





export async function getMouvements(){

await initDB();


const res=db.exec(
"SELECT * FROM mouvements"
);


if(res.length===0)
return [];


return res[0].values.map(row=>({

id:row[0],
nom:row[1],
date:row[2],
entree:Number(row[3]),
sortie:Number(row[4]),
observation:row[5]

}));

}