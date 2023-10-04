<script>
	import { graphSteps, site } from '@stores';
	// import PropLabel from '@components/PropLabel.svelte';
	export let datum;
	export let entities;
	export let updatePosition;
	export let essaysItems;

	let imageSrc;

	function handleLoad() {
		$updatePosition = true;
	}

	function getImageByNode(node) {
		const id = node.split('/');
		const datum = $entities.find((d) => d['o:id'] == id.slice(-1)[0]);
		return datum?.thumbnail_display_urls?.large;
	}

	$: {
		if ($entities) {
			imageSrc = getImageByNode(datum.target);
		}
	}

	let essaysItemsLinks = essaysItems.find((d) => d.id == datum.target.split('/').slice(-1)[0]);
	let isHovered = false;

</script>

<!-- <PropLabel label={datum.property} /> -->
<div
	class="node {$graphSteps.find((d) => d.id == datum.target) ? 'selected' : ''}"
	class:linkToEssay={essaysItemsLinks != undefined}
	data-id={datum.target.split('/').slice(-1)[0]}
	title={datum.title}
	on:click
	on:keydown
	on:mouseover
	on:focus
>
	<!-- <div class="title"><strong>{datum.target.split('/').slice(-1)[0]}</strong></div> -->
	{#if datum.img}
		<img src={datum.img.replace('square', 'large')} alt={datum.title} on:load={handleLoad} />
		<div class="title">{datum.title}</div>
	{:else if imageSrc}
		<img src={imageSrc} alt={datum.title} on:load={handleLoad} />
		<div class="title">{datum.title || ''}</div>
	{:else}
		<div class="title">{datum.title || ''}</div>
	{/if}

	<!-- Links -->

	{#if essaysItemsLinks != undefined}
		{#each essaysItemsLinks.essays as d}
			<a class="link" href={d.url} target="_blank" rel="noopener noreferrer"
				>Read in <em>{d.title}</em></a
			>
		{/each}
	{/if}

	<!-- not title == is media -->
	{#if site}
		{#if datum.title == undefined}
			<a
				class="link"
				href={`${site}/media/${datum.target.split('/').slice(-1)[0]}`}
				target="_blank"
				rel="noopener noreferrer">See in Collection</a
			>
		{:else}
			<a
				class="link"
				href={`${site}/item/${datum.target.split('/').slice(-1)[0]}`}
				target="_blank"
				rel="noopener noreferrer">See in Collection</a
			>
		{/if}
	{/if}
</div>

<style>
	.node {
		background-color: #f6f6f6 !important;
		padding: 0.25rem 0.5rem;
		margin-bottom: 1.5rem;
	}

	.node:hover,
	.selected {
		/* background-color: var(--theme-color);
		color: white; */
		background-color: white;
		color: black;
		border: 1px solid var(--theme-color);
		opacity: 1;
	}

	.title {
		font-size: 0.7rem;
		overflow-wrap: break-word;
	}

	.link {
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		font-size: 0.7rem;
		/* line-height: 0.7; */
		display: none;
		padding-bottom: 1rem;
		border-bottom: 1px solid gainsboro;
	}

	.selected > .link {
		display: block;
		transition: all 1s;
	}

	img {
		padding-top: 0.5rem;
		width: 100%;
		object-fit: contain;
	}

	.linkToEssay {
		border: 2px dotted var(--theme-color);
		border: 1px solid var(--theme-color);
		box-shadow: inset -1px 1px 13px 0px var(--theme-color);
	}
</style>
