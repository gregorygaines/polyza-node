import { Database } from '../../db';

class TeamRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;

    console.log('TeamRepository initialized with db:', this.db);
  }

}

export { TeamRepository };
