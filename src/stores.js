import { writable } from 'svelte/store';
export const visibleLinks = writable([]);
export const allLinks = writable([]);
export const selectedNode = writable("");
export const items = writable([])
export const graphSteps = writable([]);

export const Api = 'https://uclab.fh-potsdam.de/refa/api';
export const mainProperties = writable(["shows features of", "is shown by", "shows visual item", "is type of", "created", "features are also found on"]);

