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
      .where('creator_user_id', '=', userId)
      .select(db => db.fn.count<number>('organization_id').as('count'))
      .executeTakeFirstOrThrow();
    return Number(result.count);
  }

  doesUserHaveADefaultOrganization = async (userId: string) => {
    return await this.db.getDatabase()
      .selectFrom('app.organization')
      .where('creator_user_id', '=', userId)
      .where('default_user_organization', '=', true)
      .executeTakeFirst() !== undefined;
  };

  doesOrganizationSlugExist = async (orgSlug: string) => {
    return await this.db.getDatabase()
      .selectFrom('app.organization')
      .where('slug', '=', orgSlug)
      .executeTakeFirst() !== undefined;
  };

  createOrganization = async (creatorUserId: string, name: string, slug: string, description: string | undefined, defaultUserOrganization: boolean): Promise<Partial<Selectable<AppOrganization>>> => {
    return await this.db.getDatabase().transaction().execute(async tsx => {
      const organizationRecord = await this.insertOrganizationRecord(creatorUserId, name, slug, defaultUserOrganization, tsx, description);
      await Promise.all([
        this.insertUserAsOrganizationOwner(organizationRecord, tsx).then(orgMembershipRecord => {
          this.insertOrganizationMembershipHistoryRecord(organizationRecord, orgMembershipRecord, tsx);
        }),
        this.insertOrganizationNameHistoryRecord(organizationRecord, name, tsx),
        this.insertOrganizationSlugHistoryRecord(organizationRecord, slug, tsx),
        this.insertOrganizationDescriptionHistoryRecord(organizationRecord, description, tsx)
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
    description?: string
  ): Promise<Partial<Selectable<AppOrganization>>> {
    return await tsx
      .insertInto('app.organization')
      .values({
        creator_user_id: creatorUserId,
        name: name,
        slug: slug,
        description: description,
        default_user_organization: defaultOrg
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  private async insertUserAsOrganizationOwner(
    organizationRecord: Partial<Selectable<AppOrganization>>,
    tsx: Transaction<DB>
  ): Promise<Partial<Selectable<AppOrganizationMembership>>> {
    const ownerRole = await tsx
      .selectFrom('app.organization_member_role')
      .selectAll()
      .where('role', '=', 'OWNER')
      .executeTakeFirst();
    if (!ownerRole) {
      throw new Error('Owner organization member role not found');
    }

    if (!organizationRecord.organization_id) {
      throw new Error('Organization record must have an organization_id');
    }
    if (!organizationRecord.creator_user_id) {
      throw new Error('Organization record must have a creator_user_id');
    }

    return await tsx
      .insertInto('app.organization_membership')
      .values({
        fk_organization_organization_id: organizationRecord.organization_id,
        fk_organization_member_role_organization_member_role_id: ownerRole.organization_member_role_id,
        member_user_id: organizationRecord.creator_user_id
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  private async insertOrganizationNameHistoryRecord(
    organizationRecord: Partial<Selectable<AppOrganization>>,
    organizationName: string,
    tsx: Transaction<DB>
  ) {
    if (!organizationRecord.organization_id) {
      throw new Error('Organization record must have an organization_id');
    }
    if (!organizationRecord.creator_user_id) {
      throw new Error('Organization record must have a creator_user_id');
    }

    await tsx
      .insertInto('app.organization_name_history')
      .values({
        fk_organization_organization_id: organizationRecord.organization_id,
        initiator_user_id: organizationRecord.creator_user_id,
        name: organizationName
      })
      .execute();
  }

  private async insertOrganizationSlugHistoryRecord(
    organizationRecord: Partial<Selectable<AppOrganization>>,
    uniqueOrganizationSlug: string,
    tsx: Transaction<DB>
  ) {
    if (!organizationRecord.organization_id) {
      throw new Error('Organization record must have an organization_id');
    }
    if (!organizationRecord.creator_user_id) {
      throw new Error('Organization record must have a creator_user_id');
    }

    await tsx
      .insertInto('app.organization_slug_history')
      .values({
        fk_organization_organization_id: organizationRecord.organization_id,
        initiator_user_id: organizationRecord.creator_user_id,
        slug: uniqueOrganizationSlug
      })
      .execute();
  }

  private async insertOrganizationDescriptionHistoryRecord(
    organizationRecord: Partial<Selectable<AppOrganization>>,
    description: string | undefined,
    tsx: Transaction<DB>
  ) {
    if (!organizationRecord.organization_id) {
      throw new Error('Organization record must have an organization_id');
    }
    if (!organizationRecord.creator_user_id) {
      throw new Error('Organization record must have a creator_user_id');
    }

    await tsx
      .insertInto('app.organization_description_history')
      .values({
        fk_organization_organization_id: organizationRecord.organization_id,
        initiator_user_id: organizationRecord.creator_user_id,
        description: description
      })
      .execute();
  }

  private async insertOrganizationMembershipHistoryRecord(
    organizationRecord: Partial<Selectable<AppOrganization>>,
    organizationMembershipRecord: Partial<Selectable<AppOrganizationMembership>>,
    tsx: Transaction<DB>
  ) {
    if (!organizationRecord.organization_id) {
      throw new Error('Organization record must have an organization_id');
    }
    if (!organizationRecord.creator_user_id) {
      throw new Error('Organization record must have a creator_user_id');
    }
    if (!organizationMembershipRecord.fk_organization_organization_id) {
      throw new Error('Organization membership record must have a fk_organization_organization_id');
    }
    if (!organizationMembershipRecord.fk_organization_member_role_organization_member_role_id) {
      throw new Error('Organization membership record must have a fk_organization_member_role_organization_member_role_id');
    }

    await tsx
      .insertInto('app.organization_membership_history')
      .values({
        fk_organization_organization_id: organizationMembershipRecord.fk_organization_organization_id,
        fk_organization_member_role_organization_member_role_id: organizationMembershipRecord.fk_organization_member_role_organization_member_role_id,
        member_user_id: organizationRecord.creator_user_id,
        initiator_user_id: organizationRecord.creator_user_id
      })
      .execute();
  }
}

export { OrganizationRepository };
