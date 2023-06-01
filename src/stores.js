import { writable } from 'svelte/store';
export const visibleLinks = writable([]);
export const allLinks = writable([]);
export const selectedNode = writable("");
export const items = writable([])
export const graphSteps = writable([]);
export const paths = writable([]);

//  Customise these properties

export const Api = 'https://uclab.fh-potsdam.de/refa/api';
export const mainProperties = writable(["shows features of", "is shown by", "is type of", "created", "features are also found on"]);

//  item sets will take the first key
export const mainCategories =
    [
        {
            key: "Related Artworks",
            props: ["shows features of", "is shown by", "is type of", "created", "features are also found on"]
        },
        {
            key: "Documentation",
            props: ["is documented in", "incorporates"]
        },
    ];

export const secondayCategoriesLabel = "Classification";
export const setCategory = "Related Artworks";
