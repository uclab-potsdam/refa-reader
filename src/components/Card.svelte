<script>
	import { graphSteps, hoverNode } from '@stores';
	import { blur } from 'svelte/transition';
	// import PropLabel from '@components/PropLabel.svelte';
	export let datum;
	export let entities;
	export let updatePosition;
	export let essaysItems;
	export let site;

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
</script>

<!-- <PropLabel label={datum.property} /> -->
<div
	class="node {$graphSteps.find((d) => d?.id == datum.target) ? 'selected' : ''}"
	class:linkToEssay={essaysItemsLinks != undefined}
	title={datum.title}
	data-id={datum.target.split('/').slice(-1)[0]}
	on:mouseover={() => {
		$hoverNode = datum.target.split('/').slice(-1)[0];
	}}
	on:click
	on:keydown
	on:focus
>
	<!-- <div class="title"><strong>{datum.target.split('/').slice(-1)[0]}</strong></div> -->
	{#if datum.img}
		<img
			src={datum.img.replace('square', 'large')}
			alt={datum.title}
			on:load={handleLoad}
			transition:blur={{ amount: 10 }}
		/>
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
			<a
				class="link"
				href={`${site}/media/${datum.target.split('/').slice(-1)[0]}`}
				target="_blank"
				rel="noopener noreferrer">→ Metadata</a
			>
		{:else}
			<a
				class="link"
				href={`${site}/item/${datum.target.split('/').slice(-1)[0]}`}
				target="_blank"
				rel="noopener noreferrer">→ Metadata</a
			>
		{/if}
	{/if}
</div>

<style>
	.node {
		background-color: #f6f6f6 !important;
		padding: 0.25rem 0.5rem;
		margin: 10px;
		margin-bottom: 1.5rem;
		box-shadow: 0px 0px 4px 0px #f6f6f6;
	}

	.node:hover,
	.selected {
		/* background-color: var(--theme-color);
		color: white; */
		background-color: white;
		color: black;
		/* box-shadow: inset 0px 0px 6px 1px var(--theme-color); */
		box-shadow: 0px 0px 4px 0px var(--theme-color);
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
