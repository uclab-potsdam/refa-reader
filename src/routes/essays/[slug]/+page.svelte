<script>
	import Markdown from '../../../components/Markdown.svelte';
	import Graph from '../../../components/Graph.svelte';
	import { page } from '$app/stores';
	import { updatePosition, items } from '../../../stores';
	import { onMount } from 'svelte';
	import { extractLinks } from '../../../utils';

	export let data;
	let datum;

	onMount(async () => {
		datum = [...data.posts].find((d) => d.path.includes($page.params.slug));
		// $items = await extractLinks(datum.text);
	});

	function handleScroll() {
		$updatePosition = true;
	}
</script>

{#if datum != undefined}
	<article>
		<section
			class="markdown__container"
			on:scroll={handleScroll}
			on:click={handleScroll}
			on:keypress={handleScroll}
		>
			<h1>{datum.meta.title}</h1>
			<Markdown data={datum} />
		</section>
		<section
			class="graph__container"
			on:scroll={handleScroll}
			on:click={handleScroll}
			on:keypress={handleScroll}
		>
			<Graph data={datum.text} />
		</section>
	</article>
{/if}

<style>
	article {
		display: flex;
		height: 100vh;
	}

	section {
		flex: 1;
		overflow: scroll;
	}

	.markdown__container {
		padding: 2rem 1rem 0 2rem;
		min-width: 700px;
	}
</style>
