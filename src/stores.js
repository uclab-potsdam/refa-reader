import { writable } from 'svelte/store';

export const selectedMarkdown = writable();
export const graphData = writable([]);
export const allLinks = writable([]);
export const visibleLinks = writable([]);
export const selectedNode = writable([]);
export const scrolled = writable(false);
export const showItemDetail = writable(false);