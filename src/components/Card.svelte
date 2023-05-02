<script>
	import { entities } from '@stores';

	export let datum;

	let imageSrc;

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

<div class="link" data-id={datum.target.split('/').slice(-1)[0]} title={datum.title}>
	{#if imageSrc}
		<img src={imageSrc} alt={datum.title} />
	{:else if datum.img}
		<img src={datum.img} alt={datum.title} />
	{:else}
		<div class="title">{datum.title}</div>
	{/if}
</div>

<style>
	.link {
		background-color: #ececec;
		padding: 0.25rem 0.5rem;
		margin-bottom: 0.5rem;
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
