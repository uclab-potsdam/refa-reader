<script>
	import Markdown from '@components/Markdown.svelte';
	import Graph from '@components/Graph.svelte';
	import { page } from '$app/stores';
	import { updatePosition, items, graphSteps } from '@store';
	import { onMount } from 'svelte';
	import { extractLinks, createTriplets } from '@utils';

	export let data;
	let textData, triplets, itemsJson;

	onMount(async () => {
		textData = [...data.posts].find((d) => d.path.includes($page.params.slug));
		itemsJson = await extractLinks(textData.text);
		triplets = await createTriplets(itemsJson);
		$items = triplets;
	});

	function handleScroll() {
		$updatePosition = true;
	}
	function resetNode() {
		$graphSteps = [];
	}
</script>

<svelte:window on:resize={handleScroll} />

{#if triplets != undefined}
	<article>
		<section
			class="markdown__container"
			on:scroll={() => {
				resetNode();
				handleScroll();
			}}
			on:click={handleScroll}
			on:keypress={handleScroll}
		>
			<h1>{textData.meta.title}</h1>
			<Markdown data={textData} items={itemsJson} />
		</section>
		<section
			class="graph__container"
			on:scroll={handleScroll}
			on:click={handleScroll}
			on:keypress={handleScroll}
		>
			<Graph data={$items} {handleScroll} />
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
