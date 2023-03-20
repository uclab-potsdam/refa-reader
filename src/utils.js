import { Api, visibleLinks, allLinks, selectedNode } from './stores.js';

export async function extractLinks(markdown) {
    const regex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*?>(.*?)<\/a>/g;
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
        visibleLinks.set([...visible]);
        selectedNode.set([...visible][0])
    }, options);

    const links = document.querySelectorAll(".markdown a[data-id]");
    links.forEach((link) => observer.observe(link));
}