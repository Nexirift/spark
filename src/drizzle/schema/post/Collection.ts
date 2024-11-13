import { pgEnum, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';
import { post, user } from '..';
import { InferSelectModel, relations } from 'drizzle-orm';

export const postCollectionVisibility = pgEnum('post_collection_visibility', [
	'PUBLIC',
	'PRIVATE'
]);

export const postCollection = pgTable('post_collection', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	visibility: postCollectionVisibility('visibility')
		.notNull()
		.default('PRIVATE'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id)
});

export const postCollectionRelations = relations(
	postCollection,
	({ one, many }) => ({
		user: one(user, {
			fields: [postCollection.userId],
			references: [user.id],
			relationName: 'user__collections'
		}),
		items: many(postCollectionItem)
	})
);

export const postCollectionItem = pgTable(
	'post_collection_item',
	{
		collectionId: uuid('collection_id')
			.notNull()
			.references(() => postCollection.id),
		postId: uuid('post_id')
			.notNull()
			.references(() => post.id)
	},
	(t) => ({
		pk: primaryKey(t.collectionId, t.postId)
	})
);

export const postCollectionItemRelations = relations(
	postCollectionItem,
	({ one }) => ({
		collection: one(postCollection, {
			fields: [postCollectionItem.collectionId],
			references: [postCollection.id],
			relationName: 'collection__items'
		}),
		post: one(post, {
			fields: [postCollectionItem.postId],
			references: [post.id],
			relationName: 'post__collections'
		})
	})
);

export type PostCollectionSchemaType = InferSelectModel<typeof postCollection>;
export type PostCollectionItemSchemaType = InferSelectModel<
	typeof postCollectionItem
>;