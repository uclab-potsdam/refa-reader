<script>
	import { onMount } from "svelte";
	import { fade, slide, fly } from "svelte/transition";
	import { Files } from "./config.js";
	import { fetchFile, extractLinks, createTriplets } from "./functions.js";
	import { selectedMarkdown, graphData, showItemDetail } from "./stores.js";
	import { v4 as uuidv4 } from "uuid";
	import TextContainer from "./components/TextContainer.svelte";
	import Header from "./components/Header.svelte";
	import Items from "./components/Items.svelte";

	let MarkdownFiles;

	onMount(async () => {
		MarkdownFiles = await Promise.all(
			Files.map(async (item) => {
				const title = item
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ");
				const url = `./essays/${item}.md`;
				const markdown = await fetchFile(url);
				const items = await extractLinks(markdown);
				const id = uuidv4();
				return { title, url, markdown, items, id };
			})
		);
		selectedMarkdown.set(MarkdownFiles[0]);
		graphData.set(createTriplets($selectedMarkdown));
	});
</script>

<main>
	{#if MarkdownFiles === undefined}
		<h4 class="loading">Loading Essays...</h4>
	{:else}
		<Header {MarkdownFiles} {selectedMarkdown} />
		<div class="container">
			<Items />
			<TextContainer {MarkdownFiles} />
		</div>
	{/if}
</main>

<style>
	.loading {
		padding: 1rem;
		margin: 0;
	}
	.container {
		display: flex;
		height: calc(100vh - 20px);
		overflow: hidden;
	}

	:global(a) {
		color: blue;
	}
</style>
