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
    let svg, links, nodes, entities, simulation;

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
        entities = [
            ...$graphData.entities.map((d) =>
                Object.assign(d, { class: "entities" })
            ),
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

    function zoomed(currentEvent) {
        $showItemDetail = false;
        transform = currentEvent.transform;
        simulationUpdate();
    }

    function simulationUpdate() {
        if (simulation.alpha() < 0.01) {
            simulation.stop();
        }
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

    function openDetail(node) {
        $showItemDetail = true;
        highlightLinks(node);
    }

    function getImageByNode(node) {
        const id = node.id.split("/");
        const datum = entities.find((d) => d["o:id"] == id.slice(-1)[0]);
        return datum?.thumbnail_display_urls?.fav
    }
</script>

<div class="graph" bind:clientWidth={width} bind:clientHeight={height}>
    <svg bind:this={svg} {width} {height}>
        <g class="links">
            {#each links as link}
                <!-- {#if link.class == "link-highlite"} -->
                <g class={link.class} stroke-width="1" fill="none">
                    <path
                        d={linkArc(link)}
                        data-attr={link.source.id}
                        transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
                    />
                </g>
                <!-- {/if} -->
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
                        {#if getImageByNode(node)}
                            <img src={getImageByNode(node)} alt={node.title} />
                            <div class="title">{node.title}</div>
                        {:else}
                            <div class="title">{node.title}</div>
                        {/if}
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
