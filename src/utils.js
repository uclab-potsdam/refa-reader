import { json } from "stream/consumers";
import { Api } from "./config.js";

export async function fetchFile(url) {
    const response = await fetch(url);
    const content = await response.text();
    return content;
}

export async function extractLinks(markdown) {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const itemUrls = [];
    const mediaUrls = [];
    const setUrls = [];
    const links = [];

    let match;
    while ((match = regex.exec(markdown))) {
        if (match[2].includes("http")) {
            continue
        }
        else {
            const label = match[1]
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
            links.push({ label, id: url.split("/")[1] });
        }
    }

    const itemQuery = `${Api}/items?${itemUrls.map((i) => `id[]=${i}`).join("&")}`;
    const setQuery = `${Api}/item_sets?${setUrls.map((i) => `id[]=${i}`).join("&")}`;
    const mediaQuery = `${Api}/medias?${mediaUrls.map((i) => `id[]=${i}`).join("&")}`;

    const [itemResponse, setResponse, mediaResponse] = await Promise.all([
        itemUrls.length ? fetch(itemQuery) : Promise.resolve({}),
        setUrls.length ? fetch(setQuery) : Promise.resolve({}),
        mediaUrls.length ? fetch(mediaQuery) : Promise.resolve({})
    ]);

    const [itemJsons, setJsons, mediaJsons] = await Promise.all([
        itemUrls.length ? itemResponse.json() : Promise.resolve([]),
        setUrls.length ? setResponse.json() : Promise.resolve([]),
        mediaUrls.length ? mediaResponse.json() : Promise.resolve([])
    ]);

    let parseitems = [...itemJsons, ...mediaJsons, ...setJsons]
    for (let i = 0; i < parseitems.length; i++) {
        const json = parseitems[i];
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
