<script>
    import { onMount, onDestroy } from "svelte";
    import {
        graphData,
        visibleLinks,
        selectedNode,
        allLinks,
        selectedMarkdown,
    } from "../stores";
    import { observe } from "../utils";
    import { zoom, zoomIdentity } from "d3-zoom";
    import { select } from "d3-selection";
    import { drag } from "d3-drag";

    let d3 = {
        zoom,
        zoomIdentity,
        select,
        drag,
    };

    let svg, links, nodes, entities, render;

    $: {
        links = [
            ...$graphData.links.map((d) => Object.assign(d, { class: "link" })),
        ];

        nodes = $graphData.nodes.map((d) =>
            Object.assign(d, { class: "node" })
        );
        entities = [
            ...$graphData.entities.map((d) =>
                Object.assign(d, { class: "entities" })
            ),
        ];
        console.log($graphData);
    }

    onMount(() => {
        observe();
    });

    function linkArc(d) {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `M${d.source.x},${d.source.y} A${r},${r} 0 0,1 ${d.target.x},${d.target.y}`;
    }

    function getImageByNode(node, q = "fav") {
        const id = node.split("/");
        const datum = entities.find((d) => d["o:id"] == id.slice(-1)[0]);

        if (id.slice(-1)[0] == "18742") {
            console.log(
                id.slice(-1)[0],
                datum,
                entities.find((d) => d["o:id"] == "18742")
            );
        }
        if (datum) {
            return datum?.thumbnail_display_urls?.[q];
        }
    }
</script>

<div class="space" />
<div class="items">
    <div class="nodes">
        <!-- {#each nodes as node}
            {#if [$visibleLinks[0]].includes(node.id)}
                <div class="node">
                    {#if getImageByNode(node.id, "large")}
                        <h1 class="title">{node.title}</h1>
                        <img
                            src={getImageByNode(node.id, "large")}
                            alt={node.title}
                        />
                    {:else}
                        <h1 class="title">{node.title}</h1>
                    {/if}
                </div>
            {/if}
        {/each} -->
        {#each links as link}
            {#if [$visibleLinks[0]].includes(link.source) && $visibleLinks[0] != link.target}
                <div class="link">
                    {#if getImageByNode(link.target, "medium")}
                        <img
                            src={getImageByNode(link.target, "medium")}
                            alt={link.title}
                        />
                        <span class="title">{link.title}</span>
                        <!-- {:else if getImageByNode(link.target, "fav")}
                        <img
                            src={getImageByNode(link.target, "fav")}
                            alt={link.title}
                        />
                        <span class="title">{link.title}</span> -->
                    {:else}
                        <div class="title">{link.title}</div>
                    {/if}
                </div>
            {/if}
        {/each}
    </div>
</div>

<style>
    .space {
        flex: 2;
    }

    .items {
        flex: 2;
        overflow: scroll;
    }

    .link {
        min-height: 50px;
        padding-bottom: 1rem;
    }

    .node img {
        width: 100%;
        max-height: 150px;
        object-fit: contain;
    }

    img {
        width: 5rem;
    }
</style>
