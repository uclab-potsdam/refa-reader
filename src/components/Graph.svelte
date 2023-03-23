<script>
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { Api, graphData, selectedNode } from '../stores.js';
	import Paths from './Paths.svelte';
	import { extractLinks, createTriplets, loadData } from '../utils.js';
	export let data;

	let items = [];
	let triplets = [];
	let selectedData = [];
	let entities = [];

	onMount(async () => {
		items = await extractLinks(data);
		triplets = await createTriplets(items);
		entities = await loadData(triplets.nodes);
	});

	$: {
		if (triplets.links) {
			selectedData = triplets.links.filter((d) => {
				const path = `${Api}/resources/${$selectedNode}`;
				return d.source == path || d.target == path;
			});
		}
	}

	function getImageByNode(node) {
		const id = node.split('/');
		const datum = entities.find((d) => d['o:id'] == id.slice(-1)[0]);
		return datum?.thumbnail_display_urls?.large;
	}
</script>

<div class="graph">
	{#if triplets.length == 0}
		<h4 class="loading">Loading Graph...</h4>
	{:else}
		<div class="links">
			{#each selectedData as datum}
				<div class="link" data-id={datum.target.split('/').slice(-1)[0]} title={datum.title}>
					{#if getImageByNode(datum.target)}
						<div class="title">{datum.title}</div>
						<img src={getImageByNode(datum.target)} alt={datum.title} />
					{:else if datum.img}
						<div class="title">{datum.title}</div>
						<img src={datum.img} alt={datum.title} />
					{:else}
						<div class="title">{datum.title}</div>
					{/if}
					<Paths {datum}/>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.links {
		padding-left: 5rem;
		max-width: 300px;
	}

	.link {
		padding: 0.25rem 0.5rem;
		margin-bottom: 0.5rem;
		background-color: gainsboro;
	}

	.title {
		min-height: 50px;
		overflow-wrap: break-word;
	}

	img {
		width: 100%;
		object-fit: contain;
	}
</style>
