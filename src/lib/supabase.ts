// Mock Supabase Client to prevent Vite from crashing
// We are migrating to Java/MySQL, so this is just a placeholder.

export const supabase = {
    auth: {
        getUser: async () => ({ data: { user: { email: 'mock@user.com' } } }),
        signOut: async () => {},
        signInWithOAuth: async () => ({ error: null }),
        signUp: async () => ({ error: null }),
        signInWithPassword: async () => ({ error: null })
    },
    from: (table: string) => ({
        select: () => ({
            eq: () => ({ single: async () => ({ data: {} }) }),
            order: () => ({ limit: async () => ({ data: [] }) }),
            then: (cb: any) => cb({ data: [], count: 0 })
        }),
        insert: async () => ({ error: null }),
        update: () => ({ eq: async () => ({ error: null }) }),
        delete: () => ({ eq: async () => ({ error: null }) })
    })
}
