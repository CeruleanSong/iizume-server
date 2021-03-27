import joi, { object } from 'joi';

const JobSchema = object({
	job_id: joi.string()
		.default(null)
		.optional(),

	type: joi.string()
		.required(),

	target: joi.string()
		.default('NONE')
		.optional()
});

export default JobSchema;