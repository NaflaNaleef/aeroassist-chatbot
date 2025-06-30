import { z } from 'zod';

const PathsSchema = z.object({
  auth: z.object({
    signIn: z.string().min(1),
    signUp: z.string().min(1),
    verifyMfa: z.string().min(1),
    callback: z.string().min(1),
    passwordReset: z.string().min(1),
    passwordUpdate: z.string().min(1),
  }),
  app: z.object({
    // Core routes
    home: z.string().min(1),
    profileSettings: z.string().min(1),

    // Flight-related routes
    flightSearch: z.string().min(1),
    bookings: z.string().min(1),
    flightStatus: z.string().min(1),
    checkIn: z.string().min(1),

    // Support routes
    chat: z.string().min(1),

    // Account routes
    paymentSettings: z.string().min(1),
    generalSettings: z.string().min(1),
    themeSettings: z.string().min(1),

    // Dynamic routes (with parameters)
    flightDetails: z.string().min(1), // /flights/[id]
    booking: z.string().min(1), // /bookings/[id]
    chatSession: z.string().min(1), // /chat/[sessionId]
  }),
});

const pathsConfig = PathsSchema.parse({
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    verifyMfa: '/auth/verify',
    callback: '/auth/callback',
    passwordReset: '/auth/password-reset',
    passwordUpdate: '/update-password',
  },
  app: {
    // Core routes
    home: '/home',
    profileSettings: '/home/settings',

    // Flight-related routes
    flightSearch: '/flights/search',
    bookings: '/bookings',
    flightStatus: '/flights/status',
    checkIn: '/check-in',

    // Support routes
    chat: '/chat',

    // Account routes
    paymentSettings: '/home/settings/payments',
    generalSettings: '/home/settings/general',
    themeSettings: '/home/settings/theme',

    // Dynamic routes (you'll use these programmatically)
    flightDetails: '/flights',
    booking: '/bookings',
    chatSession: '/chat',
  },
} satisfies z.infer<typeof PathsSchema>);

export default pathsConfig;