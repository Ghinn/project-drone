import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripLocale(pathname: string) {
  return pathname.replace(/^\/(id|en)(?=\/|$)/, '') || '/';
}

export function createEventSource(endpoint: string, isLocalProxy: boolean = false): EventSource {
  if (isLocalProxy) {
    const localUrl = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return new EventSource(localUrl);
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  return new EventSource(url, {
    withCredentials: true,
  });
}