# Environment Variables Setup

Create a `.env.local` file in the root directory (`aeroassist/`) with the following variables:

## Site Configuration
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCT_NAME=AeroAssist
NEXT_PUBLIC_SITE_TITLE=AeroAssist - The easiest way to build and manage your SaaS
NEXT_PUBLIC_SITE_DESCRIPTION=AeroAssist is the easiest way to build and manage your SaaS. It provides you with the tools you need to build your SaaS, without the hassle of building it from scratch.
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_DEFAULT_THEME_MODE=light
NEXT_PUBLIC_THEME_COLOR=#ffffff
NEXT_PUBLIC_THEME_COLOR_DARK=#0a0a0a
```

## Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Feature Flags
```env
NEXT_PUBLIC_ENABLE_THEME_TOGGLE=true
NEXT_PUBLIC_ENABLE_VERSION_UPDATER=true
NEXT_PUBLIC_ENABLE_SIDEBAR_TRIGGER=true
NEXT_PUBLIC_EXPAND_SIDEBAR_ON_HOVER=true
NEXT_PUBLIC_SIDEBAR_COLLAPSIBLE_STYLE=icon
NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED=false
NEXT_PUBLIC_NAVIGATION_STYLE=sidebar
```

## Authentication Configuration
```env
NEXT_PUBLIC_AUTH_PASSWORD=true
NEXT_PUBLIC_AUTH_MAGIC_LINK=true
NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX=true
NEXT_PUBLIC_CAPTCHA_SITE_KEY=
CAPTCHA_SECRET_TOKEN=
```

## Password Requirements
```env
NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL_CHARS=true
NEXT_PUBLIC_PASSWORD_REQUIRE_NUMBERS=true
NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE=true
```

## Account Management
```env
NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION=true
```

## Version Updater
```env
NEXT_PUBLIC_VERSION_UPDATER_REFETCH_INTERVAL_SECONDS=300
```

## Development
```env
NODE_ENV=development
LOGGER=pino
ENABLE_REACT_COMPILER=false
```

## CI/CD
```env
NEXT_PUBLIC_CI=false
```

## Setup Instructions

1. Create a file named `.env.local` in the root directory (`aeroassist/`)
2. Copy the above variables into the file
3. Fill in the Supabase keys when you set up your Supabase project
4. Customize the site configuration variables as needed

## Next Steps

After creating the `.env.local` file, you'll need to:

1. Set up Supabase (local or cloud)
2. Get your Supabase URL and keys
3. Update the Supabase configuration variables
4. Start the development server with `pnpm run dev` 