<script>
	import { onMount } from 'svelte';
	import { selectedNode, graphSteps } from '@stores';
	import { writable } from 'svelte/store';
	import GraphSection from '@components/GraphSection.svelte';
	import { afterUpdate } from 'svelte';

	export let updatePosition;
	export let handlePosition;
	export let data;
	export let visibleItemsID;
	export let essaysItems;
	export let config;

	let screenSize;
	const entities = writable([]);

	let selectedData = [];
	let initialStep = [];
	let batchSize = config.batch; // cant be more than the pagination in omeka s
	let graph;
	let markdownNodes = data.nodes.filter((d) => visibleItemsID.includes(d.id));

	$: path = `${config.api}/resources/${$selectedNode}`;

	onMount(async () => {
		loadData(data.nodes, batchSize);
	});

	afterUpdate(() => {
		if (graph.lastElementChild && screenSize > 600) {
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
			...selectedData.filter((v, i, a) => a.findIndex((v2) => v2.target === v.target) === i)
			// remove skip
			// .map((d) => {
			// 	const inMarkdown = markdownNodes.find((j) => j.id == d.target);
			// 	return { ...d, skip: inMarkdown != undefined ? true : false };
			// })
		];

		if (($graphSteps && $graphSteps.length == 0) || $graphSteps?.[0]?.data.length == 0) {
			$graphSteps[0] = {
				id: path,
				data: selected, // initialStep ?
				new: selected,
				page: 0,
				paginate: selected.slice(0, batchSize)
			};
		}
	}

	async function loadData(nodes, batchSize) {
		const ids = nodes.map((d) => {
			const id = d?.id?.split('/') || d?.target?.split('/');
			return id.slice(-1)[0];
		});

		const numBatches = Math.ceil(ids.length / batchSize);

		for (let i = 0; i < numBatches; i++) {
			const batchIds = ids.slice(i * batchSize, (i + 1) * batchSize);
			let query = `${config.api}/items?${batchIds.map((id) => `id[]=${id}`).join('&')}`;
			let response = await fetch(query);
			let jsonItems = await response.json();

			entities.update((items) => {
				if (!items.includes(...jsonItems)) {
					items.push(...jsonItems);
				}
				return items;
			});

			// BUG: query for /resources/ to get also the medias. So far it's not possible in Omeka-S / wait for the next release
			if (jsonItems.length != batchIds.length) {
				query = `${config.api}/media?${batchIds.map((id) => `id[]=${id}`).join('&')}`;
				response = await fetch(query);
				jsonItems = await response.json();

				entities.update((items) => {
					if (!items.includes(...jsonItems)) {
						items.push(...jsonItems);
					}
					return items;
				});
			}
		}
	}

	let col;

	const getPaginatedData = (index, col) => {
		if (col != null) {
			const { scrollTop, scrollHeight, clientHeight } = col;
			if (scrollTop >= 0 && scrollTop + clientHeight >= scrollHeight - 50) {
				const page = $graphSteps[index]?.page + 1 || 0;
				$graphSteps[index] = {
					...$graphSteps[index],
					page,
					paginate: $graphSteps[index]?.data.slice(0, page * batchSize)
				};
				if (
					$graphSteps[index]?.data &&
					$graphSteps[index]?.paginate.length != $graphSteps[index]?.data.length
				) {
					// loading based on the last n items
					loadData($graphSteps[index].paginate.slice(-batchSize), batchSize);
				}
			}
		}
	};
</script>

<svelte:window bind:innerWidth={screenSize} />

<div class="graph" bind:this={graph}>
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
					getPaginatedData(index, col);
					handlePosition();
				}}
				on:click={() => {
					handlePosition();
				}}
				on:keypress={() => {
					handlePosition();
				}}
			>
				{#if step?.new && step?.new.length > 0}
					<div>
						{#each config.mainCategories as cat}
							{@const filteredData = step.paginate.filter((d) => cat.props.includes(d.property))}
							{@const dataLen = step.data.filter((d) => cat.props.includes(d.property)).length}

							{#if filteredData.length > 0}
								<GraphSection
									site={config.publicSite}
									{handlePosition}
									{essaysItems}
									category={cat.key}
									data={filteredData}
									newData={step.new}
									{dataLen}
									{index}
									{entities}
									{updatePosition}
									{batchSize}
									defaultNodes={[...markdownNodes, ...initialStep]}
									{loadData}
								/>
							{/if}
						{/each}

						{#if step.paginate.filter((d) => !config.mainCategories.some( (cat) => cat.props.includes(d.property) )).length > 0}
							{@const filteredSecondaryData = step.paginate.filter(
								(d) => !config.mainCategories.some((cat) => cat.props.includes(d.property))
							)}
							{@const dataLen = step.data.filter(
								(d) => !config.mainCategories.some((cat) => cat.props.includes(d.property))
							).length}
							<GraphSection
								site={config.publicSite}
								{handlePosition}
								{essaysItems}
								category={''}
								data={filteredSecondaryData}
								newData={step.new}
								{dataLen}
								{index}
								{entities}
								{updatePosition}
								{batchSize}
								defaultNodes={[...markdownNodes, ...initialStep]}
								{loadData}
							/>
						{/if}
						{#if step.paginate.length < step.new.length}
							<div
								class="more"
								on:click={getPaginatedData(index, col)}
								on:keydown={getPaginatedData(index, col)}
							>
								Load more
							</div>
						{/if}
					</div>
				{:else}
					<div class="no-items">There are no connections.</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>
{#if $graphSteps.length >= 5}
	<div
		class="close"
		on:click={() => {
			$graphSteps = [];
		}}
		on:keypress={() => {
			$graphSteps = [];
		}}
	>
		x
	</div>
{/if}

<style>
	.more {
		padding-bottom: 20px;
		text-align: center;
		color: gainsboro;
		cursor: pointer;
	}

	.loading,
	.no-items {
		/* font-family: 'Redaction', serif; */
		text-align: center;
		color: gainsboro;
		/* margin-left: 10vw; */
		padding-top: 1rem;
	}

	.close {
		width: 25px;
		height: 25px;
		position: fixed;
		top: 10px;
		right: 10px;
		border-radius: 100%;
		background-color: gainsboro;
		color: var(--theme-color);
		text-align: center;
		line-height: 22px;
		font-family: 'Inter', sans-serif;
		z-index: 100;
		cursor: pointer;
		transition: all 0.5s linear;
	}
	.close:hover {
		width: 30px;
		height: 30px;
		line-height: 28px;
	}

	.graph {
		display: flex;
		user-select: none;
		/* overflow: hidden; */
	}

	.links {
		height: calc(100vh - 1rem);
		padding-top: 1rem;
		margin-left: 10vw;
		flex-basis: 220px;
		overflow: scroll;
		flex-grow: 0;
		flex-shrink: 0;
		cursor: pointer;
		word-wrap: break-word;
		z-index: 1;
	}

	.links:last-of-type {
		padding-right: 50px;
	}

	@media only screen and (max-width: 600px) {
		.links:not(:first-of-type) {
			margin-left: 30vw;
		}
	}
</style>
