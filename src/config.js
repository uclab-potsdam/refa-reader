//  Customise these properties
export const Api = 'https://uclab.fh-potsdam.de/refa/api';
export const description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce in tellus faucibus, elementum urna ut, convallis dui. Mauris euismod at tellus sed fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non tristique lectus.";

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

export const secondayCategoriesLabel = "Classification";
export const setCategory = "Related Artworks";

export const ItemDetailMetaData =
    [
        "ecrm:P92i_was_brought_into_existence_by",
        "dcterms:created",
        "ecrm:P45_consists_of",
        "ecrm:P43_has_dimension"
    ];


// specify custom icons for the markdown texts, the default is ●
export const customIcons = {
    "ecrm:E22_Human-Made_Object": "●",
    "skos:Concept": "◼"
}