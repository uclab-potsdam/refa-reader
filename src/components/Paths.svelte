<script>
	import { onMount } from 'svelte';
	export let datum;

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
        console.log("here")
		updatePosition(source, target);
	}
</script>

{#if sourceRect && targetRect}
	<svg>
		<line x1={sourceRect.x} y1={sourceRect.y} x2={targetRect.x} y2={targetRect.y} />
	</svg>
{/if}

<style>
	svg {
		position: absolute;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
        z-index: -1;
		pointer-events: none;
	}

	line {
		pointer-events: visibleStroke;
		stroke: #969696;
        stroke-width: .5;
		cursor: pointer;
	}
</style>
