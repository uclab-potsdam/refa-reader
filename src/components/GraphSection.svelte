<script>
	import Card from '@components/Card.svelte';
	import Paths from '@components/Paths.svelte';
	import { graphSteps } from '@stores';
	import { createTriplets } from '@utils';

	export let desc;
	export let step;
	export let entities;
	export let updatePosition;
	export let highliteNode;
	export let index;
	export let highlite;
	export let loadData;
	export let defaultNodes;
	export let batchSize;

	let selectedTriplets = { nodes: [], links: [] };

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

		let newNodes = updateNodes(defaultNodes, selectedTripletsData);

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

	function updateNodes(nodes, selectedNodes) {
		return selectedNodes.filter(
			(selectedNode) => !nodes.some((node) => node.title === selectedNode.title)
		);
	}

	$: dataLength = step.new.filter((d) => d.highlite === highlite).length;
</script>

{#if step?.new.some((d) => d.highlite === highlite)}
	<h4>{desc} <sup>[{dataLength}]</sup></h4>
	<div class="divider {highlite === false ? 'classification' : ''}">
		{#each step.paginate as datum}
			{#if datum.highlite == highlite}
				<div>
					{#if step.new.some((existingNode) => existingNode.title === datum.title)}
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
				</div>
			{/if}
		{/each}
	</div>
{/if}

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

	.classification {
		color: #959595;
	}

	/* :global(.classification *:not(.selected) > img) {
		opacity: 0.3;
	} */

	:global(.classification img:hover) {
		opacity: 1;
	}
	:global(.classification textPath) {
		fill: #adadad;
	}

	:global(.classification path.highlite) {
		stroke: #adadad;
	}
</style>
