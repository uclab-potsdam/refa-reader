import { writable } from 'svelte/store';

export const Api = 'https://uclab.fh-potsdam.de/refa/api';
export const visibleLinks = writable([]);
export const allLinks = writable([]);
export const selectedNode = writable("");
export const graphData = writable([]);
export const updatePosition = writable(false)