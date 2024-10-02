import { InferSelectModel, relations } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { user, post } from '..';

export const userPlanet = pgTable('user_planet', {
	id: uuid('id').defaultRandom().primaryKey(),
	creatorId: text('creator_id')
		.notNull()
		.references(() => user.id),
	name: text('name').notNull(),
	description: text('description'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const userPlanetRelations = relations(userPlanet, ({ one, many }) => ({
	creator: one(user, {
		fields: [userPlanet.creatorId],
		references: [user.id]
	}),
	members: many(userPlanetMember),
	posts: many(userPlanetPost)
}));

export const userPlanetMember = pgTable('user_planet_member', {
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	planetId: uuid('planet_id')
		.notNull()
		.references(() => userPlanet.id),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const userPlanetMemberRelations = relations(
	userPlanetMember,
	({ one }) => ({
		user: one(user, {
			fields: [userPlanetMember.userId],
			references: [user.id]
		}),
		planet: one(userPlanet, {
			fields: [userPlanetMember.planetId],
			references: [userPlanet.id]
		})
	})
);

export const userPlanetPost = pgTable('user_planet_post', {
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	planetId: uuid('planet_id')
		.notNull()
		.references(() => userPlanet.id),
	postId: uuid('post_id')
		.notNull()
		.references(() => post.id),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const userPlanetPostRelations = relations(userPlanetPost, ({ one }) => ({
	user: one(user, {
		fields: [userPlanetPost.userId],
		references: [user.id]
	}),
	planet: one(userPlanet, {
		fields: [userPlanetPost.planetId],
		references: [userPlanet.id]
	}),
	post: one(post, {
		fields: [userPlanetPost.postId],
		references: [post.id]
	})
}));

export type UserPlanet = InferSelectModel<typeof userPlanet>;