<script>
	import { onMount } from 'svelte';
	import { Api, selectedNode, graphSteps } from '@stores';
	import Paths from '@components/Paths.svelte';
	import Card from '@components/Card.svelte';
	import { loadData, createTriplets } from '@utils';

	let selectedData = [];

	export let handleScroll;
	export let data;

	onMount(async () => {
		await loadData(data.nodes);
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
			return acc;
		}, []);
	}

	// let uniqueTriplets;

	// $: {
	// 	if (selectedTriplets) {
	// 		const newNodes = selectedTriplets?.links?.filter(
	// 			(node) => !initialStep.includes(node.target)
	// 		);

	// 		uniqueTriplets = [...initialStep, ...newNodes];
	// 	}
	// 	console.log('unique', uniqueTriplets);
	// }

	async function openNode(node) {
		const response = await fetch(node.target);
		const data = await response.json();
		const items = [{ data }];

		selectedTriplets = await createTriplets(items);
		let selectedTripletsData = selectedTriplets.links.filter((d) => {
			return d.source === node.target || d.target === node.target;
		});

		$graphSteps = [...$graphSteps, { id: node.target, data: selectedTripletsData }];
	}

	function resetNode() {
		$graphSteps = [];
	}
</script>

<div class="graph">
	{#if initialStep.length == 0}
		<div class="links">
			<h4 class="loading">Loading Graph...</h4>
		</div>
	{:else}
		<div class="links" on:scroll={handleScroll}>
			{#each initialStep as datum}
				<Card
					{datum}
					on:click={() => {
						resetNode();
						openNode(datum);
					}}
					on:keydown={() => {
						resetNode();
						openNode(datum);
					}}
				/>
				<Paths {datum} label={datum.property ? datum.property : ''} />
			{/each}
		</div>
		{#each $graphSteps as step}
			<div class="links" on:scroll={handleScroll}>
				{#each step.data as datum}
					<Card
						{datum}
						on:click={() => {
							openNode(datum);
						}}
						on:keydown={() => {
							openNode(datum);
						}}
					/>
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
		width: 180px;
		flex-basis: 180px;
		flex-grow: 0;
		flex-shrink: 0;
		cursor: pointer;
		overflow: scroll;
	}
</style>
