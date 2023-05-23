<script>
	import newUniqueId from 'locally-unique-id-generator';
	import { onMount } from 'svelte';
	export let datum;
	export let label;
	export let svg;
	export let updatePosition;
	export let highliteNode;

	let item;
	let padding = 18;
	let id = newUniqueId();
	let sourceRect, targetRect;
	let x, y;

	$: {
		$updatePosition;
		getPositions();
	}

	function getPositions() {
		$updatePosition = false;
		sourceRect = getBounds(datum.source, padding);
		targetRect = getBounds(datum.target);

		if (item) {
			x = item.getBoundingClientRect().x;
			y = item.getBoundingClientRect().y;
		}
	}

	function getBounds(datum, p = 0) {
		const id = datum.split('/').slice(-1)[0];
		const element = document.querySelector(`.node[data-id="${id}"]`);
		const elementRect = element ? element.getBoundingClientRect() : null;
		if (element) {
			return {
				x: elementRect.x,
				y: elementRect.y + p,
				width: elementRect.width - p / 2,
				height: elementRect.height
			};
		}
	}
	onMount(() => {
		getPositions();
	});

	// $: r = Math.hypot(targetRect?.x - sourceRect?.x, targetRect?.y - sourceRect?.y);

	const controlPointOffset = 50;
	$: controlPoint1X = sourceRect?.x + sourceRect?.width + controlPointOffset;
	$: controlPoint1Y = sourceRect?.y;
	$: controlPoint2X = targetRect?.x - controlPointOffset;
	$: controlPoint2Y = targetRect?.y;
</script>

<!-- d={`M ${sourceRect?.x} ${sourceRect?.y} L ${targetRect?.x} ${targetRect?.y}`} -->

<div bind:this={item}>
	{#if item}
		<svg class={datum.source.split('/').slice(-1)[0]}>
			<path
				id="path_{id}"
				class={datum.target == highliteNode || datum.source == highliteNode ? 'highlite' : ''}
				d={`M${sourceRect?.x + sourceRect?.width},${
					sourceRect?.y
				} C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${
					targetRect?.x
				},${targetRect?.y}`}
			/>
			<text class={datum.target == highliteNode || datum.source == highliteNode ? 'highlite' : ''}>
				<textPath href="#path_{id}" startOffset="98%" text-anchor="end">{label}</textPath>
			</text>
		</svg>
	{/if}
</div>

<style>
	svg {
		position: fixed;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: -1;
		transform: translateZ(0);
	}
	text {
		font-size: clamp(8px, 0.4vw, 12px);
		fill: #969696;
		/* opacity: 0; */
	}

	path {
		pointer-events: visibleStroke;
		stroke: #969696;
		stroke-width: 0.2;
		cursor: pointer;
		fill: none;
	}

	text.highlite {
		fill: blue;
		opacity: 1;
	}

	path.highlite {
		stroke-width: 0.2;
		stroke: blue;
	}
</style>
