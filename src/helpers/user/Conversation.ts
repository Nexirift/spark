import { db } from '../../drizzle/db';
import { throwError } from '../common';

const getConversation = async (id: string) => {
	const conversation = await db.query.userConversation.findFirst({
		where: (userConversation, { eq }) => eq(userConversation.id, id)
	});
	if (!conversation)
		throwError(
			'The conversation does not exist.',
			'CONVERSATION_NOT_FOUND'
		);
	return conversation;
};

const getParticipant = async (userId: string, conversationId: string) => {
	await getConversation(conversationId);
	const participant = await db.query.userConversationParticipant.findFirst({
		where: (userConversationParticipant, { and, eq }) =>
			and(
				eq(userConversationParticipant.conversationId, conversationId),
				eq(userConversationParticipant.userId, userId)
			),
		with: {
			roles: {
				with: {
					role: {
						with: {
							members: true
						}
					}
				}
			}
		}
	});
	if (!participant)
		throwError(
			'You must be a participant in this conversation to proceed with this action.',
			'CONVERSATION_PARTICIPANT_REQUIRED'
		);
	return participant;
};

const getPermissions = async (conversationId: string, userId: string) => {
	const participant = await getParticipant(userId, conversationId);
	var perms = [];
	for (const role of participant?.roles ?? []) {
		for (const permission of JSON.parse(role.role.permissions)) {
			perms.push(permission);
		}
	}
	return perms;
};

const checkPermissions = async (
	permissions: string[],
	conversationId: string,
	userId: string
) => {
	const _permissions = await getPermissions(conversationId, userId);
	const missing = permissions.filter((p) => !_permissions.includes(p));

	if (missing.length > 0) {
		throwError(
			`You do not have permission to proceed with this action. Missing permission(s): ${missing.join(
				', '
			)}`,
			'CONVERSATION_PERMISSIONS_MISSING'
		);
	}
};

export { getConversation, getParticipant, getPermissions, checkPermissions };
