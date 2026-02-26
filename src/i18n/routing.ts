import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['mk', 'al', 'en', 'de', 'tr'],
  defaultLocale: 'al',
});

export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);
