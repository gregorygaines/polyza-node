import { Database } from '../db';

class OrganizationRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  doesUserHaveADefaultOrganization(userId: string): boolean {
    const defaultUserOrganization = this.db.getDatabase().selectFrom('app.organization')
      .where('creator_user_id', '=', userId)
      .where('default_user_organization', '=', true)
      .executeTakeFirst();
    return defaultUserOrganization !== null;
  }


}

export { OrganizationRepository };
