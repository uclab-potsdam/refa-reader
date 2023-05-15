<script>
	import Markdown from '@components/Markdown.svelte';
	import Graph from '@components/Graph.svelte';
	import ItemDetail from '@components/ItemDetail.svelte';
	import { page } from '$app/stores';
	import { Api, items, graphSteps } from '@stores';
	import { onMount } from 'svelte';
	import { extractLinks, createTriplets } from '@utils';
	import { writable } from 'svelte/store';
	import { fly } from 'svelte/transition';

	export let data;
	let textData, triplets, itemsJson;

	const updatePosition = writable(false);
	const handlePosition = () => {
		$updatePosition = true;
	};

	let visibleItemsID = [];

	onMount(async () => {
		textData = [...data.posts].find((d) => d.path.includes($page.params.slug));
		itemsJson = await extractLinks(textData.text);
		visibleItemsID = itemsJson
			.filter((obj) => !obj.set)
			.map((obj) => `${Api}/resources/${obj.data?.['o:id']}`);
		triplets = await createTriplets(itemsJson);
		$items = triplets;
	});

	function resetNode() {
		$graphSteps = [];
	}
</script>

<svelte:window on:resize={handlePosition} />

{#if triplets != undefined}
	<article>
		<!-- {#if !$graphSteps || $graphSteps.length < 1} -->
		<section class="item__detail">
			<ItemDetail data={itemsJson} />
		</section>
		<!-- {/if} -->
		<section
			class="markdown__container"
			on:wheel={() => {
				resetNode();
				handlePosition();
			}}
			on:touchmove={() => {
				resetNode();
				handlePosition();
			}}
			on:click={() => {
				resetNode();
				handlePosition();
			}}
			on:keypress={handlePosition}
		>
			<h1>{textData.meta.title}</h1>
			<Markdown data={textData} items={itemsJson} />
		</section>
		<section
			class="graph__container"
			on:scroll={handlePosition}
			on:click={handlePosition}
			on:keypress={handlePosition}
		>
			<Graph data={$items} {visibleItemsID} {handlePosition} {updatePosition} />
		</section>
	</article>
{/if}

<style>
	article {
		display: flex;
		height: calc(100vh - 1rem);
		/* padding: 1rem 0 0 0; */
	}

	h1 {
		margin-bottom: 1rem;
	}

	.markdown__container {
		flex: 0 0 450px;
		width: 450px;
		overflow-x: scroll;
	}

	.graph__container {
		flex: 3;
	}

	.item__detail {
		flex: 1;
		max-width: 200px;
		border-right: 1px solid #e3e3e3;
		/* background-color: #e3e3e3; */
	}

	.markdown__container {
		padding: 0.5rem 0rem 0 1rem;
		/* min-width: 700px; */
	}

	@media only screen and (max-width: 600px) {
		.item__detail,
		.graph__container {
			display: none;
		}
	}
</style>
