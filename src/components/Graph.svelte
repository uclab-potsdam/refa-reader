<script>
	import { onMount } from 'svelte';
	import { Api, selectedNode, graphSteps } from '@stores';
	import { get, writable } from 'svelte/store';
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
	let batchSize = 20;

	let selectedTriplets = { nodes: [], links: [] };
	let markdownNodes = data.nodes.filter((d) => visibleItemsID.includes(d.id));

	$: path = `${Api}/resources/${$selectedNode}`;

	onMount(async () => {
		loadData(data.nodes, batchSize);
	});

	$: {
		if (data.links) {
			selectedData = data.links.filter((d) => {
				highliteNode = path;
				return (
					(d.target != path && d.source != d.target && d.source == path) ||
					(d.target != path && d.source != d.target && d.target == path)
				);
			});
			initialStep = [...new Map(selectedData.map((item) => [item.title, item])).values()].sort(
				(a, b) => (a.property || '').localeCompare(b.property || '')
			);
		}
	}
	$: {
		$graphSteps; // change the way to detect reactivness
		$graphSteps[0] = {
			id: path,
			data: initialStep,
			new: initialStep,
			page: 0,
			paginate: initialStep
		};
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

		if (newNodes.length > 0) {
			let paginate = newNodes.slice(0, batchSize);
			// Replace the element at the given index with the new data
			$graphSteps[index] = {
				id: node.target,
				data: selectedTripletsData.sort((a, b) => {
					if (a.property) {
						return a.property.localeCompare(b.property);
					}
				}),
				new: newNodes,
				page: 0,
				paginate
			};
			loadData(paginate, batchSize);
		}
		highliteNode = node.target;
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

	let col;

	const getPaginatedData = (index, col) => {
		const { scrollTop, scrollHeight, clientHeight } = col;
		if (scrollTop + clientHeight >= scrollHeight - 50) {
			const page = $graphSteps[index].page + 1;
			$graphSteps[index] = {
				...$graphSteps[index],
				page,
				paginate: $graphSteps[index].data.slice(0, page * batchSize)
			};
		}
	};
</script>

<div class="graph">
	{#if $entities.length == 0}
		<div class="links">
			<h4 class="loading">Loading Graph...</h4>
		</div>
	{:else}
		{#each $graphSteps as step, index}
			<div
				class="links"
				bind:this={col}
				on:scroll={() => {
					handlePosition();
					getPaginatedData(index, col);
				}}
			>
				<!-- <p class="index">Items[{step.new.length}]</p> -->
				{#each step.paginate as datum}
					{#if step.new.some((existingNode) => existingNode.title === datum.title)}
						<!-- {#if $entities.find((d) => d['o:title'] == datum.title)}
							{$entities.find((d) => d['o:title'] == datum.title)["o:id"]}
						{/if} -->
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
				{#if step.paginate.length < step.new.length}
					<div on:click={getPaginatedData(index, col)} on:keydown={getPaginatedData(index, col)}>
						Load more
					</div>
				{/if}
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
		padding-left: 6vw;
		width: 150px;
		flex-basis: 150px;
		flex-grow: 0;
		flex-shrink: 0;
		cursor: pointer;
		overflow: scroll;
	}

	.index {
		position: sticky;
		top: 0;
	}
</style>
