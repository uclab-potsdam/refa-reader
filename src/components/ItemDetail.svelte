<script>
	import { visibleLinks, selectedNode, graphSteps } from '@stores';
	import { afterUpdate } from 'svelte';
	export let data;
	export let itemDetailMetaData;

	$: itemDetail = data.find((d) => d.id == $selectedNode);
	$: visibleIds = $visibleLinks.map((d) => d.getAttribute('data-id'));
	$: visibleData = data.filter((d) => visibleIds.includes(d.id));

	function scrollToSelected(element, detail, align) {
		if (detail) {
			const selectedItem = document.querySelector(`${element}[data-id="${detail}"]`);
			if (selectedItem) {
				selectedItem.scrollIntoView({ behavior: 'smooth', block: align });
			}
		}
	}

	afterUpdate(() => {
		if ($graphSteps.length < 2) {
			scrollToSelected('.item-detail', $selectedNode, 'center');
		}
	});;
</script>

{#if visibleData != undefined}
	<section>
		{#each visibleData as d}
			{#if d.data != undefined}
				<div
					class="item-detail"
					on:click={() => {
						$selectedNode = d.data?.['o:id'].toString();
					}}
					on:keydown
					data-id={d.data?.['o:id']}
					class:selected={itemDetail != undefined ? itemDetail.id == d.data?.['o:id'] : ''}
				>
					{#if d.data?.thumbnail_display_urls.large && !d.data?.['o:items']}
						<img src={d.data?.thumbnail_display_urls.large} alt={d.data?.['o:title']} />
					{/if}

					<span>{d.data?.['o:title'] || 'Ohne Titel'}</span>

					{#if itemDetail != undefined && itemDetail.id == d.data?.['o:id']}
						<div class="metadata">
							{#each itemDetailMetaData as meta, i}
								{#if itemDetail.data[meta]}
									<span>
										{itemDetail.data[meta]?.[0]['simpleValue'] ||
											itemDetail.data[meta]?.[0]['@value'] ||
											itemDetail.data[meta]?.[0][
												'display_title'
											]}{#if meta !== itemDetailMetaData[itemDetailMetaData.length - 1]},{/if}
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
		font-size: 1.2rem;
		animation: color 0.5;
		min-height: 40vh;
	}

	.item-detail:not(.selected) {
		background: white;
		filter: grayscale(1);
	}

	.item-detail:not(.selected) * {
		opacity: 0.5;
	}

	.item-detail:hover,
	.item-detail:hover * {
		opacity: 1;
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

	/* .metadata {
		padding-left: 5px;
		display: contents;
	} */
</style>
