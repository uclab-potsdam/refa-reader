<script>
	import newUniqueId from 'locally-unique-id-generator';
	import { onMount, onDestroy } from 'svelte';
	import { paths, graphSteps } from '@stores';

	export let datum;
	export let label;
	export let updatePosition;

	let item;
	let padding = 0;
	let id = newUniqueId();
	let sourceRect, targetRect;
	let x, y;

	$: {
		$updatePosition;
		getPositions();
	}

	$: identifier = $graphSteps.slice(-1)[0].id;
	$: highlite = datum.target == identifier || datum.source == identifier ? 'highlite' : '';
	$: d = `M${sourceRect?.x + sourceRect?.width},${sourceRect?.y} 
			C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},
			${controlPoint2Y} ${targetRect?.x},${targetRect?.y}`;

	$: {
		if (
			sourceRect &&
			targetRect &&
			controlPoint1X &&
			controlPoint2X &&
			controlPoint1Y &&
			controlPoint2Y
		) {
			$paths[id] = {
				class: highlite,
				d: d,
				label: label
			};
		}
	}

	function getPositions() {
		$updatePosition = false;
		sourceRect = getBounds(datum.source, padding);
		targetRect = getBounds(datum.target);

		if (item) {
			x = item.getBoundingClientRect().x;
			y = item.getBoundingClientRect().y;

			// d={`M ${sourceRect?.x} ${sourceRect?.y} L ${targetRect?.x} ${targetRect?.y}`}
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

	onDestroy(() => {
		delete $paths[id];
	});

	const controlPointOffset = 50;

	let controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y;

	$: {
		controlPoint1X = sourceRect?.x + sourceRect?.width + controlPointOffset;
		controlPoint1Y = sourceRect?.y;

		// Adjust the controlPoint2X based on the direction of the curve
		if (targetRect?.x < sourceRect?.x) {
			controlPoint2X = targetRect?.x - controlPointOffset * 8;
		} else {
			controlPoint2X = targetRect?.x - controlPointOffset;
		}

		controlPoint2Y = targetRect?.y;
	}
</script>

<div bind:this={item} />
