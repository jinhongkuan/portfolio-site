import { writable } from 'svelte/store';

export const currentRoute = writable('');
export const isTransitioning = writable(false);

export function navigateTo(href) {
  // Only handle internal navigation
  if (!href.startsWith('/portfolio-site/')) {
    window.location.href = href;
    return;
  }
  
  isTransitioning.set(true);
  
  // Add smooth transition
  setTimeout(() => {
    window.location.href = href;
  }, 200);
}