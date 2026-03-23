export const GroupsRoutes = {
	MODULE:    'groups',

	ROOT:      '',
	BY_ID:     ':id',
	CREATE:    'create',
	LIST:      'list',
	STUDENTS:  ':id/students',
	LESSONS:   ':id/lessons',
	MY_GROUPS: 'my-groups',
	MY_BY_ID:  'my-groups/:id',
} as const