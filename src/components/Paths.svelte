<script>
	import { onMount, afterUpdate } from 'svelte';
	import { updatePosition } from '@stores';
	export let datum;
	export let label;
	let item;

	import newUniqueId from 'locally-unique-id-generator';
	let id = newUniqueId();
	let sourceRect;
	let x, y;

	$: {
		$updatePosition;
		getPositions();
	}

	function getPositions() {
		$updatePosition = false;
		sourceRect = getBounds(datum.source);
		if (item) {
			x = item.getBoundingClientRect().x;
			y = item.getBoundingClientRect().y;
		}
	}

	function getBounds(datum) {
		const id = datum.split('/').slice(-1)[0];
		const element = document.querySelector(`[data-id="${id}"]`);
		const elementRect = element ? element.getBoundingClientRect() : null;

		if (element) {
			return {
				x: element.offsetLeft,
				y: elementRect.y,
				width: elementRect.width,
				height: elementRect.height
			};
		}
	}

	onMount(() => {
		getPositions();
	});
</script>

<div bind:this={item}>
	{#if item}
		<svg class={datum.source.split('/').slice(-1)[0]}>
			<path id="path_{id}" d={`M ${sourceRect.x} ${sourceRect.y} L ${x} ${y}`} />
			<text>
				<textPath href="#path_{id}" startOffset="95%" text-anchor="end">{label}</textPath>
			</text>
		</svg>
	{/if}
</div>

<style>
	svg {
		position: absolute;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: -1;
	}

	text {
		font-size: clamp(8px, 0.6vw, 14px);
		/* fill: #969696; */
		fill: blue;
	}

	path {
		pointer-events: visibleStroke;
		/* stroke: #969696; */
		stroke: blue;
		stroke-width: 0.1;
		cursor: pointer;
	}
</style>
