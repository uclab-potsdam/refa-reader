<script>
	import { selectedNode, ItemDetailMetaData } from '@stores';

	export let data;

	$: itemDetail = data.find((d) => d.id == $selectedNode);

	// $: {
	// 	console.log(itemDetail);
	// }
</script>

{#if itemDetail != undefined && itemDetail.data != undefined}
	<section>
		{#if (itemDetail.data.thumbnail_display_urls?.large != null && !itemDetail.set) || itemDetail.data['o:thumbnail_urls'] != null}
			<img
				src={itemDetail.data.thumbnail_display_urls.large ||
					itemDetail.data['o:thumbnail_urls'].large}
				alt={itemDetail.data['o:title']}
			/>
		{/if}
		<div class="metadata">
			{#if itemDetail.data['o:title'] != null}
				<span>{itemDetail.data['o:title']}</span>
			{/if}
			{#each ItemDetailMetaData as meta, i}
				{#if itemDetail.data[meta]}
					{#if i === 0}<span>,&nbsp;</span>
					{/if}
					<span>
						{itemDetail.data[meta]?.[0]['simpleValue'] ||
							itemDetail.data[meta]?.[0]['@value'] ||
							itemDetail.data[meta]?.[0]['display_title']}
					</span>
					{#if meta !== ItemDetailMetaData[ItemDetailMetaData.length - 1]}
						<span>,&nbsp;</span>
					{/if}
				{/if}
			{/each}
		</div>
	</section>
{/if}

<style>
	section {
		padding: 0.5rem;
		font-size: 0.9rem;
	}

	img {
		width: 100%;
		margin-bottom: 1rem;
	}

	.metadata{
		padding-left: 5px;
		display: flex;
		flex-wrap: wrap;
	}

	.metadata span {
		display: inline-block;
	}
</style>
