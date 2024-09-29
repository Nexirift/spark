import { expect, test } from 'bun:test';
import { db } from '../drizzle/db';
import { post, user } from '../drizzle/schema';
import { createUser, makeGQLRequest, removeUser } from '../lib/tests';
import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';

test('Unauthenticated | General - It should get a non-existing post', async () => {
	const nonExistingPost = faker.string.uuid();

	// Make the GraphQL request to the getPost endpoint.
	const data = await makeGQLRequest(`
                query {
                    getPost(id: "${nonExistingPost}") {
                        id
                        content
                    }
                }
            `);

	// Expect the getPost data to be empty (null).
	expect(data).toHaveProperty('data.getPost', null);
});

test('Authenticated | General - It should create a new post', async () => {
	const postContent = faker.lorem.words(10);
	const user1 = faker.string.uuid();

	// Insert our fake user into the database.
	await createUser({
		sub: user1
	});

	// Make the GraphQL request to the getPost endpoint.
	const data = await makeGQLRequest(
		`
                mutation {
                    createPost(content: "${postContent}") {
                        id
                        content
                    }
                }
            `,
		user1
	);

	// Expect the ID to be the same as what was created in the database.
	expect(data).toHaveProperty('data.createPost.content', postContent);

	// Remove that test post from the database for future tests.
	await db.delete(post).where(eq(post.id, data.data.createPost.id));

	// Remove that test user from the database for future tests.
	await removeUser(user1);
});

test('Authenticated | General - It should update an existing post', async () => {
	const existingPost = faker.string.uuid();
	const postContent = faker.lorem.words(10);
	const user1 = faker.string.uuid();

	// Insert our fake user into the database.
	await createUser({
		sub: user1
	});

	// Insert our fake post into the database.
	await db.insert(post).values({
		id: existingPost,
		content: 'test',
		authorId: user1
	});

	// Make the GraphQL request to the getPost endpoint.
	const data = await makeGQLRequest(
		`
                mutation {
                    updatePost(id: "${existingPost}", content: "${postContent}") {
                        id
                        content
                    }
                }
            `,
		user1
	);

	// Expect the ID to be the same as what was created in the database.
	expect(data).toHaveProperty('data.updatePost.content', postContent);

	// Remove that test post from the database for future tests.
	await db.delete(post).where(eq(post.id, existingPost));

	// Remove that test user from the database for future tests.
	await removeUser(user1);
});

test('Authenticated | General - It should delete an existing post', async () => {
	const existingPost = faker.string.uuid();
	const user1 = faker.string.uuid();

	// Insert our fake user into the database.
	await createUser({
		sub: user1
	});

	// Insert our fake post into the database.
	await db.insert(post).values({
		id: existingPost,
		content: 'test',
		authorId: user1
	});

	// Make the GraphQL request to the getPost endpoint.
	const data = await makeGQLRequest(
		`
                mutation {
                    deletePost(id: "${existingPost}")
                }
            `,
		user1
	);

	// Expect the ID to be the same as what was created in the database.
	expect(data).toHaveProperty('data.deletePost', true);

	// Remove that test post from the database for future tests.
	await db.delete(post).where(eq(post.id, existingPost));

	// Remove that test user from the database for future tests.
	await removeUser(user1);
});

test('Unauthenticated | General - It should get an existing post', async () => {
	const existingPost = faker.string.uuid();
	const user1 = faker.string.uuid();

	// Insert our fake user into the database.
	await createUser({
		sub: user1
	});

	// Insert our fake post into the database.
	await db.insert(post).values({
		id: existingPost,
		content: 'test',
		authorId: user1
	});

	// Make the GraphQL request to the getPost endpoint.
	const data = await makeGQLRequest(`
                query {
                    getPost(id: "${existingPost}") {
                        id
                        content
                    }
                }
            `);

	// Expect the ID to be the same as what was created in the database.
	expect(data).toHaveProperty('data.getPost.id', existingPost);
	expect(data).toHaveProperty('data.getPost.content', 'test');

	// Remove that test post from the database for future tests.
	await db.delete(post).where(eq(post.id, existingPost));

	// Remove that test user from the database for future tests.
	await removeUser(user1);
});
