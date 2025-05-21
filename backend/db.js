import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

// Configure lowdb to write to JSONFile
const adapter = new JSONFile('db.json')
const db = new Low(adapter)

// Set default data if database file doesn't exist
await db.read()
db.data ||= { users: [] }
await db.write()

// Export the db instance
export default db
