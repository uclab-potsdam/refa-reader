<script>
	import { selectedNode, ItemDetailMetaData } from '@stores';
	import { afterUpdate } from 'svelte';
	export let data;
	$: itemDetail = data.find((d) => d.id == $selectedNode);

	function scrollToSelected(element, detail, align) {
		if (detail) {
			const selectedItem = document.querySelector(`${element}[data-id="${detail}"]`);
			if (selectedItem) {
				// selectedItem.scrollIntoView({ behavior: 'smooth' });
				selectedItem.scrollIntoView({ behavior: 'auto', block: 'start' });
			}
		}
	}

	afterUpdate(() => {
		scrollToSelected('.item-detail', $selectedNode);
	});
</script>

{#if data != undefined}
	<section>
		{#each data as d}
			{#if d.data != undefined}
				<div
					class="item-detail"
					on:click={() => {
						$selectedNode = d.data?.['o:id'];
						scrollToSelected('.node-highlite', $selectedNode);
					}}
					on:keydown={() => {
						$selectedNode = d.data?.['o:id'];
						scrollToSelected('.node-highlite', $selectedNode);
					}}
					data-id={d.data?.['o:id']}
					class:selected={itemDetail != undefined ? itemDetail.id == d.data?.['o:id'] : ''}
				>
					{#if d.data?.thumbnail_display_urls.large}
						<img src={d.data?.thumbnail_display_urls.large} alt={d.data?.['o:title']} />
					{/if}

					<span>{d.data?.['o:title'] || 'Ohne Titel'}</span>

					{#if itemDetail != undefined && itemDetail.id == d.data?.['o:id']}
						<div class="metadata">
							{#each ItemDetailMetaData as meta, i}
								{#if itemDetail.data[meta]}
									{#if i === 0}<span>, </span>{/if}
									<span>
										{itemDetail.data[meta]?.[0]['simpleValue'] ||
											itemDetail.data[meta]?.[0]['@value'] ||
											itemDetail.data[meta]?.[0]['display_title']}
									</span>
									{#if meta !== ItemDetailMetaData[ItemDetailMetaData.length - 1]}
										<span>, </span>
									{/if}
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</section>
{/if}

<style>
	.item-detail {
		margin: 20px 10px;
		padding-bottom: 30px;
		border-bottom: 1px solid gainsboro;
		background-color: unset !important;
		cursor: pointer;
	}

	.selected {
		scroll-behavior: smooth;
		font-size: 1.4rem;
	}

	.item-detail:not(.selected) {
		/* opacity: 0.1; */
		/* font-size: 1rem; */
		filter: grayscale(1);
	}

	.item-detail:hover {
		/* opacity: 1; */
		filter: grayscale(0);
	}

	section {
		padding: 0.5rem;
		font-size: 0.9rem;
		overflow: scroll;
		height: 100vh;
	}

	img {
		height: 100%;
		width: 100%;
		margin-bottom: 10px;
	}

	.metadata {
		padding-left: 5px;
		display: contents;
	}
</style>
