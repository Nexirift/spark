import { and, eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { builder } from '../../builder';
import { Context } from '../../context';
import { db } from '../../drizzle/db';
import { postCollection, postCollectionItem } from '../../drizzle/schema';
import { PostCollection } from '../../types/post/collection/Collection';
import { PostCollectionItem } from '../../types/post/collection/Item';

const findPostCollectionById = async (id: string) => {
	return db.query.postCollection.findFirst({
		where: (postCollection, { eq }) => eq(postCollection.id, id)
	});
};

builder.mutationField('createPostCollection', (t) =>
	t.field({
		type: PostCollection,
		args: {
			name: t.arg.string({ required: true }),
			description: t.arg.string(),
			visibility: t.arg.string({ defaultValue: 'PUBLIC' })
		},
		resolve: async (_root, args, ctx: Context) => {
			const originalPostCollection =
				await db.query.postCollection.findFirst({
					where: (postCollection, { and, eq }) =>
						and(
							eq(postCollection.name, args.name),
							eq(postCollection.userId, ctx.oidc.sub)
						)
				});

			if (originalPostCollection) {
				throw new GraphQLError('Post collection already exists.', {
					extensions: { code: 'POST_COLLECTION_ALREADY_EXISTS' }
				});
			}

			const newPostCollection = await db
				.insert(postCollection)
				.values({
					name: args.name,
					description: args.description,
					visibility: args.visibility as 'PUBLIC' | 'PRIVATE',
					userId: ctx.oidc.sub
				})
				.returning()
				.execute();

			return newPostCollection[0];
		}
	})
);

builder.mutationField('updatePostCollection', (t) =>
	t.field({
		type: PostCollection,
		args: {
			id: t.arg.string({ required: true }),
			name: t.arg.string({ required: true }),
			description: t.arg.string(),
			visibility: t.arg.string({ defaultValue: 'PUBLIC' })
		},
		resolve: async (_root, args, ctx: Context) => {
			const originalPostCollection = await findPostCollectionById(
				args.id
			);

			if (!originalPostCollection) {
				throw new GraphQLError('Post collection not found.', {
					extensions: { code: 'POST_COLLECTION_NOT_FOUND' }
				});
			}

			const updatedPostCollection = await db
				.update(postCollection)
				.set({
					name: args.name,
					description: args.description,
					visibility: args.visibility as 'PUBLIC' | 'PRIVATE'
				})
				.where(eq(postCollection.id, args.id))
				.returning()
				.execute();

			return updatedPostCollection[0];
		}
	})
);

builder.mutationField('deletePostCollection', (t) =>
	t.field({
		type: 'Boolean',
		args: {
			id: t.arg.string({ required: true })
		},
		resolve: async (_root, args, ctx: Context) => {
			const originalPostCollection = await findPostCollectionById(
				args.id
			);

			if (!originalPostCollection) {
				throw new GraphQLError('Post collection not found.', {
					extensions: { code: 'POST_COLLECTION_NOT_FOUND' }
				});
			}

			await db
				.delete(postCollection)
				.where(eq(postCollection.id, args.id))
				.execute();

			return true;
		}
	})
);

builder.mutationField('addPostToCollection', (t) =>
	t.field({
		type: PostCollectionItem,
		args: {
			id: t.arg.string({ required: true }),
			postId: t.arg.string({ required: true })
		},
		resolve: async (_root, args, ctx: Context) => {
			const originalPostCollection = await findPostCollectionById(
				args.id
			);

			if (!originalPostCollection) {
				throw new GraphQLError('Post collection not found.', {
					extensions: { code: 'POST_COLLECTION_NOT_FOUND' }
				});
			}

			const newPostCollectionItem = await db
				.insert(postCollectionItem)
				.values({
					collectionId: args.id,
					postId: args.postId
				})
				.returning()
				.execute();

			return newPostCollectionItem[0];
		}
	})
);

builder.mutationField('removePostFromCollection', (t) =>
	t.field({
		type: PostCollectionItem,
		args: {
			id: t.arg.string({ required: true }),
			postId: t.arg.string({ required: true })
		},
		resolve: async (_root, args, ctx: Context) => {
			const originalPostCollection = await findPostCollectionById(
				args.id
			);

			if (!originalPostCollection) {
				throw new GraphQLError('Post collection not found.', {
					extensions: { code: 'POST_COLLECTION_NOT_FOUND' }
				});
			}

			await db
				.delete(postCollectionItem)
				.where(
					and(
						eq(postCollectionItem.collectionId, args.id),
						eq(postCollectionItem.postId, args.postId)
					)
				)
				.execute();

			return { collectionId: args.id, postId: args.postId };
		}
	})
);
