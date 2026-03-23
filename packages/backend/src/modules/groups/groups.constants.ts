export const GroupsRoutes = {
	MODULE:   'groups',

	ROOT:     '',
	BY_ID:    ':id',
	CREATE:   'create',
	LIST:     'list',
	STUDENTS: ':id/students',
	LESSONS:  ':id/lessons',
} as const