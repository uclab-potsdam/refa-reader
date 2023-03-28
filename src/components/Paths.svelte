<script>
	import { onDestroy, onMount } from 'svelte';
	import { updatePosition } from '../stores';
	export let datum;
	export let label;
	import newUniqueId from 'locally-unique-id-generator';
	let id = newUniqueId();

	let sourceRect, targetRect;

	$: {
		$updatePosition;
		getPositions();
	}

	function getPositions() {
		$updatePosition = false;
		sourceRect = getBounds(datum.source);
		targetRect = getBounds(datum.target);
	}

	function getBounds(datum) {
		const id = datum.split('/').slice(-1)[0];
		const element = document.querySelector(`[data-id="${id}"]`);
		const elementRect = element ? element.getBoundingClientRect() : null;
		return elementRect;
	}

	onMount(() => {
		getPositions();
	});
</script>

{#if sourceRect && targetRect}
	<svg class={datum.source.split('/').slice(-1)[0]}>
		<path
			id="path_{id}"
			d={`M ${sourceRect.x} ${sourceRect.y} L ${targetRect.x} ${targetRect.y}`}
		/>
		<text>
			<textPath href="#path_{id}" startOffset="95%" text-anchor="end">{label}</textPath>
		</text>
	</svg>
{/if}

<style>
	svg {
		position: absolute;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	text {
		font-size: 12px;
		fill: #969696;
		fill: blue;
	}

	path {
		pointer-events: visibleStroke;
		stroke: #969696;
		stroke: blue;
		stroke-width: 0.5;
		cursor: pointer;
	}
</style>
