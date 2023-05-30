<script>
	import Markdown from '@components/Markdown.svelte';
	import Graph from '@components/Graph.svelte';
	import ItemDetail from '@components/ItemDetail.svelte';
	import { page } from '$app/stores';
	import { Api, items, graphSteps } from '@stores';
	import { onMount } from 'svelte';
	import { extractLinks, createTriplets } from '@utils';
	import { writable } from 'svelte/store';

	export let data;
	let textData, triplets, itemsJson;
	let visibleItemsID = [];

	const updatePosition = writable(false);
	const handlePosition = () => {
		$updatePosition = true;
	};

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

<svelte:window on:resize={handlePosition} on:scroll={handlePosition} />

{#if triplets != undefined}
	<article style="--theme-color: {textData.meta?.color || 'blue'}">
		<section class="item__detail">
			<ItemDetail data={itemsJson} />
		</section>
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
		<section class="graph__container" on:click={handlePosition} on:keypress={handlePosition}>
			<Graph data={$items} {visibleItemsID} {handlePosition} {updatePosition} />
		</section>
	</article>
{/if}

<style>
	article {
		display: flex;
		height: calc(100vh - 1rem);
		position: relative;
	}

	path {
		pointer-events: visibleStroke;
		stroke: #969696;
		stroke-width: 0.2;
		cursor: pointer;
		fill: none;
	}
	h1 {
		margin-bottom: 1rem;
	}

	.markdown__container {
		padding: 0.5rem 0rem 0 1rem;
		flex: 0 0 600px;
		overflow-x: scroll;
	}

	.graph__container {
		flex: 3;
	}

	.item__detail {
		flex: 0 0 300px;
		border-right: 1px solid #e3e3e3;
	}

	@media only screen and (max-width: 600px) {
		article {
			height: 180vh;
		}

		.markdown__container::before {
			content: 'This website contains complex visualizations that are not supported by small screen formats. To navigate the essays, go to your desktop browser.';
			display: block;
			font-size: 28px;
			padding: 1rem;
		}

		.item__detail {
			flex: 0 0 200px;
		}
		.graph__container {
			display: none;
		}
	}
</style>
