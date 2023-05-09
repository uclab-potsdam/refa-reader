<script>
	import { onMount } from 'svelte';
	import { Api, selectedNode, graphSteps } from '@stores';
	import { writable } from 'svelte/store';
	import Card from '@components/Card.svelte';
	import Paths from '@components/Paths.svelte';
	import { createTriplets } from '@utils';

	export let updatePosition;
	export let handlePosition;
	export let data;
	export let visibleItemsID;
	export let highliteNode;

	const entities = writable([]);

	let selectedData = [];
	let initialStep = [];

	let selectedTriplets = { nodes: [], links: [] };
	let markdownNodes = data.nodes.filter((d) => visibleItemsID.includes(d.id));

	onMount(async () => {
		loadData(data.nodes, 50);
	});

	$: {
		if (data.links) {
			selectedData = data.links.filter((d) => {
				const path = `${Api}/resources/${$selectedNode}`;
				highliteNode = path;
				return (
					(d.target != path && d.source != d.target && d.source == path) ||
					(d.target != path && d.source != d.target && d.target == path)
				);
			});
		}
	}

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

	$: columnNodes = $graphSteps.map((obj) => obj.data).flat();

	function updateNodes(nodes, selectedNodes) {
		return selectedNodes.filter(
			(selectedNode) => !nodes.some((node) => node.title === selectedNode.title)
		);
	}

	async function openNode(node, index) {
		const response = await fetch(node.target);
		const data = await response.json();
		const items = [{ data }];

		selectedTriplets = await createTriplets(items);
		let selectedTripletsData = selectedTriplets.links.filter((d) => {
			return d.source === node.target || d.target === node.target;
		});

		// Remove all elements in $graphSteps after the given index
		$graphSteps.splice(index + 1, $graphSteps.length - (index + 1));

		let newNodes = updateNodes(
			[...markdownNodes, ...initialStep, ...columnNodes],
			selectedTripletsData
		);

		// Replace the element at the given index with the new data
		$graphSteps[index] = {
			id: node.target,
			data: selectedTripletsData.sort((a, b) => {
				if (a.property) {
					return a.property.localeCompare(b.property);
				}
			}),
			new: newNodes
		};

		if (newNodes.length > 0) {
			loadData(newNodes, 50);
		}

		highliteNode = node.target;
	}

	function resetNode() {
		$graphSteps = [];
	}

	async function loadData(nodes, batchSize) {
		const ids = nodes.map((d) => {
			const id = d?.id?.split('/') || d?.target?.split('/');
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
	{#if entities.length == 0}
		<div class="links">
			<h4 class="loading">Loading Graph...</h4>
		</div>
	{:else}
		<div class="links" on:scroll={handlePosition}>
			{#each initialStep as datum}
				{#if !markdownNodes.find((d) => d.title == datum.title)}
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
					{#if datum.source && datum.target}
						<Paths
							{datum}
							{updatePosition}
							{highliteNode}
							label={datum.property ? datum.property : ''}
						/>
					{/if}
				{:else if datum.source && datum.target}
					<Paths
						{datum}
						{updatePosition}
						{highliteNode}
						label={datum.property ? datum.property : ''}
					/>
				{/if}
			{/each}
		</div>
		{#each $graphSteps as step, index}
			<div class="links" on:scroll={handlePosition}>
				{#each step.data as datum}
					{#if step.new.some((existingNode) => existingNode.title === datum.title)}
						<Card
							{entities}
							{updatePosition}
							{datum}
							on:click={() => {
								openNode(datum, index + 1);
							}}
							on:keydown={() => {
								openNode(datum, index + 1);
							}}
						/>
						{#if datum.source && datum.target}
							<Paths
								{datum}
								{updatePosition}
								{highliteNode}
								label={datum.property ? datum.property : ''}
							/>
						{/if}
					{:else if datum.source && datum.target}
						<Paths
							{datum}
							{updatePosition}
							{highliteNode}
							label={datum.property ? datum.property : ''}
						/>
					{/if}
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
