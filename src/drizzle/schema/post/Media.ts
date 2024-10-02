import { InferSelectModel, relations } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { post } from '.';

export const postMedia = pgTable('post_media', {
	id: uuid('id').defaultRandom().primaryKey(),
	postId: uuid('post_id').references(() => post.id),
	url: text('url').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const postMediaRelations = relations(postMedia, ({ one }) => ({
	post: one(post, {
		fields: [postMedia.postId],
		references: [post.id],
		relationName: 'post_media'
	})
}));

export type PostMedia = InferSelectModel<typeof postMedia>;
