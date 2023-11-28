<script>
	import * as config from '@setup';
	import Card from '@components/Card.svelte';
	import Paths from '@components/Paths.svelte';
	import { graphSteps } from '@stores';
	import { json } from '@sveltejs/kit';
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

		// Remove all elements in $graphSteps after the given index
		$graphSteps.splice(index, $graphSteps.length - index);

		let columnNodes = $graphSteps.map((obj) => obj.data).flat();

		const response = await fetch(node.target);
		const data = await response.json();

		//Fetch the items in the set
		if (data?.['o:items'] && $graphSteps.length == 1) {
			let setData = [];
			const items = data['o:items']['@id'];
			const responseSet = await fetch(items);
			const jsonSet = await responseSet.json();
			jsonSet.forEach((item) => {
				setData.push(item);
			});

			let setItems = setData.map((d) => {
				return {
					'o:title': d['o:title'],
					'@id': d['@id'],
					thumbnail_display_urls: d['thumbnail_display_urls']
				};
			});

			// add the set to the data
			data.related = { ...setItems };
		}

		selectedTriplets = await createTriplets([{ data }]);

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
		$updatePosition = true;
	}

	function updateNodes(nodes, selectedNodes) {
		return selectedNodes.filter((selectedNode) => {
			return !nodes.some((node) => {
				return node.target === selectedNode.target || node.id === selectedNode.target;
			});
		});
	}
</script>

<section bind:this={section}>
	{#if loadingColumn}
		<div class="loading">Loading...</div>
	{/if}

	<!-- <h4>{category} <sup>[{dataLen}]</sup></h4> -->
	<!-- <div class="cat">
		{#if category}
			<h4>{category}</h4>
		{/if}
	</div> -->

	<!-- <div class="divider"> -->
	<div>
		{#if data && typeof data === 'object' && Object.keys(data).length > 0}
			{#each data as datum}
				{#if newData.some((existingNode) => existingNode?.title === datum.title)}
					<!-- {datum.source.split('/').slice(-1)[0]}
						{datum.target.split('/').slice(-1)[0]} -->
					{#if datum.source != datum.target}
						{#if !datum?.external}
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
								{openNode}
							/>
						{:else}
							<a href={datum.target} target="_blank" rel="noreferrer">
								<Card {site} {entities} {updatePosition} {datum} {essaysItems} {openNode} />
							</a>
						{/if}
						<Paths {datum} {updatePosition} label={datum?.property || ''} />
					{/if}
				{:else if datum.source && datum.target && datum.source != datum.target}
					<Paths {datum} {updatePosition} label={datum?.property || ''} />
				{/if}
			{/each}
		{/if}
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
		/* border-bottom: 1px dashed #adadad;
		margin-bottom: 1rem;
		padding-bottom: 1rem; */
	}

	.loading {
		font-size: 1rem;
		text-align: center;
		color: gainsboro;
	}
</style>
