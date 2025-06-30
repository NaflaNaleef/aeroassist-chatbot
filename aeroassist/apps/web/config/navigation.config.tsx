import { 
  Home, 
  User, 
  Search, 
  Calendar, 
  Plane, 
  MessageCircle, 
  CreditCard,
  Clock,
  MapPin,
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';
import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'common:routes.application',
    children: [
      {
        label: 'common:routes.dashboard',
        path: pathsConfig.app.home,
        Icon: <Home className={iconClasses} />,
        end: true,
      },
    ],
  },
  {
    label: 'common:routes.flights',
    children: [
      {
        label: 'common:routes.searchFlights',
        path: pathsConfig.app.flightSearch,
        Icon: <Search className={iconClasses} />,
      },
      {
        label: 'common:routes.myBookings',
        path: pathsConfig.app.bookings,
        Icon: <Calendar className={iconClasses} />,
      },
      {
        label: 'common:routes.flightStatus',
        path: pathsConfig.app.flightStatus,
        Icon: <Plane className={iconClasses} />,
      },
      {
        label: 'common:routes.checkIn',
        path: pathsConfig.app.checkIn,
        Icon: <MapPin className={iconClasses} />,
      },
    ],
  },
  {
    label: 'common:routes.support',
    children: [
      {
        label: 'common:routes.aiAssistant',
        path: pathsConfig.app.chat,
        Icon: <MessageCircle className={iconClasses} />,
      },
    ],
  },
  {
    label: 'common:routes.account',
    children: [
      {
        label: 'common:routes.profile',
        path: pathsConfig.app.profileSettings,
        Icon: <User className={iconClasses} />,
      },
      {
        label: 'common:routes.paymentMethods',
        path: pathsConfig.app.paymentSettings,
        Icon: <CreditCard className={iconClasses} />,
      },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

// User profile menu for bottom of sidebar
const userMenuRoutes = [
  {
    label: 'common:routes.settings',
    children: [
      {
        label: 'common:routes.generalSettings',
        path: pathsConfig.app.generalSettings,
        Icon: <Settings className={iconClasses} />,
      },
      {
        label: 'common:routes.profile',
        path: pathsConfig.app.profileSettings,
        Icon: <User className={iconClasses} />,
      },
    ],
  },
  {
    label: 'common:routes.preferences',
    children: [
      {
        label: 'common:routes.themeSettings',
        path: pathsConfig.app.themeSettings,
        Icon: <Monitor className={iconClasses} />,
      },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

export const navigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_NAVIGATION_STYLE,
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
  userMenu: {
    showProfile: true,
    showLogout: true,
    showThemeToggle: true,
    showHome: true,
    items: [
      {
        label: 'common:routes.home',
        path: pathsConfig.app.home,
        Icon: <Home className={iconClasses} />,
      },
      {
        label: 'common:routes.profile',
        path: pathsConfig.app.profileSettings,
        Icon: <User className={iconClasses} />,
      },
      {
        label: 'common:routes.generalSettings', 
        path: pathsConfig.app.generalSettings,
        Icon: <Settings className={iconClasses} />,
      },
      {
        label: 'common:routes.themeSettings',
        path: pathsConfig.app.themeSettings,
        Icon: <Monitor className={iconClasses} />,
      },
    ],
  },
});

// Export user menu separately for sidebar component
export const userMenuConfig = {
  routes: userMenuRoutes,
  showUserProfile: true,
  showLogout: true,
  showThemeToggle: true,
};