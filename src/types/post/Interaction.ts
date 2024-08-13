import { User } from '..';
import { builder } from '../../builder';
import { db } from '../../drizzle/db';
import { type PostInteraction as PostInteractionType } from '../../drizzle/schema';
import { Post } from './Post';

export const PostInteraction =
	builder.objectRef<PostInteractionType>('PostInteraction');

PostInteraction.implement({
	fields: (t) => ({
		post: t.field({
			type: Post,
			resolve: async (_post) => {
				const result = await db.query.post.findFirst({
					where: (post, { eq }) => eq(post.id, _post.postId)
				});
				return result!;
			}
		}),
		user: t.field({
			type: User,
			resolve: async (_user) => {
				const result = await db.query.user.findFirst({
					where: (user, { eq }) => eq(user.id, _user.userId)
				});
				return result!;
			}
		}),
		type: t.exposeString('type')
	})
});
