import { Api, visibleLinks, allLinks, selectedNode, entities } from './stores.js';

/**
 * Extracts links from a Markdown string.
 *
 * @param {string} markdown - The Markdown string to extract links from.
 * @returns {Array<object>} - An array of link objects.
 */
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

    // Create queries for each type of link
    const itemQuery = `${Api}/items?${itemUrls.map((i) => `id[]=${i}`).join("&")}`;
    const setQuery = `${Api}/item_sets?${setUrls.map((i) => `id[]=${i}`).join("&")}`;
    const mediaQuery = `${Api}/medias?${mediaUrls.map((i) => `id[]=${i}`).join("&")}`;

    // Fetch data for each type of link
    const [itemResponse, setResponse, mediaResponse] = await Promise.all([
        itemUrls.length ? fetch(itemQuery) : Promise.resolve({}),
        setUrls.length ? fetch(setQuery) : Promise.resolve({}),
        mediaUrls.length ? fetch(mediaQuery) : Promise.resolve({})
    ]);

    // Parse the JSON data for each type of link
    const [itemJsons, setJsons, mediaJsons] = await Promise.all([
        itemUrls.length ? itemResponse.json() : Promise.resolve([]),
        setUrls.length ? setResponse.json() : Promise.resolve([]),
        mediaUrls.length ? mediaResponse.json() : Promise.resolve([])
    ]);

    // Combine the JSON data into a single array
    let parseitems = [...itemJsons, ...mediaJsons, ...setJsons]

    // Loop through each link object and add additional data as needed
    for (let i = 0; i < parseitems.length; i++) {
        const json = parseitems[i];
        const link = links[i];

        // If the JSON data includes an "o:items" property, it is a set link
        if (json["o:items"]) {
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
                    set: {
                        id: json["o:id"],
                        title: json["o:title"]
                    }
                });
            });
        }
        else {
            link.data = json;
        }
    }

    return links;
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
 * Loads data for the given nodes from the API in batches
 * @param {Array} nodes An array of nodes with IDs
 * @returns {Array} An array of items with JSON-LD data and sets
 */
export async function loadData(nodes) {
    const batchSize = 40;

    // Extract IDs from nodes
    const ids = nodes.map((d) => {
        const id = d.id.split("/");
        return id.slice(-1)[0];
    });

    // Calculate number of batches required
    const numBatches = Math.ceil(ids.length / batchSize);

    // let data = []
    for (let i = 0; i < numBatches; i++) {
        // Get batch IDs
        const batchIds = ids.slice(i * batchSize, (i + 1) * batchSize);
        // Construct query string
        const query = `${Api}/items?${batchIds.map((id) => `id[]=${id}`).join("&")}`;
        // Fetch items from API
        const response = await fetch(query);
        const jsonItems = await response.json()
        // Append items to data array
        // data.push(...items);
        entities.update((items) => {
            if (!items.includes(...jsonItems)) {
                items.push(...jsonItems);
            }
            return items;
        });
    }
    // return data
}

/**
 * Parses JSON-LD data and extracts triplets for visualization.
 * @param {Object} jsonLD - The JSON-LD data to parse.
 * @param {Object} set - The set object that the JSON-LD data belongs to.
 * @returns {Array} An array of triplets for visualization.
 */
export function parseJSONLD(jsonLD, set) {
    let triplets = [];
    let source = `${Api}/resources/${jsonLD["o:id"]}`;

    // Add a triplet for the set if available
    if (set) {
        triplets.push({
            source: `${Api}/resources/${set.id}`,
            target: source,
            img: jsonLD?.thumbnail_display_urls?.large,
            title: jsonLD["o:title"],
        });
    }

    let parentKey;

    /**
     * Recursively parse the JSON-LD data and extract triplets.
     * @param {Object} obj - The current object to parse.
     */
    let parseRecursive = async function (obj) {
        for (let key in obj) {
            // Check if the key is "@id" and the value starts with the API base URL and has a title
            if (key === "@id" && obj[key].startsWith(Api) && (obj["o:title"] || obj.display_title)) {
                // Extract the target URL, title, and image
                let splitId = obj[key].split("/");
                let id = splitId[splitId.length - 1];
                const target = `${Api}/resources/${id}`;
                const title = obj["o:title"] || obj.display_title;
                const img = obj?.thumbnail_url || obj?.thumbnail_display_urls?.large;

                // Check if the source and target already exist in triplets array
                const exists = triplets.some(triplet => triplet.source === source && triplet.target === target);

                if (!exists) {
                    // Add a new triplet to the array
                    triplets.push({
                        source: source,
                        target: target,
                        title,
                        img,
                        property: obj["property_label"] || parentKey
                    });
                }
            }
            // Recursively parse child objects
            else if (typeof obj[key] === "object") {
                if (isNaN(key)) {
                    const parts = key?.split(":");
                    const label = parts[1]?.split("_")?.join(" ");
                    parentKey = label;
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
        rootMargin: '-10% 0% -10% 0%',
    }

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            // Determine the direction of the scrolling
            if (entry.boundingClientRect.y !== 0) {
                scrollingDirection = entry.boundingClientRect.y > entry.rootBounds.y ? "down" : "up";
            }

            const newItem = entry.target.getAttribute("data-id");
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
        selectedNode.set([...visible][0])
    }, options);

    const links = document.querySelectorAll(".markdown a[data-id]");
    links.forEach((link) => observer.observe(link));
}