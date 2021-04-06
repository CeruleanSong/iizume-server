import joi, { object } from 'joi';

const SearchSchema = object({
	manga_id: joi.string()
		.default(null)
		.length(16)
		.optional(),

	source_id: joi.string()
		.default(null)
		.length(16)
		.optional(),

	title: joi.string()
		.default(null)
		.length(512)
		.optional(),

	page: joi.number()
		.greater(0)
		.default(1)
		.optional(),


	limit: joi.number()
		.greater(0)
		.default(30)
		.optional()
});

export default SearchSchema;