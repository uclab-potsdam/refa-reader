<script>
	import { onMount, afterUpdate } from 'svelte';
	import { graphSteps, graphScroll } from '@stores';
	import { writable } from 'svelte/store';
	import GraphSection from '@components/GraphSection.svelte';

	export let updatePosition;
	export let handlePosition;
	export let data;
	export let visibleItemsID;
	export let essaysItems;
	export let config;
	export let items;
	export let screenSize;

	let scrollTopVal;
	const entities = writable([]);

	let batchSize = config.batch; // cant be more than the pagination in omeka s
	let graph;
	let markdownNodes = data.nodes.filter((d) => visibleItemsID.includes(d.id));

	onMount(async () => {
		loadData(data.nodes, batchSize);
	});

	afterUpdate(() => {
		if (graph.lastElementChild && screenSize > 600) {
			graph.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}
		handlePosition();
	});

	$: dataToGraph = items
		.filter((d) => d?.data)
		.map((d) => {
			return {
				img: d.data?.thumbnail_display_urls.large,
				source: `item_${d.id}`,
				target: `${config.api}/resources/${d.id}`,
				title: d.data?.['o:title'] || ''
			};
		});

	$: if (
		($graphSteps && $graphSteps.length == 0) ||
		(graphSteps && $graphSteps?.[0]?.data.length == 0)
	) {
		$graphSteps[0] = {
			data: dataToGraph, // initialStep ?
			new: dataToGraph,
			page: 0,
			paginate: dataToGraph
		};
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
			// const { scrollTop, scrollHeight, clientHeight } = col;
			// if (scrollTop >= 0 && scrollTop + clientHeight >= scrollHeight - 50) {
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
			// }
		}
	};

	let idx = 0;
	$: handleScroll(scrollTopVal);

	function handleScroll(scrollTopVal) {
		if ($graphScroll) {
			const items = document.querySelectorAll('.links:first-of-type .node');
			let firstInGraph = items?.[idx]?.offsetTop;
			let firstInGraphId = items?.[idx]?.getAttribute('data-id');
			let secondInGraph = items?.[idx + 1]?.offsetTop;
			let secondInGraphId = items?.[idx + 1]?.getAttribute('data-id');
			let firstInEssay = document.querySelector(
				`.node-highlite[data-id="${firstInGraphId}"]`
			)?.offsetTop;
			let secondInEssay = document.querySelector(
				`.node-highlite[data-id="${secondInGraphId}"]`
			)?.offsetTop;
			let percentageDistance = getPercentageDistance(scrollTopVal, firstInGraph, secondInGraph);
			let pixelDiscance = getPixelDistance(percentageDistance, firstInEssay, secondInEssay);
			const selectedItem = document.querySelector('.markdown__container');

			if (scrollTopVal > secondInGraph) {
				idx++;
			}

			if (scrollTopVal < firstInGraph && idx != 0) {
				idx--;
			}

			if (selectedItem && pixelDiscance && firstInGraph !== secondInGraph && pixelDiscance > 0) {
				selectedItem?.scrollTo({
					top: pixelDiscance
				});
			}
		}
	}
	function getPercentageDistance(scrollTop, firstPoint, secondPoint) {
		const totalDistance = secondPoint - firstPoint;
		const distanceFromFirst = scrollTop - firstPoint;
		const percentage = (distanceFromFirst / totalDistance) * 100;
		return percentage;
	}

	function getPixelDistance(percentage, firstPoint, secondPoint) {
		const distanceFromFirst = secondPoint - firstPoint;
		return firstPoint + (distanceFromFirst * percentage) / 100;
	}
</script>

<div class="graph" bind:this={graph}>
	{#if $entities.length == 0}
		<div>
			<h4 class="loading">Loading Graph...</h4>
		</div>
	{:else}
		{#each $graphSteps as step, index}
			<div
				class="links"
				id="col_{index}"
				bind:this={col}
				on:scroll={() => {
					let col0 = document.querySelector('#col_0');
					col0.addEventListener('scroll', (event) => {
						scrollTopVal = col0?.scrollTop;
					});
					// getPaginatedData(index, col);
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
									{essaysItems}
									category={cat.key}
									data={filteredData}
									newData={step.new}
									{dataLen}
									{index}
									{entities}
									{updatePosition}
									{batchSize}
									defaultNodes={[...markdownNodes]}
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

							{#if filteredSecondaryData.length > 0}
								<GraphSection
									site={config.publicSite}
									{essaysItems}
									category={''}
									data={filteredSecondaryData}
									newData={step.new}
									{dataLen}
									{index}
									{entities}
									{updatePosition}
									{batchSize}
									defaultNodes={[...markdownNodes]}
									{loadData}
								/>
							{/if}
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
{#if $graphSteps.length > 1}
	<div
		class="close"
		on:click={() => {
			$graphSteps = [];
			handlePosition();
		}}
		on:keypress={() => {
			$graphSteps = [];
		}}
	>
		✕
	</div>
{/if}

<style>
	.more {
		padding-top: 10px;
		padding-bottom: 20px;
		text-align: center;
		color: gainsboro;
		cursor: pointer;
	}
	.more:hover {
		color: black;
	}

	.loading,
	.no-items {
		font-size: 1rem;
		/* font-family: 'Redaction', serif; */
		text-align: center;
		color: gainsboro;
		height: calc(100vh - 20px);
		padding-top: 1rem;
		margin-bottom: 10px;
	}

	.close {
		width: 25px;
		height: 25px;
		position: fixed;
		top: 5px;
		right: 5px;
		border-radius: 100%;
		background-color: white;
		border: 1px solid var(--theme-color);
		color: var(--theme-color);
		text-align: center;
		line-height: 25px;
		font-family: 'Inter', sans-serif;
		z-index: 100;
		cursor: pointer;
	}
	.close:hover {
		width: 30px;
		height: 30px;
		line-height: 28px;
	}

	.graph {
		display: flex;
		user-select: none;
		background-color: white;
		height: 100vh;
	}

	.links {
		background-color: white;
		height: fit-content;
		max-height: calc(100vh - 20px);
		margin-left: 12vw;
		/* flex-basis: 220px; */
		overflow: scroll;
		flex-grow: 0;
		flex-shrink: 0;
		cursor: pointer;
		word-wrap: break-word;
		z-index: 2;
		padding-top: 20px;
	}

	.links:first-of-type {
		margin-left: 5vw;
	}

	.links:last-of-type {
		padding-right: 20px;
	}

	@media only screen and (max-width: 800px) {
		.links:not(:first-of-type) {
			margin-left: 30vw;
		}
	}
</style>
