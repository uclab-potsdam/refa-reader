import { writable } from 'svelte/store';

export const Api = 'https://uclab.fh-potsdam.de/refa/api';
export const mainProperties = writable(["shows features of", "is shown by"]);

export const visibleLinks = writable([]);
export const allLinks = writable([]);
export const selectedNode = writable("");
export const items = writable([])
export const graphSteps = writable([]);
