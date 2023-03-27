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
					<Paths {datum} label={datum.property ? datum.property : ""}/>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.graph {
		/* background-color: gainsboro; */
	}

	.links {
		padding-left: 200px;
		max-width: 300px;
	}

	.link {
		background-color: gainsboro;
		padding: 0.25rem 0.5rem;
		margin-bottom: 0.5rem;
	}

	.title {
		font-size: .7rem;
		overflow-wrap: break-word;
	}

	img {
		padding-top: .5rem;
		width: 100%;
		object-fit: contain;
	}
</style>
