<script>
	import * as config from '../../setup.json';
	import Markdown from '@components/Markdown.svelte';
	import Graph from '@components/Graph.svelte';
	import Svg from '@components/Svg.svelte';
	import { page } from '$app/stores';
	import { items, hoverNode, scrollX, graphScroll } from '@stores';
	import { onMount } from 'svelte';
	import { extractLinks, createTriplets } from '@utils';
	import { writable } from 'svelte/store';
	export let data;

	let md;
	let textData = [];
	let triplets, itemsJson;
	let visibleItemsID = [];
	let essaysItems = [];
	let article;
	let scrollTopVal;

	const updatePosition = writable(false);
	const handlePosition = () => {
		$updatePosition = true;
	};

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
</script>

<svelte:window on:resize={handlePosition} on:click={handlePosition} />
<div>
	{#if textData == undefined && triplets == undefined}
		<article>
			<section class="short_text">
				<h4>404 Page not found</h4>
			</section>
		</article>
	{:else if triplets == undefined}
		<article>
			<section class="short_text">
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
			on:touchmove={() => {
				$scrollX = article?.scrollLeft;
				handlePosition();
			}}
			on:click={() => {
				handlePosition();
			}}
			on:keypress
			bind:this={article}
		>
			<section
				class="markdown__container"
				bind:this={md}
				on:scroll={() => {
					handlePosition();
					scrollTopVal = md?.scrollTop;
					$graphScroll = false;
				}}
			>
				<Markdown data={textData} items={itemsJson} {scrollTopVal} />
			</section>
			<section
				class="graph__container"
				on:wheel={() => {
					$graphScroll = true;
				}}
				on:scroll={() => {
					$graphScroll = true;
				}}
			>
				<Graph
					items={itemsJson}
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
		background-color: #efefef;
	}

	.short_text {
		padding: 0.5rem 0rem 0 1rem;
	}

	.markdown__container {
		background-color: white;
		box-shadow: -10px 0px 10px 0px var(--light-grey);
		margin-left: 30vw;
		padding-left: 10px;
		max-width: 640px;
		flex: 0 0 40vw;
		overflow-x: scroll;
	}

	.graph__container {
		flex: 3;
	}

	@media only screen and (max-width: 600px) {
		.markdown__container {
			flex: 3;
			padding: 0.5rem;
			flex-basis: 70vw;
			min-width: 70vw;
			overflow-x: hidden;
			overflow-y: scroll;
			margin-left: 0;
		}

		.graph__container {
			flex: 1;
		}
	}
</style>
