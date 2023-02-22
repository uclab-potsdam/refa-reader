import { json } from "stream/consumers";
import { Api } from "./config.js";
import { visibleLinks, allLinks } from "./stores";

export async function fetchFile(url) {
    const response = await fetch(url);
    const content = await response.text();
    return content;
}

export async function extractLinks(markdown) {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const urlsToFetch = [];
    const links = [];

    let match;
    while ((match = regex.exec(markdown))) {
        // ignore normal links
        if (match[2].includes("http")) {
            continue
        }
        else {
            urlsToFetch.push(match[2]);
            links.push({ label: match[1], url: match[2] });
        }
    }

    // replace with resources
    const query = `${Api}/items?${urlsToFetch.map((i) => `id[]=${i}`).join("&")}`

    const response = await fetch(query);
    const jsons = await response.json();

    for (let i = 0; i < jsons.length; i++) {
        const json = jsons[i];
        const link = links[i];

        // load item sets
        if (json["o:items"]) {
            link.data = json;
            link.set = {
                id: json["o:id"],
                title: json["o:title"]
            };
            const items = json["o:items"]["@id"];
            const responseSet = await fetch(items);
            const jsonSet = await responseSet.json();
            jsonSet.forEach(item => {
                links.push({
                    label: item["o:title"],
                    url: item["@id"],
                    data: item,
                    set: {
                        id: json["o:id"],
                        title: json["o:title"]
                    }
                });
            });
        }
        // load normal item
        else {
            link.data = json;
        }
    }

    return links;
}

export async function createTriplets(data) {
    let allTriplets = [];
    // Open all links and create a new object with the triples generated
    for (let i = 0; i < data.items.length; i++) {
        if (data.items[i].data) {
            let jsonLD = data.items[i].data;
            let set = data.items[i].set || null;
            let triplets = parseJSONLD(jsonLD, set);
            allTriplets = [...allTriplets, ...triplets];
        }
    }

    // Create the nodes and links as d3 likes
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

    const entities = await loadImages(graph.nodes);
    return { ...graph, entities };
}

export async function loadImages(nodes) {
    const batchSize = 100;

    const ids = nodes.map((d) => {
        const id = d.id.split("/");
        return id.slice(-1)[0];
    });

    const numBatches = Math.ceil(ids.length / batchSize);

    let data = []
    for (let i = 0; i < numBatches; i++) {
        const batchIds = ids.slice(i * batchSize, (i + 1) * batchSize);
        const query = `${Api}/items?${batchIds.map((id) => `id[]=${id}`).join("&")}`;
        const response = await fetch(query);
        const items = await response.json()
        data.push(...items);
    }
    return data
}


export function parseJSONLD(jsonLD, set) {
    let triplets = [];
    let source = `${Api}/resources/${jsonLD["o:id"]}`;

    if (set) {
        triplets.push(
            {
                source: `${Api}/resources/${set.id}`,
                target: source,
                title: jsonLD["o:title"],
            },
        );
    }
    let parseRecursive = async function (obj) {
        for (let key in obj) {
            if (key === "@id" && obj[key].startsWith(Api) && (obj["o:title"] || obj.display_title)) {
                let splitId = obj[key].split("/")
                let id = splitId[splitId.length - 1];

                const target = `${Api}/resources/${id}`;
                const title = obj["o:title"] || obj.display_title;

                triplets.push({
                    source: source,
                    target: target,
                    title: title,
                    property: obj["property_label"]
                });


            } else if (typeof obj[key] === "object") {
                parseRecursive(obj[key]);
            }
        }
    };
    parseRecursive(jsonLD);
    return triplets;
}

export function parseProperties(obj) {
    if (obj) {

        let triplets = [];
        let source = `${Api}/resources/${obj["o:id"]}`;
        let propertyLabel;
        let checkLabel = false
        let parseRecursive = function (obj) {

            for (let key in obj) {

                // check reverted properties 
                if (checkLabel == true) {
                    propertyLabel = key
                    checkLabel = false
                }

                if (key == "@reverse") {
                    checkLabel = true
                }

                if (key === "@id" && obj[key].startsWith(Api) && (obj["o:title"] || obj.display_title)) {
                    let splitId = obj[key].split("/")
                    let id = splitId[splitId.length - 1];

                    let target = `${Api}/resources/${id}`;
                    let title = obj["o:title"] || obj.display_title;

                    triplets.push({
                        source: source,
                        target: target,
                        title: title,
                        property: obj["property_label"] || propertyLabel
                    });

                } else if (typeof obj[key] === "object") {
                    parseRecursive(obj[key]);
                }
            }
        };
        parseRecursive(obj);
        return triplets;
    }
};

export function observe() {
    let visible = new Set();
    let scrollingDirection;

    const options = {
        rootMargin: '0px 0px -20% 0px',
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
        // console.log([...visible])
        visibleLinks.set([...visible]);
    }, options);

    const links = document.querySelectorAll(".markdown a[data-id]");
    links.forEach((link) => observer.observe(link));
}
