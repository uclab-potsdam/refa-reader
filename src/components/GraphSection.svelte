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
	let loadingColumn;

	let selectedTriplets = { nodes: [], links: [] };

	function resetScroll(index) {
		let col = document.querySelector(`#col_${index}`);
		if (col) {
			col.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}
	}

	async function openNode(node, index) {
		resetScroll(index);
		loadingColumn = true;
		$selectedNode = '';

		// Remove all elements in $graphSteps after the given index
		$graphSteps.splice(index, $graphSteps.length - index);

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
			id: node.target,
			data: selectedTripletsData.sort((a, b) => {
				if (a.property) {
					return a.property.localeCompare(b.property);
				}
			}),
			page: 0,
			new: newNodes,
			paginate: paginate
		};
		loadingColumn = false;

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
	{#if loadingColumn}
		<div class="loading">Loading...</div>
	{/if}
	<!-- <h4>{category} <sup>[{dataLen}]</sup></h4> -->
	<div class="cat">
		{#if category}
			<h4>{category}</h4>
		{/if}
	</div>

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
		color: #adadad;
	}

	.cat {
		margin-bottom: 1rem;
	}

	.divider {
		border-bottom: 1px dashed #adadad;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
	}

	.loading {
		font-size: 1rem;
		text-align: center;
		color: gainsboro;
	}
</style>
