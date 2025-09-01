import { Selectable, Transaction } from 'kysely';
import { Database } from '../../db';
import { AppOrganization, AppOrganizationMembership, DB } from '../../generated/db/db';

class OrganizationRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  getNumberOfUserOwnedOrganizations = async (userId: string) => {
    const result = await this.db.getDatabase()
      .selectFrom('app.organization')
      .where('creatorUserId', '=', userId)
      .select(db => db.fn.count<number>('organizationId').as('count'))
      .executeTakeFirstOrThrow();
    return Number(result.count);
  }

  doesUserHaveADefaultOrganization = async (userId: string) => {
    return await this.db.getDatabase()
      .selectFrom('app.organization')
      .where('creatorUserId', '=', userId)
      .where('defaultUserOrganization', '=', true)
      .executeTakeFirst() !== undefined;
  };

  doesOrganizationSlugExist = async (slug: string) => {
    return await this.db.getDatabase()
      .selectFrom('app.organization')
      .where('slug', '=', slug)
      .executeTakeFirst() !== undefined;
  };

  createOrganization = async (creatorUserId: string, name: string, slug: string, defaultUserOrganization: boolean): Promise<Partial<Selectable<AppOrganization>>> => {
    return await this.db.getDatabase().transaction().execute(async tsx => {
      const organizationRecord = await this.insertOrganizationRecord(creatorUserId, name, slug, defaultUserOrganization, tsx);
      await Promise.all([
        this.insertOrganizationNameHistoryRecord(organizationRecord.organizationId, creatorUserId, name, tsx),
        this.insertUserAsOrganizationOwner(organizationRecord.organizationId, creatorUserId, tsx),
        this.insertOrganizationMembershipHistoryRecord(organizationRecord.organizationId, creatorUserId, creatorUserId, tsx),
        this.insertOrganizationSlugHistoryRecord(organizationRecord.organizationId, creatorUserId, slug, tsx),
      ]);
      return organizationRecord;
    });
  };

  private async insertOrganizationRecord(
    creatorUserId: string,
    name: string,
    slug: string,
    defaultOrg: boolean,
    tsx: Transaction<DB>,
  ): Promise<Selectable<AppOrganization>> {
    return await tsx
      .insertInto('app.organization')
      .values({
        creatorUserId: creatorUserId,
        name: name,
        slug: slug,
        defaultUserOrganization: defaultOrg
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  private async insertOrganizationNameHistoryRecord(
    organizationId: string,
    initiatorUserId: string,
    name: string,
    tsx: Transaction<DB>
  ) {
    await tsx
      .insertInto('app.organizationNameHistory')
      .values({
        fkOrganizationOrganizationId: organizationId,
        initiatorUserId: initiatorUserId,
        name: name,
      })
      .execute();
  }

  private async insertUserAsOrganizationOwner(
    organizationId: string,
    memberUserId: string,
    tsx: Transaction<DB>
  ): Promise<Partial<Selectable<AppOrganizationMembership>>> {
    const ownerRoleId = await this.getOwnerRoleId(tsx);

    return await tsx
      .insertInto('app.organizationMembership')
      .values({
        fkOrganizationOrganizationId: organizationId,
        fkOrganizationMemberRoleOrganizationMemberRoleId: ownerRoleId,
        memberUserId: memberUserId
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // TODO: Add role parameter
  private async insertOrganizationMembershipHistoryRecord(
    organizationId: string,
    memberUserId: string,
    initiatorUserId: string,
    tsx: Transaction<DB>
  ) {
    const ownerRoleId = await this.getOwnerRoleId(tsx);

    await tsx
      .insertInto('app.organizationMembershipHistory')
      .values({
        fkOrganizationOrganizationId: organizationId,
        fkOrganizationMemberRoleOrganizationMemberRoleId: ownerRoleId,
        memberUserId: memberUserId,
        initiatorUserId: initiatorUserId,
      })
      .execute();
  }

  private getOwnerRoleId = async (tsx: Transaction<DB>) => {
    const ownerRole = await tsx
      .selectFrom('app.organizationMemberRole')
      .selectAll()
      .where('role', '=', 'OWNER')
      .executeTakeFirst();
    if (!ownerRole) {
      throw new Error('Owner organization member role not found');
    }
    return ownerRole.organizationMemberRoleId;
  }

  private async insertOrganizationSlugHistoryRecord(
    organizationId: string,
    initiatorUserId: string,
    slug: string,
    tsx: Transaction<DB>
  ) {
    await tsx
      .insertInto('app.organizationSlugHistory')
      .values({
        fkOrganizationOrganizationId: organizationId,
        initiatorUserId: initiatorUserId,
        slug: slug
      })
      .execute();
  }

  getOrganizationById = async (organizationId: string): Promise<Selectable<AppOrganization> | undefined> => {
    return await this.db.getDatabase()
      .selectFrom('app.organization')
      .where('organizationId', '=', organizationId)
      .selectAll()
      .executeTakeFirst();
  };
}

export { OrganizationRepository };
