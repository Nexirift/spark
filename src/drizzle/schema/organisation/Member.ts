import { InferSelectModel, relations } from 'drizzle-orm';
import {
	pgTable,
	pgEnum,
	uuid,
	text,
	timestamp,
	boolean
} from 'drizzle-orm/pg-core';
import { organisation, user } from '..';

export const organisationRole = pgEnum('organisation_role', [
	'OWNER',
	'ADMIN',
	'MEMBER'
]);

export const organisationMember = pgTable('organisation_member', {
	id: uuid('id').defaultRandom().primaryKey(),
	organisationId: text('organisation_id')
		.notNull()
		.references(() => organisation.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	role: organisationRole('organisation_role').notNull(),
	affiliated: boolean('affiliated').notNull().default(false),
	profession: text('profession'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const organisationMemberRelations = relations(
	organisationMember,
	({ one }) => ({
		organisation: one(organisation, {
			fields: [organisationMember.organisationId],
			references: [organisation.id],
			relationName: 'organisation_member'
		}),
		user: one(user, {
			fields: [organisationMember.userId],
			references: [user.id],
			relationName: 'organisation_member'
		})
	})
);

export type OrganisationMemberSchemaType = InferSelectModel<
	typeof organisationMember
>;
