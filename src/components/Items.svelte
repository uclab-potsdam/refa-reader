<script>
    import { showItemDetail } from "../stores";
    import SvgContainer from "./SvgContainer.svelte";
    import ItemDetail from "./ItemDetail.svelte";
    import { fade, slide, fly } from "svelte/transition";
</script>

<div class="items">
    {#if $showItemDetail}
        <div class="metadata" transition:fly={{ x: -600, duration: 250 }}>
            <ItemDetail />
        </div>
    {/if}
    <SvgContainer />
</div>

<style>
    .items {
        display: flex;
        flex: 1;
    }
</style>
