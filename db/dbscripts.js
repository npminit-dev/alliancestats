import Database from 'better-sqlite3'

export const db = new Database('corps.sqlite', { verbose: console.log });

db.pragma('journal_mode = WAL');

db.prepare(`
  CREATE TABLE IF NOT EXISTS corporations (
      corpid INTEGER PRIMARY KEY AUTOINCREMENT, -- ID único autoincremental
      corpname TEXT UNIQUE NOT NULL,            -- Nombre único para cada registro
      corplevel INTEGER NOT NULL CHECK(corplevel BETWEEN 1 AND 21), -- Nivel de corporación (1-21)
      corpbonus INTEGER NOT NULL CHECK(corpbonus BETWEEN 0 AND 1000), -- Porcentaje de bonus (0-1000)
      fslevel INTEGER NOT NULL CHECK(fslevel BETWEEN 1 AND 20), -- Nivel FS (1-20)
      ws BOOLEAN NOT NULL,                      -- White Star (booleano)
      rs BOOLEAN NOT NULL,                      -- Red Star (booleano)
      member_count INTEGER NOT NULL CHECK(member_count BETWEEN 0 AND 40), -- Miembros (0-40)
      open_closed TEXT NOT NULL CHECK(open_closed IN ('open', 'closed')), -- Estado abierto/cerrado
      event_score INTEGER NOT NULL              -- Puntuación del evento
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS server_configs (
    server_id TEXT UNIQUE PRIMARY KEY,
    admin_role_id TEXT
  );
`).run()

  

// Función para agregar registros de prueba
function addTestCorporations() {
  const insert = db.prepare(`
      INSERT OR IGNORE INTO corporations (
          corpname, corplevel, corpbonus, fslevel, ws, rs, member_count, open_closed, event_score
      ) VALUES (
          @corpname, @corplevel, @corpbonus, @fslevel, @ws, @rs, @member_count, @open_closed, @event_score
      )
  `);

  const testCorporations = [
    {
      corpname: "Star Alliance",
      corplevel: 10,
      corpbonus: 250,
      fslevel: 15,
      ws: 1,
      rs: 0,
      member_count: 30,
      open_closed: "open",
      event_score: 1200
    },
    {
      corpname: "Cosmic Order",
      corplevel: 21,
      corpbonus: 800,
      fslevel: 20,
      ws: 1,
      rs: 1,
      member_count: 40,
      open_closed: "closed",
      event_score: 2000
    },
    {
      corpname: "Galactic Vanguard",
      corplevel: 5,
      corpbonus: 100,
      fslevel: 7,
      ws: 0,
      rs: 1,
      member_count: 15,
      open_closed: "open",
      event_score: 500
    }
  ];

  testCorporations.forEach(corp => insert.run(corp));
  console.log("Registros de prueba agregados (se omitieron los duplicados).");
}

function addTestRole() {
  db.prepare(`
    INSERT OR IGNORE INTO server_configs (server_id, admin_role_id) VALUES ('1204107342682263582', '1317175731201114172')
  `).run()
  console.log('Se agregaron servidor y rol de pruebas')
}

if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
  // Llamar a la función para agregar los registros
  addTestCorporations();
  // addTestRole()
}
