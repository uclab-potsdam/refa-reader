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

//  Customise these properties
export const Api = 'https://uclab.fh-potsdam.de/refa/api';
// Leave empty if you don't want that entities link to the site
export const site = 'https://uclab.fh-potsdam.de/refa/s/pinacotheca/';

export const mainCategories =
    [
        {
            key: "Related Artworks",
            props: ["is refered to it", "shows features of", "is shown by", "is type of", "created", "features are also found on"]
        },
        {
            key: "Documentation",
            props: ["is documented in", "incorporates"]
        },
    ];
export const ItemDetailMetaData =
    [
        "ecrm:P92i_was_brought_into_existence_by",
        "dcterms:created",
        "ecrm:P45_consists_of",
        "ecrm:P43_has_dimension"
    ];

export const secondayCategoriesLabel = "Classification";
export const setCategory = "Related";