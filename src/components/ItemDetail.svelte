<script>
	import { selectedNode } from '@stores';

	export let data;

	$: itemDetail = data.find((d) => d.id == $selectedNode);
</script>

{#if itemDetail != undefined && itemDetail.data != undefined}
	<section>
		{#if itemDetail.data.thumbnail_display_urls?.large != null && !itemDetail.set}
			<img src={itemDetail.data.thumbnail_display_urls.large} alt={itemDetail.data['o:title']} />
		{/if}
		<h1 class="metadata-title">{itemDetail.data['o:title']}</h1>
	</section>
{/if}

<style>
	section {
		padding: 0.5rem;
	}

	img {
		width: 100%;
		margin-bottom: 1rem;
	}
</style>
