<script>
	import { onMount } from 'svelte';
	import { Api, selectedNode, graphSteps } from '@stores';
	import Paths from './Paths.svelte';
	import { loadData, createTriplets } from '@utils';

	let selectedData = [];
	let entities = [];

	export let handleScroll;
	export let data;

	onMount(async () => {
		entities = await loadData(data.nodes);
	});

	$: {
		if (data.links) {
			selectedData = data.links.filter((d) => {
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

	function resetNode() {
		$graphSteps = [];
	}

	async function openNode(node) {
		const response = await fetch(node.target);

		// keeping the structure as it wants the createTriplets(), will change at some point
		const items = [{ data: await response.json() }];
		let selectedTriplets = await createTriplets(items);

		let selectedTripletsData = selectedTriplets.links.filter((d) => {
			return d.source == node.target || d.target == node.target;
		});

		$graphSteps = [...$graphSteps, { id: node.target, data: selectedTripletsData }];
	}
</script>

<div class="graph">
	{#if data.nodes.length == 0}
		<div class="links">
			<h4 class="loading">Loading Graph...</h4>
		</div>
	{:else}
		<div class="links" on:scroll={handleScroll}>
			{#each selectedData as datum}
				<div
					class="link"
					data-id={datum.target.split('/').slice(-1)[0]}
					title={datum.title}
					on:click={() => {
						resetNode();
						openNode(datum);
					}}
					on:keydown={() => {
						resetNode();
						openNode(datum);
					}}
				>
					{#if getImageByNode(datum.target)}
						<img src={getImageByNode(datum.target)} alt={datum.title} />
					{:else if datum.img}
						<img src={datum.img} alt={datum.title} />
					{:else}
						<div class="title">{datum.title}</div>
					{/if}
				</div>
				<Paths {datum} label={datum.property ? datum.property : ''} />
			{/each}
		</div>
		{#each $graphSteps as step}
			<div class="links" on:scroll={handleScroll}>
				{#each step.data as datum}
					<div
						class="link"
						data-id={datum.target.split('/').slice(-1)[0]}
						title={datum.title}
						on:click={() => {
							openNode(datum);
						}}
						on:keydown={() => {
							openNode(datum);
						}}
					>
						{#if getImageByNode(datum.target)}
							<img src={getImageByNode(datum.target)} alt={datum.title} />
						{:else if datum.img}
							<img src={datum.img} alt={datum.title} />
						{:else}
							<div class="title">{datum.title}</div>
						{/if}
					</div>
					<Paths {datum} label={datum.property ? datum.property : ''} />
				{/each}
			</div>
		{/each}
	{/if}
</div>

<style>
	.graph {
		display: flex;
	}
	.links {
		height: 100vh;
		padding-top: 1rem;
		padding-left: 10vw;
		min-width: 100px;
		max-width: 150px;
		cursor: pointer;
		overflow: scroll;
	}

	.link {
		background-color: #ececec;
		padding: 0.25rem 0.5rem;
		margin-bottom: 0.5rem;
	}

	.title {
		font-size: 0.7rem;
		overflow-wrap: break-word;
	}

	img {
		padding-top: 0.5rem;
		width: 100%;
		object-fit: contain;
	}
</style>
