<script>
	import { graphSteps, hoverNode } from '@stores';
	import { slide } from 'svelte/transition';
	import { onDestroy } from 'svelte';
	// import PropLabel from '@components/PropLabel.svelte';

	export let datum;
	export let entities;
	export let updatePosition;
	export let essaysItems;
	export let site;

	let imageSrc;

	onDestroy(() => {
		$updatePosition = true;
	});

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

	let id = datum.target.split('/').slice(-1)[0];
	let essaysItemsLinks = essaysItems.find((d) => d.id == id);
	$: selected = $graphSteps.some((d) => d?.id == datum.target);
</script>

<div
	class="node"
	class:selected
	class:linkToEssay={essaysItemsLinks != undefined}
	title={datum.title}
	data-id={id}
	on:mouseover={() => {
		$hoverNode = id;
	}}
	on:click
	on:keydown
	on:focus
	transition:slide
>
	<!-- <p>{datum.target.split('/').slice(-1)[0]}</p> -->
	<!-- <div class="title"><strong>{datum.target.split('/').slice(-1)[0]}</strong></div> -->
	{#if datum.img}
		<img src={datum.img.replace('square', 'large')} alt={datum.title} on:load={handleLoad} />
		<div class="title">{datum.title}</div>
	{:else if imageSrc}
		<img src={imageSrc} alt={datum.title} on:load={handleLoad} transition:blur={{ amount: 1 }} />
		<div class="title">{datum.title || ''}</div>
	{:else}
		<div class="title">{datum.title || ''}</div>
	{/if}

	<!-- Links -->

	{#if essaysItemsLinks != undefined}
		{#each essaysItemsLinks.essays as d}
			<a
				class="link"
				href="{d.url}#item_{essaysItemsLinks.id}"
				target="_blank"
				rel="noopener noreferrer"
			>
				→<em>{d.title}</em></a
			>
		{/each}
	{/if}

	<!-- not title == is media -->
	{#if site}
		{#if datum.title == undefined}
			<a class="link" href={`${site}/media/${id}`} target="_blank" rel="noopener noreferrer"
				>→ Metadata</a
			>
		{:else}
			<a class="link" href={`${site}/item/${id}`} target="_blank" rel="noopener noreferrer"
				>→ Metadata</a
			>
		{/if}
	{/if}
</div>

<style>
	.node {
		background-color: #f6f6f6 !important;
		padding: 5px 10px;
		margin-bottom: 10px;
		box-shadow: 0px 0px 4px 0px #f6f6f6;
		width: 220px;
	}

	.node:hover,
	.selected {
		/* background-color: var(--theme-color);
		color: white; */
		background-color: white;
		color: black;
		/* box-shadow: inset 0px 0px 6px 1px var(--theme-color); */
		box-shadow: inset -1px 1px 13px 0px var(--theme-color);
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
