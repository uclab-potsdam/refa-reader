<script>
	import Markdown from '@components/Markdown.svelte';
	import Graph from '@components/Graph.svelte';
	import { page } from '$app/stores';
	import { Api, items, graphSteps } from '@stores';
	import { onMount } from 'svelte';
	import { extractLinks, createTriplets } from '@utils';
	import { writable } from 'svelte/store';
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
		<section
			class="markdown__container"
			on:scroll={() => {
				resetNode();
				handlePosition();
			}}
			on:click={handlePosition}
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
		height: 100vh;
	}

	section {
		overflow: scroll;
	}

	.markdown__container {
		flex: 1;
	}
	.graph__container {
		flex: 2;
	}

	.markdown__container {
		padding: 2rem 1rem 0 2rem;
		/* min-width: 700px; */
	}
</style>
