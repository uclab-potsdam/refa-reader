<script>
	import { onMount } from 'svelte';
	import { Api, selectedNode, graphSteps } from '@stores';
	import Card from '@components/Card.svelte';
	import { loadData, createTriplets } from '@utils';
	export let updatePosition;

	let selectedData = [];

	export let handlePosition;
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
		$graphSteps = [...$graphSteps, { id: node.target, data: selectedTripletsData }];
		// console.log($graphSteps);
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
		<div class="links" on:scroll={handlePosition}>
			{#each initialStep as datum}
				<Card
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
