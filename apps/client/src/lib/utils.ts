import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripLocale(pathname: string) {
  return pathname.replace(/^\/(id|en)(?=\/|$)/, '') || '/';
}

export function createEventSource(endpoint: string): EventSource {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  return new EventSource(url, {
    withCredentials: true,
  });
}