import { builder } from '../../builder';
import { db } from '../../drizzle/db';
import { type UserRelationship as UserRelationshipType } from '../../drizzle/schema';
import { User } from './User';

export const UserRelationship =
	builder.objectRef<UserRelationshipType>('UserRelationship');

UserRelationship.implement({
	fields: (t) => ({
		to: t.field({
			type: User,
			resolve: async (_user) => {
				const result = await db.query.user.findFirst({
					where: (user, { eq }) => eq(user.id, _user.toId)
				});
				return result!;
			}
		}),
		from: t.field({
			type: User,
			resolve: async (_user) => {
				const result = await db.query.user.findFirst({
					where: (user, { eq }) => eq(user.id, _user.fromId)
				});
				return result!;
			}
		}),
		type: t.exposeString('type'),
		since: t.expose('createdAt', { type: 'Date' })
	})
});
