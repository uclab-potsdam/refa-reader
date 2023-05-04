<script>
	import { onMount } from 'svelte';
	import { Api, selectedNode, graphSteps } from '@stores';
	import { writable } from 'svelte/store';
	import Card from '@components/Card.svelte';
	import { createTriplets } from '@utils';
	export let updatePosition;

	let selectedData = [];

	export let handlePosition;
	export let data;

	const entities = writable([]);

	onMount(async () => {
		loadData(data.nodes, 10);
	});

	$: {
		if (data.links) {
			selectedData = data.links.filter((d) => {
				const path = `${Api}/resources/${$selectedNode}`;

				return (
					(d.target != path && d.source != d.target && d.source == path) ||
					(d.target != path && d.source != d.target && d.target == path)
				);
			});
		}
	}
	let initialStep = [];
	let selectedTriplets;

	$: {
		initialStep = selectedData.reduce((acc, cur) => {
			if (!acc.includes(cur.title)) {
				acc.push(cur);
			}
			return acc.sort((a, b) => {
				if (a.property) {
					return a.property.localeCompare(b.property);
				}
			});
		}, []);
	}

	async function openNode(node, index) {
		const response = await fetch(node.target);
		const data = await response.json();
		const items = [{ data }];

		selectedTriplets = await createTriplets(items);
		let selectedTripletsData = selectedTriplets.links.filter((d) => {
			return d.source === node.target || d.target === node.target;
		});

		// if ($graphSteps.length > index) {
		// 	$graphSteps = $graphSteps.splice(index, $graphSteps.length - index, {
		// 		id: node.target,
		// 		data: selectedTripletsData
		// 	});
		// 	console.log($graphSteps);
		// } else {
		// }

		$graphSteps = [
			...$graphSteps,
			{
				id: node.target,
				data: selectedTripletsData.sort((a, b) => {
					if (a.property) {
						return a.property.localeCompare(b.property);
					}
				})
			}
		];
	}

	function resetNode() {
		$graphSteps = [];
	}

	/**
	 * Loads data for the given nodes from the API in batches
	 * @param {Array} nodes An array of nodes with IDs
	 * @param {number} batchSize The size of every batch
	 * @returns {Array} An array of items with JSON-LD data and sets
	 */
	export async function loadData(nodes, batchSize) {
		const ids = nodes.map((d) => {
			const id = d.id.split('/');
			return id.slice(-1)[0];
		});

		const numBatches = Math.ceil(ids.length / batchSize);

		for (let i = 0; i < numBatches; i++) {
			const batchIds = ids.slice(i * batchSize, (i + 1) * batchSize);
			const query = `${Api}/items?${batchIds.map((id) => `id[]=${id}`).join('&')}`;
			const response = await fetch(query);
			const jsonItems = await response.json();

			entities.update((items) => {
				if (!items.includes(...jsonItems)) {
					items.push(...jsonItems);
				}
				return items;
			});
		}
	}
</script>

<div class="graph">
	{#if initialStep.length == 0}
		<div class="links">
			<h4 class="loading">Loading Graph...</h4>
		</div>
	{:else}
		<div class="links" on:scroll={handlePosition}>
			{#each initialStep as datum}
				<Card
					{entities}
					{updatePosition}
					{datum}
					on:click={() => {
						resetNode();
						openNode(datum, 0);
					}}
					on:keydown={() => {
						resetNode();
						openNode(datum, 0);
					}}
				/>
			{/each}
		</div>
		{#each $graphSteps as step, index}
			<div class="links" on:scroll={handlePosition}>
				{index + 1}
				{#each step.data as datum}
					<Card
						{entities}
						{updatePosition}
						{datum}
						on:click={() => {
							console;
							openNode(datum, index + 1);
						}}
						on:keydown={() => {
							openNode(datum, index + 1);
						}}
					/>
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
		width: 180px;
		flex-basis: 180px;
		flex-grow: 0;
		flex-shrink: 0;
		cursor: pointer;
		overflow: scroll;
	}
</style>
