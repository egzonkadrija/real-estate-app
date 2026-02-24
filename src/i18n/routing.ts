import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['al', 'en', 'de'],
  defaultLocale: 'al',
});

export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);
