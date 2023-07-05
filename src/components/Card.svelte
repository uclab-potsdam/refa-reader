<script>
	import { graphSteps } from '@stores';
	import PropLabel from '@components/PropLabel.svelte';
	export let datum;
	export let entities;
	export let updatePosition;
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
</script>

<!-- <PropLabel label={datum.property} /> -->
<div
	class="node {$graphSteps.find((d) => d.id == datum.target) ? 'selected' : ''}"
	data-id={datum.target.split('/').slice(-1)[0]}
	title={datum.title}
	on:click
	on:keydown
>
	<!-- <div class="title"><strong>{datum.target.split('/').slice(-1)[0]}</strong></div> -->
	{#if datum.img}
		<img src={datum.img.replace('square', 'large')} alt={datum.title} on:load={handleLoad} />
		<div class="title">{datum.title}</div>
	{:else if imageSrc}
		<img src={imageSrc} alt={datum.title} on:load={handleLoad} />
		<div class="title">{datum.title || ""}</div>
	{:else}
		<div class="title">{datum.title || ""}</div>
	{/if}
</div>

<style>
	.node {
		background-color: #f6f6f6;
		padding: 0.25rem 0.5rem;
		margin-bottom: 1rem;
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

	img {
		padding-top: 0.5rem;
		width: 100%;
		object-fit: contain;
	}
</style>
