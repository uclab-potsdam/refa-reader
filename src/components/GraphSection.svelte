<script>
	import Card from '@components/Card.svelte';
	import Paths from '@components/Paths.svelte';
	import { slide } from 'svelte/transition';
	import { graphSteps, selectedNode } from '@stores';
	import { createTriplets } from '@utils';

	export let category;
	export let data;
	export let newData;
	export let dataLen;
	export let entities;
	export let updatePosition;
	export let index;
	export let loadData;
	export let defaultNodes;
	export let batchSize;
	export let essaysItems;
	export let handlePosition;
	export let site;
	let section;

	let selectedTriplets = { nodes: [], links: [] };

	async function openNode(node, index) {
		$selectedNode = '';

		// Remove all elements in $graphSteps after the given index
		$graphSteps.splice(index, $graphSteps.length - index);
		$graphSteps[index] = {
			id: node.target,
			data: [],
			new: [],
			page: 0,
			paginate: [],
			loading: true
		};
		let columnNodes = $graphSteps
			// .slice(0, index )
			.map((obj) => obj.data)
			.flat();

		const response = await fetch(node.target);
		const data = await response.json();
		const items = [{ data }];

		selectedTriplets = await createTriplets(items);
		let selectedTripletsData = selectedTriplets.links.filter((d) => {
			return d.source === node.target || d.target === node.target;
		});

		let newNodes = updateNodes([...defaultNodes, ...columnNodes], selectedTripletsData);
		let paginate = selectedTripletsData.slice(0, batchSize);

		// Replace the element at the given index with the new data
		$graphSteps[index] = {
			data: selectedTripletsData.sort((a, b) => {
				if (a.property) {
					return a.property.localeCompare(b.property);
				}
			}),
			new: newNodes,
			paginate: paginate
		};

		if (newNodes.length > 0) {
			loadData(paginate, batchSize);
		}
	}

	function updateNodes(nodes, selectedNodes) {
		return selectedNodes.filter(
			(selectedNode) => !nodes.some((node) => node.title === selectedNode.title)
		);
	}
</script>

<section
	bind:this={section}
	transition:slide
	on:transitionrun={() => {
		handlePosition();
	}}
	on:transitionend={() => {
		handlePosition();
	}}
>
	<!-- <h4>{category} <sup>[{dataLen}]</sup></h4> -->
	<h4>{category ? category : ''}</h4>

	<div class="divider">
		{#each data as datum}
			<!-- {#if !datum.skip && datum.source && datum.target} -->
			{#if datum.source && datum.target}
				<div>
					{#if newData.some((existingNode) => existingNode.title === datum.title)}
						<Card
							{site}
							{entities}
							{updatePosition}
							{datum}
							{essaysItems}
							on:click={() => {
								openNode(datum, index + 1);
							}}
							on:keydown={() => {
								openNode(datum, index + 1);
							}}
						/>
					{/if}
					{#if datum.source && datum.target && datum.source != datum.target}
						<Paths {datum} {updatePosition} label={datum.property ? datum.property : ''} />
					{/if}
				</div>
			{:else if datum.source && datum.target && datum.source != datum.target}
				<Paths {datum} {updatePosition} label={datum.property ? datum.property : ''} />
			{/if}
		{/each}
	</div>
</section>

<style>
	h4 {
		font-size: 1rem;
		margin-bottom: 1rem;
		color: #adadad;
	}

	.divider {
		border-bottom: 1px dashed #adadad;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
	}
</style>
