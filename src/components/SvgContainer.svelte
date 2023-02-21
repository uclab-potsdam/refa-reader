<script>
    import { onMount, onDestroy } from "svelte";
    import {
        graphData,
        visibleLinks,
        allLinks,
        selectedNode,
        scrolled,
        showItemDetail,
    } from "../stores";
    import { observe } from "../functions.js";
    import { zoom, zoomIdentity } from "d3-zoom";
    import { select } from "d3-selection";
    import { drag } from "d3-drag";
    import PQueue from "p-queue";

    const queue = new PQueue({ concurrency: 5 }); // Limit the concurrent requests

    import {
        forceSimulation,
        forceLink,
        forceCenter,
        forceCollide,
        forceManyBody,
        forceRadial,
    } from "d3-force";

    let d3 = {
        zoom,
        zoomIdentity,
        select,
        drag,
        forceSimulation,
        forceLink,
        forceRadial,
        forceCenter,
        forceCollide,
        forceManyBody,
    };

    const nodeSize = 240;
    let width = 0;
    let height = 0;
    let transform = d3.zoomIdentity;
    let svg, links, nodes, simulation;

    const d3zoom = d3
        .zoom()
        .scaleExtent([1 / 8, 1 / 1])
        .on("zoom", zoomed);

    $: {
        d3.select(svg).call(d3zoom);
        d3.select(svg).call(
            d3zoom.transform,
            d3.zoomIdentity.translate(width / 2, height / 2).scale(0.1)
        );
    }

    $: {
        links = [
            ...$graphData.links.map((d) => Object.assign(d, { class: "link" })),
        ];
        nodes = [
            ...$graphData.nodes.map((d) => Object.assign(d, { class: "node" })),
        ];
        runSimulation();
    }

    $: {
        if ($visibleLinks.length > 0 && $scrolled == true) {
            zoomToNode($visibleLinks[0]);
        }
    }

    $: {
        if ($selectedNode.length > 0) {
            zoomToNode($selectedNode);
        }
    }

    onMount(() => {
        runSimulation();
        observe();
    });

    onDestroy(() => {
        simulation.stop();
    });

    function runSimulation() {
        simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3
                    .forceLink(links)
                    .id((d) => d.id)
                    .strength(1)
                // .distance(10)
            )
            .force("charge", d3.forceManyBody().strength(-nodeSize))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(nodeSize / 2 + 10))
            .on("tick", simulationUpdate);
    }

    function zoomToNode(item) {
        const nodeToZoom = nodes.find((node) => node.id === item);
        if (!nodeToZoom) {
            return;
        }

        const zoomTransform = d3.zoomIdentity
            .scale(0.8)
            .translate(width / 2 - nodeToZoom.x, height / 2 - nodeToZoom.y);

        d3.select(svg)
            .transition()
            .duration(500)
            .call(d3zoom.transform, zoomTransform);

        simulationUpdate();
        highlightLinks(nodeToZoom);
    }

    // let prevNodeId;
    // function zoomToNode(item) {
    //     const nodeToZoom = nodes.find((node) => node.id === item);
    //     if (nodeToZoom) {
    //         // adapt the simulation to the center
    //         if (prevNodeId) {
    //             const prevSelectedNode = nodes.find((node) => node.id === prevNodeId);
    //             prevSelectedNode.fx = null;
    //             prevSelectedNode.fy = null;
    //         }

    //         nodeToZoom.fx = width / 2;
    //         nodeToZoom.fy = height / 2;

    //         simulation
    //             .force("charge", d3.forceManyBody().strength(-50))
    //             .force("collision", d3.forceCollide().radius(150))
    //             .alphaTarget(0.3)
    //             .restart();

    //         prevNodeId = item

    //         // zoom to the center
    //         const zoomTransform = d3.zoomIdentity
    //             .scale(0.8)
    //             .translate(
    //                 width / 2 - nodeToZoom.fx,
    //                 height / 2 - nodeToZoom.fy
    //             );

    //         d3.select(svg)
    //             .transition()
    //             .duration(500)
    //             .call(d3zoom.transform, zoomTransform);

    //         simulationUpdate();
    //         highlightLinks(nodeToZoom);
    //     }
    // }

    function zoomed(currentEvent) {
        $showItemDetail = false;
        transform = currentEvent.transform;
        simulationUpdate();
    }

    function simulationUpdate() {
        nodes = [...nodes];
        links = [...links];
    }

    function linkArc(d) {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `M${d.source.x},${d.source.y} A${r},${r} 0 0,1 ${d.target.x},${d.target.y}`;
    }

    function highlightLinks(node) {
        // "z-index" on the selected links
        if (node) {
            $selectedNode = node;
            links = links.sort((a, b) => {
                if (
                    a.source.id === node.id ||
                    a.target.id === node.id ||
                    b.source.id === node.id ||
                    b.target.id === node.id
                ) {
                    return 1;
                }
                return -1;
            });
            links.forEach((link) => {
                if (link.source.id === node.id || link.target.id === node.id) {
                    link.class = "link-highlite";
                } else {
                    link.class = "link";
                }
            });
            simulationUpdate();
        }
    }

    const thumbnailCache = {};
    async function nodeHasThumbnail(nodeId) {
        if (thumbnailCache[nodeId]) {
            // Return cached response if available
            return thumbnailCache[nodeId];
        }

        try {
            const response = await queue.add(() => fetch(nodeId)); // Add request to queue
            const data = await response.json();

            // ignoring itemsets images
            if (!data["@type"].includes("o:ItemSet")) {
                const thumbnailUrl = data?.thumbnail_display_urls?.fav;
                const result = {
                    hasThumbnail: thumbnailUrl != null,
                    thumbnailUrl,
                };
                thumbnailCache[nodeId] = result; // Cache response
                return result;
            } else {
                return { hasThumbnail: false, thumbnailUrl: null };
            }
        } catch (error) {
            return { hasThumbnail: false, thumbnailUrl: null };
        }
    }

    function openDetail(node) {
        $showItemDetail = true;
        highlightLinks(node);
    }
</script>

<div class="graph" bind:clientWidth={width} bind:clientHeight={height}>
    <svg bind:this={svg} {width} {height}>
        <g class="links">
            {#each links as link}
                {#if link.class == "link-highlite"}
                    <g class={link.class} stroke-width="1" fill="none">
                        <path
                            d={linkArc(link)}
                            data-attr={link.source.id}
                            transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
                        />
                    </g>
                {/if}
            {/each}
            <!-- {#each links as link}
                <g class={link.class} stroke-width="1" fill="none">
                    <line
                        x1={link.source.x}
                        y1={link.source.y}
                        x2={link.target.x}
                        y2={link.target.y}
                        data-attr={link.source.id}
                        transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
                    />
                </g>
            {/each} -->
        </g>
        <g class="nodes">
            {#each nodes as node}
                <g
                    class={$selectedNode.id == node.id
                        ? "label selection"
                        : $visibleLinks.includes(node.id)
                        ? "label node-highlite"
                        : $allLinks.includes(node.id)
                        ? "label node"
                        : "label link"}
                    on:click={() => openDetail(node)}
                    on:keydown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            openDetail(node);
                        }
                    }}
                    transform="translate({transform.x}
                {transform.y - 5}) scale({transform.k}
                {transform.k})"
                    data-attr={node.id}
                >
                    <foreignObject
                        requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                        width={nodeSize}
                        height={nodeSize - nodeSize / 3}
                        x={node.x - 2}
                        y={node.y - 2}
                    >
                        {#await nodeHasThumbnail(node.id)}
                            <div class="title">{node.title}</div>
                        {:then thumbnailData}
                            {#if thumbnailData.hasThumbnail}
                                <img
                                    src={thumbnailData.thumbnailUrl}
                                    alt={node.title}
                                />
                                <div class="title">{node.title}</div>
                            {:else}
                                <div class="title">{node.title}</div>
                            {/if}
                        {:catch error}
                            <p>Error: {error.message}</p>
                        {/await}
                    </foreignObject>
                </g>
            {/each}
        </g>
    </svg>
</div>

<style>
    .graph {
        flex: 2;
        user-select: none;
        cursor: move;
        cursor: grab;
        cursor: -moz-grab;
        cursor: -webkit-grab;
    }

    .label {
        cursor: pointer;
    }

    .title {
        padding: 1px;
        width: fit-content;
    }

    .graph:active {
        cursor: grabbing;
        cursor: -moz-grabbing;
        cursor: -webkit-grabbing;
    }
</style>
