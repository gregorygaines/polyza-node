import express from 'express';
import { Kysely, PostgresDialect, Selectable } from 'kysely';
import type { AppOrganization, AppOrganizationMembership, DB } from './types/db';
import { Pool } from 'pg';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;3

const app = express();
app.use(express.json())

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: 'postgresql://gitea:gitea_password@localhost:5432/organization?schema=app'
    })
  })
});

interface CreateOrganizationRequest {
  userId: string;
  name?: string;
  description?: string;
}

interface CreateOrganizationResponse {
  id: string;
}

const MAX_ATTEMPTS_TO_APPEND_UNIQUE_ID_TO_ORGANIZATION_SLUG = 10;
const MAX_ORGANIZATION_NAME_LENGTH = 32;
const ORGANIZATION_MEMBER_ROLE_OWNER_ENUM = 'OWNER';

// Utility: Slugify
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8);
}

async function doesUserHaveADefaultOrganization(request: CreateOrganizationRequest): Promise<boolean> {
  const result = await db
    .selectFrom('app.organization')
    .select(['app.organization.organization_id'])
    .where('default_user_organization', '=', true)
    .where('creator_user_id', '=', request.userId)
    .executeTakeFirst();
  return !!result;
}

async function doesOrganizationSlugExist(slug: string): Promise<boolean> {
  const result = await db
    .selectFrom('app.organization_slug_history')
    .select(['app.organization_slug_history.organization_slug_history_id'])
    .where('slug', '=', slug)
    .executeTakeFirst();
  return !!result;
}

function createOrganizationName(orgName: string): string {
  if (orgName.length > MAX_ORGANIZATION_NAME_LENGTH) {
    const excessLength = orgName.length - MAX_ORGANIZATION_NAME_LENGTH;
    return orgName.substring(0, orgName.length - excessLength);
  }
  return orgName;
}

function createDefaultOrganizationName(userName: string): string {
  let orgName = `${userName}'s Organization`;
  if (orgName.length > MAX_ORGANIZATION_NAME_LENGTH) {
    const excessLength = orgName.length - MAX_ORGANIZATION_NAME_LENGTH;
    orgName = `${userName.substring(0, userName.length - excessLength)}'s Organization`;
  }
  return orgName;
}

function createOrganizationSlug(orgName: string, slugSuffix?: string): string {
  let slug = slugify(orgName);
  if (slugSuffix) {
    slug = slugify(slugSuffix);
  }
  return slug;
}

async function appendUniqueIdToOrganizationSlug(defaultSlug: string): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS_TO_APPEND_UNIQUE_ID_TO_ORGANIZATION_SLUG; attempt++) {
    const shortId = generateShortId();
    const updatedSlug = slugify(`${defaultSlug}-${shortId}`);
    if (!(await doesOrganizationSlugExist(updatedSlug))) {
      return updatedSlug;
    }
  }
  throw new Error(`Failed to generate a unique organization slug after ${MAX_ATTEMPTS_TO_APPEND_UNIQUE_ID_TO_ORGANIZATION_SLUG} attempts`);
}

async function createUniqueOrganizationSlug(organizationName: string): Promise<string> {
  const defaultSlug = createOrganizationSlug(organizationName);
  if (!(await doesOrganizationSlugExist(defaultSlug))) {
    return defaultSlug;
  }
  return await appendUniqueIdToOrganizationSlug(defaultSlug);
}

function getUserName(request: CreateOrganizationRequest): string {
  // TODO: Replace with user service call
  return 'DeezNutsOnGod';
}

async function insertOrganizationRecord(
  request: CreateOrganizationRequest,
  organizationName: string,
  uniqueOrganizationSlug: string,
  defaultOrg: boolean,
  trx: Kysely<DB>
): Promise<Partial<Selectable<AppOrganization>>> {
  return await trx
    .insertInto('app.organization')
    .values({
      creator_user_id: request.userId,
      name: organizationName,
      slug: uniqueOrganizationSlug,
      description: request.description ?? null,
      default_user_organization: defaultOrg
    })
    .returning(['app.organization.organization_id', 'app.organization.creator_user_id'])
    .executeTakeFirstOrThrow();
}

async function insertOrganizationNameHistoryRecord(
  organizationRecord: Partial<Selectable<AppOrganization>>,
  organizationName: string,
  trx: Kysely<DB>
): Promise<void> {
  await trx
    .insertInto('app.organization_name_history')
    .values({
      fk_organization_organization_id: organizationRecord.organization_id!,
      initiator_user_id: organizationRecord.creator_user_id!,
      name: organizationName
    })
    .execute();
}

async function insertOrganizationSlugHistoryRecord(
  organizationRecord: Partial<Selectable<AppOrganization>>,
  uniqueOrganizationSlug: string,
  trx: Kysely<DB>
): Promise<void> {
  await trx
    .insertInto('app.organization_slug_history')
    .values({
      fk_organization_organization_id: organizationRecord.organization_id!,
      initiator_user_id: organizationRecord.creator_user_id!,
      slug: uniqueOrganizationSlug
    })
    .execute();
}

async function insertOrganizationDescriptionHistoryRecord(
  organizationRecord: Partial<Selectable<AppOrganization>>,
  request: CreateOrganizationRequest,
  trx: Kysely<DB>
): Promise<void> {
  await trx
    .insertInto('app.organization_description_history')
    .values({
      fk_organization_organization_id: organizationRecord.organization_id!,
      initiator_user_id: organizationRecord.creator_user_id!,
      description: request.description ?? null
    })
    .execute();
}

async function insertUserAsOrganizationOwner(
  organizationRecord: Partial<Selectable<AppOrganization>>,
  trx: Kysely<DB>
): Promise<any> {
  const ownerRole = await trx
    .selectFrom('app.organization_member_role')
    .selectAll()
    .where('role', '=', ORGANIZATION_MEMBER_ROLE_OWNER_ENUM)
    .executeTakeFirst();
  if (!ownerRole) throw new Error('Owner organization member role not found');
  return await trx
    .insertInto('app.organization_membership')
    .values({
      fk_organization_organization_id: organizationRecord.organization_id!,
      fk_organization_member_role_organization_member_role_id: ownerRole.organization_member_role_id,
      member_user_id: organizationRecord.creator_user_id!,
    })
    .returning(['app.organization_membership.organization_membership_id', 'app.organization_membership.fk_organization_organization_id', 'app.organization_membership.fk_organization_member_role_organization_member_role_id'])
    .executeTakeFirst();
}

async function insertOrganizationMembershipHistoryRecord(
  organizationRecord: Partial<Selectable<AppOrganization>>,
  membershipRecord: Partial<Selectable<AppOrganizationMembership>>,
  trx: Kysely<DB>
): Promise<void> {
  await trx
    .insertInto('app.organization_membership_history')
    .values({
      fk_organization_organization_id: membershipRecord.fk_organization_organization_id!,
      fk_organization_member_role_organization_member_role_id: membershipRecord.fk_organization_member_role_organization_member_role_id!,
      member_user_id: organizationRecord.creator_user_id!,
      initiator_user_id: organizationRecord.creator_user_id!
    })
    .execute();
}

async function insertAllOrganizationRecords(
  request: CreateOrganizationRequest,
  organizationName: string,
  uniqueOrganizationSlug: string,
  defaultOrg: boolean,
  trx: Kysely<DB>
): Promise<any> {
  const organizationRecord = await insertOrganizationRecord(request, organizationName, uniqueOrganizationSlug, defaultOrg, trx);
  await Promise.all([
    insertOrganizationNameHistoryRecord(organizationRecord, organizationName, trx),
    insertOrganizationSlugHistoryRecord(organizationRecord, uniqueOrganizationSlug, trx),
    insertOrganizationDescriptionHistoryRecord(organizationRecord, request, trx),
    insertUserAsOrganizationOwner(organizationRecord, trx).then((membershipRecord) =>
      insertOrganizationMembershipHistoryRecord(organizationRecord, membershipRecord, trx)
    )
  ]);
  return organizationRecord;
}

async function createAdditionalOrganization(request: CreateOrganizationRequest): Promise<any> {
  if (!request.name) {
    throw new Error('Organization name must be provided for creating a non-default organization');
  }
  const orgName = createOrganizationName(request.name);
  const uniqueOrganizationSlug = await createUniqueOrganizationSlug(orgName);
  return await db.transaction().execute(async (trx) => {
    return await insertAllOrganizationRecords(request, orgName, uniqueOrganizationSlug, false, trx);
  });
}

async function createDefaultOrganization(request: CreateOrganizationRequest): Promise<any> {
  const userName = getUserName(request);
  const organizationName = createDefaultOrganizationName(userName);
  const uniqueOrganizationSlug = await createUniqueOrganizationSlug(organizationName);
  return await db.transaction().execute(async (trx) => {
    return await insertAllOrganizationRecords(request, organizationName, uniqueOrganizationSlug, true, trx);
  });
}

function buildResponse(organizationRecord: any): CreateOrganizationResponse {
  return { id: organizationRecord.id };
}

async function createOrganization(request: CreateOrganizationRequest): Promise<CreateOrganizationResponse> {
  // TODO: Permissions check
  const hasDefault = await doesUserHaveADefaultOrganization(request);
  let orgRecord: any;
  if (hasDefault) {
    orgRecord = await createAdditionalOrganization(request);
  } else {
    orgRecord = await createDefaultOrganization(request);
  }
  return buildResponse(orgRecord);
}

app.post('/organization', (req, res) => {
  createOrganization(req.body)
    .then((response) => res.json(response))
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
