import { Database } from '../../db';
import { Selectable, Transaction } from 'kysely';
import { AppTeam, AppTeamMembership, DB } from '../../generated/db/db';

const TeamMembershipRole = {
  Owner: 'OWNER',
  Admin: 'ADMIN',
  Member: 'MEMBER'
} as const;

type TeamMembershipRole = typeof TeamMembershipRole[keyof typeof TeamMembershipRole];

class TeamRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  createTeam = async (name: string, creatorUserId: string, ownerOrganizationId: string): Promise<Selectable<AppTeam>> => {
    return await this.db.getDatabase().transaction().execute(async tsx => {
      const teamRecord = await this.insertTeamRecord(creatorUserId, name, ownerOrganizationId, tsx);
      await Promise.all([
        this.insertTeamNameHistoryRecord(teamRecord.teamId, teamRecord.name, creatorUserId, tsx),
        this.insertTeamOwnerOrganizationRecord(teamRecord.teamId, ownerOrganizationId, tsx),
        this.insertTeamOwnerOrganizationHistoryRecord(teamRecord.teamId, ownerOrganizationId, creatorUserId, tsx),
        this.insertTeamMembershipRecord(teamRecord.teamId, creatorUserId, TeamMembershipRole.Owner, tsx),
        this.insertTeamMembershipHistoryRecord(teamRecord.teamId, creatorUserId, TeamMembershipRole.Owner, creatorUserId, tsx)
      ]);
      return teamRecord;
    });
  };

  private insertTeamRecord = async (
    creatorUserId: string,
    name: string,
    ownerOrganizationId: string,
    tsx: Transaction<DB>
  ): Promise<Selectable<AppTeam>> => {
    return await tsx
      .insertInto('app.team')
      .values({
        creatorUserId: creatorUserId,
        name: name,
        ownerOrganizationOrganizationId: ownerOrganizationId
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  };

  private insertTeamOwnerOrganizationRecord = async (
    teamId: string,
    ownerOrganizationId: string,
    tsx: Transaction<DB>
  ) => {
    return await tsx
      .insertInto('app.teamOwnerOrganization')
      .values({
        fkTeamTeamId: teamId,
        fkOrganizationOrganizationId: ownerOrganizationId
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  };

  private insertTeamOwnerOrganizationHistoryRecord(teamId: string,
                                                   ownerOrganizationId: string,
                                                   initiatorUserId: string,
                                                   tsx: Transaction<DB>) {
    return tsx
      .insertInto('app.teamOwnerOrganizationHistory')
      .values({
        fkTeamTeamId: teamId,
        fkOrganizationOrganizationId: ownerOrganizationId,
        initiatorUserId: initiatorUserId
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  private insertTeamNameHistoryRecord = async (
    teamId: string,
    name: string,
    initiatorUserId: string,
    tsx: Transaction<DB>
  ) => {
    return await tsx
      .insertInto('app.teamNameHistory')
      .values({
        initiatorUserId: initiatorUserId,
        fkTeamTeamId: teamId,
        name: name
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  };

  private insertTeamMembershipRecord = async (
    teamId: string,
    userId: string,
    role: TeamMembershipRole,
    tsx: Transaction<DB>
  ): Promise<Selectable<AppTeamMembership>> => {
    const memberRoleId = await this.getMemberRoleId(role, tsx);

    return await tsx
      .insertInto('app.teamMembership')
      .values({
        fkTeamTeamId: teamId,
        fkMemberRoleMemberRoleId: memberRoleId,
        memberUserId: userId
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  };

  private insertTeamMembershipHistoryRecord = async (
    teamId: string,
    memberUserId: string,
    role: TeamMembershipRole,
    initiatorUserId: string,
    tsx: Transaction<DB>
  ) => {
    const memberRoleId = await this.getMemberRoleId(role, tsx);
    return await tsx
      .insertInto('app.teamMembershipHistory')
      .values({
        fkTeamTeamId: teamId,
        fkMemberRoleMemberRoleId: memberRoleId,
        memberUserId: memberUserId,
        initiatorUserId: initiatorUserId
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  };

  private getMemberRoleId = async (role: TeamMembershipRole, tsx: Transaction<DB>): Promise<string> => {
    const membershipRoleRecord =
      await tsx.selectFrom('app.memberRole')
        .select('memberRoleId')
        .where('role', '=', role)
        .executeTakeFirstOrThrow();
    return membershipRoleRecord.memberRoleId;
  };
}

export { TeamRepository };
