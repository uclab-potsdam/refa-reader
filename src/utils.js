import * as config from './setup.json';
import { visibleLinks, allLinks, selectedNode, selectedNodeUniqueId } from '@stores';
// import { invertedProperties } from './invertedProperties';
import newUniqueId from 'locally-unique-id-generator';

export async function extractLinks(markdown) {
    // Regular expression to match links
    const regex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*?>(.*?)<\/a>/g;
    // Arrays to store URLs for different types of links
    const itemUrls = [];
    const mediaUrls = [];
    const setUrls = [];
    // Array to store all link objects
    const links = [];

    // Loop through each match of the regex in the Markdown string
    let match;
    while ((match = regex.exec(markdown))) {
        // If the URL contains "http", skip this link (external link)
        if (match[2].includes("http")) {
            continue
        }
        // Otherwise, parse the link and add it to the appropriate array and links array
        else {
            const label = match[3]
            const url = match[2]
            if (url.includes("item/")) {
                itemUrls.push(url.split("/")[1]);
            }
            if (url.includes("set/")) {
                setUrls.push(url.split("/")[1]);
            }
            if (url.includes("media/")) {
                mediaUrls.push(url.split("/")[1]);
            }
            links.push({
                label, id: url.split("/")[1],
            });
        }
    }

    const batchSize = config.batch;

    // Split the itemUrls into batches of batchSize
    const itemUrlBatches = splitIntoBatches(itemUrls, batchSize);
    const itemPromises = itemUrlBatches.map(batch => {
        const itemQuery = `${config.api}/items?${batch.map(i => `id[]=${i}`).join("&")}`;
        return fetch(itemQuery).then(response => response.json());
    });

    // Split the setUrls into batches of batchSize
    const setUrlBatches = splitIntoBatches(setUrls, batchSize);
    const setPromises = setUrlBatches.map(batch => {
        const setQuery = `${config.api}/item_sets?${batch.map(i => `id[]=${i}`).join("&")}`;
        return fetch(setQuery).then(response => response.json());
    });

    // Split the mediaUrls into batches of batchSize
    const mediaUrlBatches = splitIntoBatches(mediaUrls, batchSize);
    const mediaPromises = mediaUrlBatches.map(batch => {
        const mediaQuery = `${config.api}/media?${batch.map(i => `id[]=${i}`).join("&")}`;
        return fetch(mediaQuery).then(response => response.json());
    });

    // Fetch data for each type of link
    const itemJsons = await Promise.all(itemPromises);
    const setJsons = await Promise.all(setPromises);
    const mediaJsons = await Promise.all(mediaPromises);
    // Combine the JSON data into a single array
    const parseitems = [...itemJsons.flat(), ...mediaJsons.flat(), ...setJsons.flat()];

    // Loop through each link object and add additional data as needed
    for (let i = 0; i < parseitems.length; i++) {
        const link = links.find(d => parseitems[i]["o:id"] == d.id)
        // const json = parseitems.find(d => d["o:id"] == link.id);
        const json = parseitems[i]

        if (json?.["o:items"]) {
            link.data = json;
            link.set = {
                id: json["o:id"],
                title: json["o:title"]
            };
            // Fetch the items in the set
            const items = json["o:items"]["@id"];
            const responseSet = await fetch(items);
            const jsonSet = await responseSet.json();
            jsonSet.forEach(item => {
                links.push({
                    label: item["o:title"],
                    id: item["o:id"],
                    data: item,
                    uniqueId: newUniqueId(),
                    set: {
                        id: json["o:id"],
                        title: json["o:title"]
                    },
                    fromSet: true
                });
            });
        }
        else if (json?.["o:item"]) {
            link.data = json;
            link.set = {
                id: json["o:id"],
                title: json["o:title"]
            };
            // Fetch the items in the set
            const item = json["o:item"]["@id"];
            const responseItem = await fetch(item);
            const jsonItem = await responseItem.json();

            links.push({
                label: jsonItem["o:title"],
                id: jsonItem["o:id"],
                data: jsonItem,
                uniqueId: newUniqueId(),
                set: {
                    id: json["o:id"],
                    title: json["o:title"]
                },
                fromSet: true
            });
        }
        else {
            link.uniqueId = newUniqueId();
            link.data = json;
        }

    }
    return links;


    // Helper function to split an array into batches
    function splitIntoBatches(arr, batchSize) {
        const batches = [];
        for (let i = 0; i < arr.length; i += batchSize) {
            batches.push(arr.slice(i, i + batchSize));
        }
        return batches;
    }
}


/**
 * Creates triplets from the given data and returns a graph object with nodes and links
 * @param {Array} data An array of objects containing JSON-LD data and sets
 * @returns {Object} A graph object with nodes and links
 */
export async function createTriplets(data) {
    let allTriplets = [];

    // Open all links and create a new object with the triples generated
    for (let i = 0; i < data.length; i++) {
        if (data[i].data) {
            let jsonLD = data[i].data;
            let set = data[i].set || null;
            let triplets = parseJSONLD(jsonLD, set);
            allTriplets = [...allTriplets, ...triplets];
        }
    }
    

    // Create the nodes and links
    const graph = {
        nodes: allTriplets.reduce((acc, curr) => {
            if (!acc.find((n) => n.id === curr.source)) {
                acc.push({ id: curr.source, title: curr.title });
            }
            if (!acc.find((n) => n.id === curr.target)) {
                acc.push({ id: curr.target, title: curr.title });
            }
            return acc;
        }, []),
        links: allTriplets,
    }


    return { ...graph };
}

/**
 * Parses JSON-LD data and extracts triplets for visualization.
 * @param {Object} jsonLD - The JSON-LD data to parse.
 * @param {Object} set - The set object that the JSON-LD data belongs to.
 * @returns {Array} An array of triplets for visualization.
 */
export function parseJSONLD(jsonLD, set) {
    let triplets = [];
    let source = `${config.api}/resources/${jsonLD["o:id"]}`;

    // Add a triplet for the set if available
    if (set) {
        triplets.push({
            source: `${config.api}/resources/${set.id}`,
            target: source,
            img: jsonLD?.thumbnail_display_urls?.large,
            title: jsonLD["o:title"]
        });
    }

    let parentKey;
    let reverse = false;

    /**
     * Recursively parse the JSON-LD data and extract triplets.
     * @param {Object} obj - The current object to parse.
     */
    let parseRecursive = async function (obj) {
        for (let key in obj) {
            
            // Check if the key is "@id" and the value starts with the API base URL and has a title
            if (key === "@id" && obj[key].startsWith(config.api) && (obj["o:title"] || obj.display_title || reverse == true)) {
                // Extract the target URL, title, and image
                let splitId = obj[key].split("/");
                let id = splitId[splitId.length - 1];
                const target = `${config.api}/resources/${id}`;
                const title = obj["o:title"] || obj.display_title;
                const img = obj?.thumbnail_url || obj?.thumbnail_display_urls?.large;

                // Check if the source and target already exist in triplets array
                const exists = triplets.some(triplet => triplet.source === source && triplet.target === target);

                // a regex to remove alphanumeric characters from ontologies as cidoc crm / wikidata
                const regex = /\b[a-zA-Z]+\d+[a-zA-Z]*\s/;
                let property = obj["property_label"]?.replace("_", " ")?.replace(regex, '') || parentKey?.replace(regex, '')

                // gotta find a way to fix inveted properties
                if (reverse) {
                    // property = invertedProperties[property] || property
                    property = `${property} ←`
                } else {
                    property = `→ ${property}`
                }

                const category = config.mainCategories
                    .map(d => (d.props.includes(property) ? d.key : ""))
                    .find(Boolean);

                if (!exists) {
                    // Add a new triplet to the array
                    triplets.push({
                        source: source,
                        target: target,
                        title,
                        img,
                        property,
                        category: category,
                        reverse
                    });
                }
            }
            // Recursively parse child objects
            else if (typeof obj[key] === "object") {
                if (isNaN(key)) {
                    const parts = key?.split(":");
                    const label = parts[1]?.split("_")?.join(" ");
                    parentKey = label;
                    if (key == "@reverse") {
                        reverse = true
                    }
                }
                parseRecursive(obj[key]);
            }
        }
    };
    // Recursive parsing
    parseRecursive(jsonLD);
    return triplets;
}


export function observe() {
    let visible = new Set();
    let scrollingDirection;

    const options = {
        // rootMargin: '-50px 0px 50px 0px',
        rootMargin: "-20%",
    }

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            // Determine the direction of the scrolling
            if (entry.boundingClientRect.y !== 0) {
                scrollingDirection = entry.boundingClientRect.y > entry.rootBounds.y ? "down" : "up";
            }

            const newItem = entry.target

            // Update the allLinks array to include the new item if it doesn't already exist
            allLinks.update((items) => {
                if (!items.includes(newItem)) {
                    items.push(newItem);
                }
                return items;
            });
            // If the current entry is intersecting with the viewport, add it to the visible set
            if (entry.isIntersecting) {
                if (scrollingDirection === "down") {
                    visible.add(newItem);
                } else {
                    visible = new Set([newItem, ...visible]);

                }
                // If the current entry is not intersecting with the viewport, remove it from the visible set
            } else {
                visible.delete(newItem);
            }
        });
        visibleLinks.set([...visible]);

        if ([...visible][0]) {
            selectedNode.set([...visible][0].getAttribute("data-id"))
            selectedNodeUniqueId.set([...visible][0].getAttribute("unique-id"))
        }

    }, options);

    const links = document.querySelectorAll(".markdown a[data-id]");
    links.forEach((link) => observer.observe(link));
}
