import { writable } from 'svelte/store';
export const visibleLinks = writable([]);
export const allLinks = writable([]);
export const selectedNode = writable("");
export const hoverNode = writable("");
export const selectedNodeUniqueId = writable("");
export const items = writable([])
export const graphSteps = writable([]);
export const paths = writable([]);
export const scrollX = writable(0);