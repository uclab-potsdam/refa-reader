<script>
	import { selectedNode, ItemDetailMetaData, graphSteps } from '@stores';
	import { afterUpdate } from 'svelte';
	export let data;

	$: itemDetail = data.find((d) => d.id == $selectedNode);

	function scrollToSelected(element, detail, align) {
		if (detail) {
			const selectedItem = document.querySelector(`${element}[data-id="${detail}"]`);
			// console.log($selectedNode, selectedItem);

			if (selectedItem) {
				// selectedItem.scrollIntoView({ behavior: 'smooth' });
				selectedItem.scrollIntoView({ behavior: 'auto', block: 'center' });
			}
		}
	}

	let update = false;
	afterUpdate(() => {
		if ($graphSteps.length < 2) {
			scrollToSelected('.item-detail', $selectedNode);
		}

		if (update) {
			scrollToSelected('.node-highlite', $selectedNode);
			update = false;
		}
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
						update == true;
					}}
					on:keydown={() => {
						$selectedNode = d.data?.['o:id'];
						update == true;
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
									<!-- {#if i === 0}<span>, </span>{/if} -->
									<span>
										{itemDetail.data[meta]?.[0]['simpleValue'] ||
											itemDetail.data[meta]?.[0]['@value'] ||
											itemDetail.data[meta]?.[0][
												'display_title'
											]}{#if meta !== ItemDetailMetaData[ItemDetailMetaData.length - 1]},{/if}
									</span>
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
		font-size: 1.3rem;
		animation: color 0.5;
		min-height: 40vh;
	}

	.item-detail:not(.selected) {
		background: white;
		filter: grayscale(1);
	}

	.item-detail:not(.selected) * {
		opacity: 0.1;
	}

	.item-detail:hover,
	.item-detail:hover * {
		opacity: 1;
		transition: opacity 0.3s;
		filter: grayscale(0);
	}

	section {
		padding: 0.5rem;
		font-size: 0.9rem;
		overflow: scroll;
		height: calc(100vh - 1rem);
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
