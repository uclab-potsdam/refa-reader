<script>
	import * as config from '../../setup.json';
	import Markdown from '@components/Markdown.svelte';
	import Graph from '@components/Graph.svelte';
	import ItemDetail from '@components/ItemDetail.svelte';
	import Svg from '@components/Svg.svelte';
	import { page } from '$app/stores';
	import { items, graphSteps, selectedNode, hoverNode, scrollX } from '@stores';
	import { onMount } from 'svelte';
	import { extractLinks, createTriplets } from '@utils';
	import { writable } from 'svelte/store';
	export let data;

	let textData = [];
	let triplets, itemsJson;
	let visibleItemsID = [];
	let essaysItems = [];

	const updatePosition = writable(false);
	const handlePosition = () => {
		$updatePosition = true;
	};

	$: {
		$selectedNode;
		handlePosition();
	}

	$: {
		$hoverNode;
		handlePosition();
	}

	onMount(async () => {
		textData = [...data.posts].find((d) => d.path.includes($page.params.slug));
		itemsJson = await extractLinks(textData.text);
		visibleItemsID = itemsJson
			.filter((obj) => !obj.set)
			.map((obj) => `${config.api}/resources/${obj.data?.['o:id']}`);
		triplets = await createTriplets(itemsJson);
		$items = triplets;

		const storedLanguage = localStorage.getItem('selectedLanguage');

		essaysItems = data.posts.reduce((result, item) => {
			// ignore current path and filter by lang
			if (!item.path.includes($page.params.slug) && item.meta.lang == storedLanguage) {
				item.links.map((link) => {
					const existingEntry = result.find((entry) => entry.id === link);

					const essay = {
						title: item.meta.title,
						url: item.path
					};

					if (existingEntry) {
						// Check if the essay doesn't already exist in the 'essays' array
						if (
							!existingEntry.essays.some(
								(existingEssay) =>
									existingEssay.title === essay.title && existingEssay.url === essay.url
							)
						) {
							existingEntry.essays.push(essay);
						}
					} else {
						result.push({
							id: link,
							essays: [essay]
						});
					}
				});
			}
			return result;
		}, []);
	});

	function resetNode() {
		$graphSteps = [];
	}
	let article;
</script>

<svelte:window on:resize={handlePosition} on:click={handlePosition} />
<div>
	{#if textData == undefined && triplets == undefined}
		<article>
			<section class="markdown__container">
				<h4>404 Page not found</h4>
			</section>
		</article>
	{:else if triplets == undefined}
		<article>
			<section class="markdown__container">
				<h4>Loading...</h4>
			</section>
		</article>
	{:else}
		<article
			style="--theme-color: {textData.meta?.color || 'blue'}"
			on:resize={handlePosition}
			on:scroll={() => {
				$scrollX = article?.scrollLeft;
			}}
			on:click={() => {
				handlePosition();
			}}
			on:keypress
			bind:this={article}
		>
			<section
				class="item__detail"
				on:click={() => {
					document.querySelectorAll('a[data-id]').forEach((link) => {
						link.classList.remove('related');
						link.classList.remove('selected');
					});
					resetNode();
					handlePosition();
				}}
				on:keypress
			>
				<ItemDetail
					data={itemsJson.filter((d) => !d.hasOwnProperty('fromSet'))}
					itemDetailMetaData={config.itemDetailMetaData}
				/>
			</section>
			<section
				class="markdown__container"
				on:wheel={() => {
					resetNode();
					handlePosition();
				}}
				on:touchmove={() => {
					resetNode();
					handlePosition();
				}}
				on:click={() => {
					resetNode();
					handlePosition();
				}}
				on:keypress
			>
				<h1>{textData.meta.title}</h1>
				<Markdown data={textData} items={itemsJson} />
			</section>
			<section class="graph__container">
				<Graph
					{essaysItems}
					data={$items}
					{visibleItemsID}
					{handlePosition}
					{updatePosition}
					{config}
				/>
			</section>
			<Svg />
		</article>
	{/if}
</div>

<style>
	article {
		display: flex;
		height: 100vh;
		overflow: scroll;
		position: relative;
	}

	h1 {
		margin-top: 0.5rem;
		margin-bottom: 1rem;
		font-size: 2.4rem;
	}

	.markdown__container {
		padding: 0.5rem 0rem 0 1rem;
		/* flex: 0 0 600px; */
		max-width: 600px;
		flex: 0 0 40vw;
		overflow-x: scroll;
	}

	.graph__container {
		flex: 3;
	}

	.item__detail {
		/* flex: 0 0 400px; */
		flex: 0 0 20vw;
		max-width: 400px;
		border-right: 1px solid #e3e3e3;
	}

	@media only screen and (max-width: 600px) {
		.item__detail {
			display: none;
		}

		.markdown__container {
			flex: 2;
			padding: 0.5rem;
			flex-basis: 70vw;
			min-width: 70vw;
			overflow-x: hidden;
			overflow-y: scroll;
		}

		.graph__container {
			flex: 1;
		}

		h1 {
			font-size: 1.4rem;
		}

		/* div::before {
			content: 'This website contains visualizations that are not supported by small screen formats. To navigate the graphs, go to your desktop browser.';
			display: block;
			font-size: 20px;
			padding: 1rem;
			background: blue;
		} */
	}
</style>
