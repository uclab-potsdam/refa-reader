<script>
	import { selectedNode } from '@stores';
	export let data;

	$: itemDetail = data.find((d) => d.id == $selectedNode);

	$: {
		console.log(itemDetail);
	}
</script>

<section>
	{#if itemDetail != undefined}
		{#if itemDetail.data.thumbnail_display_urls.large}
			<img src={itemDetail.data.thumbnail_display_urls.large} alt={itemDetail.data['o:title']} />
		{/if}
		<h1>{itemDetail.data['o:title']}</h1>
	{/if}
</section>

<style>
	img {
		width: 100%;
	}
</style>
