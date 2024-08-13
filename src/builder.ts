import ValidationPlugin from '@pothos/plugin-validation';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import ErrorsPlugin from '@pothos/plugin-errors';
import SchemaBuilder from '@pothos/core';
import { Context } from './context';
import { DateTimeResolver } from 'graphql-scalars';

export const builder = new SchemaBuilder<{
	// TODO: Migrate to v4.
	Defaults: 'v3';
	Context: Context;
	Scalars: {
		Date: {
			Input: Date;
			Output: Date;
		};
	};
}>({
	defaults: 'v3',
	plugins: [ScopeAuthPlugin, ValidationPlugin, ErrorsPlugin],
	validationOptions: {
		// optionally customize how errors are formatted
		validationError: (zodError, args, context, info) => {
			// the default behavior is to just throw the zod error directly
			return zodError;
		}
	},
	authScopes: async (context) => ({}),
	scopeAuthOptions: {
		// Recommended when using subscriptions
		// when this is not set, auth checks are run when event is resolved rather than when the subscription is created
		authorizeOnSubscribe: true
	}
});

builder.addScalarType('Date', DateTimeResolver, {});

builder.objectType(Error, {
	name: 'Error',
	fields: (t) => ({
		message: t.exposeString('message')
	})
});
