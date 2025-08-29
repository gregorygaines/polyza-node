import { config } from "./config";
import type { DB } from './generated/db/db';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

class Database {
  private static instance: Kysely<DB>;

  public getDatabase(): Kysely<DB> {
    if (!Database.instance) {
      Database.instance = new Kysely<DB>({
        dialect: new PostgresDialect({
          pool: new Pool({
            connectionString: config.databaseUrl
          })
        })
      });
    }
    return Database.instance;
  }
}

export { Database };
