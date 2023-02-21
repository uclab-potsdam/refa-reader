<script>
    import { onMount } from "svelte";
    import { selectedNode } from "../stores.js";
    import { parseProperties } from "../functions.js";

    let selections = new Map(); // Use a Map to store the selections and their keys
    let selection;

    onMount(async () => {
        selectedNode.subscribe(async (value) => {
            if (selections.has(value.id)) {
                // Check if the selection has already been made
                selection = selections.get(value.id); // Use the cached selection if it exists
            } else {
                if (value.id) {
                    try {
                        const response = await fetch(value.id);
                        selection = await response.json();
                        selections.set(value.id, selection); // Store the new selection in the Map
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        });

        // if (selections.has($selectedNode.id)) {
        //     // Check if the selection has already been made
        //     selection = selections.get($selectedNode.id); // Use the cached selection if it exists
        // } else {
        //     if ($selectedNode.id) {
        //         try {
        //             const response = await fetch($selectedNode.id);
        //             selection = await response.json();
        //             selections.set($selectedNode.id, selection); // Store the new selection in the Map
        //         } catch (error) {
        //             console.error(error);
        //         }
        //     }
        // }
    });

    let parsedProperties;
    $: {
        parsedProperties = parseProperties(selection);
    }
</script>

<div class="detail">
    {#if selection}
        <h1>
            {selection["o:title"]}
        </h1>
        {#if selection?.thumbnail_display_urls?.large}
            <img
                src={selection?.thumbnail_display_urls?.large}
                alt={selection["o:title"]}
            />
        {/if}
        {#each parsedProperties as property}
            {#if property != undefined}
                <h4><strong>{property.property}</strong>: <em>{property.title}</em></h4>
            {/if}
        {/each}
    {/if}
</div>

<style>
    .detail {
        /* flex: 1; */
        left: 0;
        width: 400px;
        height: calc(100vh - 20px);
        padding: 8px;
        overflow: scroll;
        position: absolute;
        z-index: 1;
        box-shadow:0 9px 10px 1px black;
    }

    img {
        width: 100%;
    }
</style>
