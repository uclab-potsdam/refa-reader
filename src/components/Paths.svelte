<script>
	import { onMount } from 'svelte';
	export let datum;
	export let label;
	export let updatePosition;
	export let highliteNode;

	let item;

	import newUniqueId from 'locally-unique-id-generator';
	let id = newUniqueId();
	let sourceRect, targetRect;
	let x, y;

	$: {
		$updatePosition;
		getPositions();
	}

	function getPositions() {
		$updatePosition = false;
		sourceRect = getBounds(datum.source, 16);
		targetRect = getBounds(datum.target);

		if (item) {
			x = item.getBoundingClientRect().x;
			y = item.getBoundingClientRect().y;
		}
	}

	function getBounds(datum, p=0) {
		const id = datum.split('/').slice(-1)[0];
		const element = document.querySelector(`.node[data-id="${id}"]`);
		const elementRect = element ? element.getBoundingClientRect() : null;

		if (element) {
			return {
				x: elementRect.x + p,
				y: elementRect.y + p,
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
			<path
				id="path_{id}"
				class={datum.target == highliteNode || datum.source == highliteNode ? 'highlite' : ''}
				d={`M ${sourceRect?.x} ${sourceRect?.y} L ${targetRect?.x} ${targetRect?.y}`}
			/>
			<text class={datum.target == highliteNode || datum.source == highliteNode ? 'highlite' : ''}>
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
		fill: #969696;
		/* opacity: 0; */
	}

	path {
		pointer-events: visibleStroke;
		stroke: #969696;
		stroke-width: 0.2;
		cursor: pointer;
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
