<script>
	import { onMount } from 'svelte';
	import { Api, selectedNode, graphSteps } from '@stores';
	import { get, writable } from 'svelte/store';
	import Svg from '@components/Svg.svelte';
	import GraphSection from '@components/GraphSection.svelte';
	import { afterUpdate } from 'svelte';

	export let updatePosition;
	export let handlePosition;
	export let data;
	export let visibleItemsID;

	const entities = writable([]);

	let selectedData = [];
	let initialStep = [];
	let batchSize = 25;
	let graph;
	let markdownNodes = data.nodes.filter((d) => visibleItemsID.includes(d.id));

	$: path = `${Api}/resources/${$selectedNode}`;

	onMount(async () => {
		loadData(data.nodes, batchSize);
	});

	afterUpdate(() => {
		if (graph.lastElementChild) {
			graph.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}
	});

	$: {
		if (data.links) {
			selectedData = data.links.filter((d) => {
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
		let selected = [
			...selectedData
				.filter((v, i, a) => a.findIndex((v2) => v2.target === v.target) === i)
				.map((d) => {
					const inMarkdown = markdownNodes.find((j) => j.id == d.target);
					return { ...d, skip: inMarkdown != undefined ? true : false };
				})
		];

		if (($graphSteps && $graphSteps.length == 0) || $graphSteps?.[0]?.data.length == 0) {
			$graphSteps[0] = {
				id: path,
				data: initialStep,
				new: selected,
				page: 0,
				paginate: selected.slice(0, batchSize)
			};
		}
	}

	$: columnNodes = $graphSteps.map((obj) => obj.data).flat();

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
		if (col != null) {
			const { scrollTop, scrollHeight, clientHeight } = col;
			if (scrollTop > 0 && scrollTop + clientHeight >= scrollHeight - 50) {
				const page = $graphSteps[index].page + 1;
				$graphSteps[index] = {
					...$graphSteps[index],
					page,
					paginate: $graphSteps[index].data.slice(0, page * batchSize)
				};
				// loading based on the last n items
				loadData($graphSteps[index].paginate.slice(-batchSize), batchSize);
			}
		}
	};
</script>

<div class="graph" bind:this={graph}>
	{#if $entities.length == 0}
		<div class="links">
			<h4 class="loading">Loading Graph...</h4>
		</div>
	{:else}
		{#each $graphSteps as step, index}
			{#if step?.new.length > 0}
				<div
					class="links"
					bind:this={col}
					on:scroll={() => {
						handlePosition();
						getPaginatedData(index, col);
					}}
				>
					<GraphSection
						desc={'Related Artworks'}
						highlite={true}
						{step}
						{index}
						{entities}
						{updatePosition}
						{batchSize}
						defaultNodes={[...markdownNodes, ...initialStep, ...columnNodes]}
						{loadData}
					/>
					<GraphSection
						desc={'Classification'}
						highlite={false}
						{step}
						{index}
						{entities}
						{updatePosition}
						{batchSize}
						defaultNodes={[...markdownNodes, ...initialStep, ...columnNodes]}
						{loadData}
					/>
					<!-- {#if step.paginate.length < step.new.length}
					<div on:click={getPaginatedData(index, col)} on:keydown={getPaginatedData(index, col)}>
						Load more
					</div>
				{/if} -->
				</div>
			{/if}
		{/each}
	{/if}
</div>
<Svg />

<style>
	.loading {
		font-family: 'Redaction', serif;
	}

	.graph {
		display: flex;
		/* overflow: hidden; */
	}

	.links {
		height: calc(100vh - 1rem);
		padding-top: 1rem;
		margin-left: 8vw;
		flex-basis: 200px;
		overflow: scroll;
		flex-grow: 0;
		flex-shrink: 0;
		cursor: pointer;
		word-wrap: break-word;
	}
</style>
