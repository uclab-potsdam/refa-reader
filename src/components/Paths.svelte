<script>
	import { onMount } from 'svelte';
	export let datum;
	export let label;
	import newUniqueId from 'locally-unique-id-generator';
	let id = newUniqueId();

	let sourceRect, targetRect;
	let sourceElement, targetElement;
	const source = datum.source.split('/').slice(-1)[0];
	const target = datum.target.split('/').slice(-1)[0];

	function updatePosition(source, target) {
		sourceElement = document.querySelector(`[data-id="${source}"]`);
		targetElement = document.querySelector(`[data-id="${target}"]`);

		sourceRect = sourceElement ? sourceElement.getBoundingClientRect() : null;
		targetRect = targetElement ? targetElement.getBoundingClientRect() : null;
	}

	onMount(() => {
		updatePosition(source, target);
		// have to use the querySelectors :(
		document.querySelector('.graph__container').addEventListener('scroll', handleScroll);
		document.querySelector('.markdown__container').addEventListener('scroll', handleScroll);
	});

	function handleScroll() {
		updatePosition(source, target);
	}
</script>

{#if sourceRect && targetRect}
	<svg class={source}>
		<path
			id="path_{id}"
			d={`M ${sourceRect.x} ${sourceRect.y} L ${targetRect.x} ${targetRect.y}`}
		/>

		<text>
			<textPath href="#path_{id}" startOffset="98%" text-anchor="end">{label}</textPath>
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
		/* z-index: -1; */
		pointer-events: none;
	}

	text {
		font-size: 12px;
        fill: #969696;
	}

	path {
		pointer-events: visibleStroke;
		stroke: blue;
		stroke: #969696;
		stroke-width: 0.5;
		cursor: pointer;
	}
</style>
