<script>
	import newUniqueId from 'locally-unique-id-generator';

	import { onDestroy } from 'svelte';
	import { paths, graphSteps, scrollX } from '@stores';

	export let datum;
	export let label;
	export let updatePosition;
	let item;
	let padding = 0; // change if thicker lines
	let id = newUniqueId();
	let x, y;

	$: {
		$updatePosition;
		$scrollX;
		getPositions();
	}

	$: identifier = $graphSteps.slice(-1)[0].id;
	$: highlite = datum.target == identifier || datum.source == identifier ? 'highlite' : '';

	function getBounds(datum, p = 0, el) {
		const id = datum.split('/').slice(-1)[0];
		const elements = [...document.querySelectorAll(`.node[data-id="${id}"]`)];
		const bounds = [];
		elements.forEach((element) => {
			const elementRect = element.getBoundingClientRect();

			const bound = {
				x: elementRect.x + $scrollX,
				y: elementRect.y + p,
				width: elementRect.width - p / 2,
				height: elementRect.height,
				selected: 'selected'
			};
			bounds.push(bound);
		});

		return bounds;
	}

	function getPositions() {
		delete $paths[id];
		$updatePosition = false;
		const sourceRects = getBounds(datum.source, padding);
		const targetRects = getBounds(datum.target, padding);

		if (item) {
			x = item.getBoundingClientRect().x;
			y = item.getBoundingClientRect().y;
		}

		sourceRects.forEach((sourceRect) => {
			targetRects.forEach((targetRect) => {
				let controlPointOffset = 100;
				const selected = sourceRect?.selected;
				let startX, startY, endX, endY;
				let controlPoint2X;

				startX = sourceRect.x + sourceRect.width;
				startY = sourceRect.y;
				endX = targetRect.x;
				endY = targetRect.y;

				if (targetRect.x < sourceRect.x || targetRect.x == sourceRect.x) {
					controlPoint2X = targetRect.x - controlPointOffset * 5;
				} else if (targetRect.x == sourceRect.x) {
					controlPoint2X = targetRect.x - controlPointOffset * 3;
				} else {
					controlPoint2X = targetRect.x - controlPointOffset;
				}

				if (datum.source.includes('item_')) {
					controlPoint2X = targetRect.x - controlPointOffset;
				}

				// control points
				const controlPoint1X = startX + controlPointOffset;
				const controlPoint1Y = startY;
				const controlPoint2Y = targetRect.y;

				const d = `M${startX},${startY}C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${endX},${endY}`;
				$paths[id] = $paths[id] || [];
				$paths[id].push({
					class: highlite,
					d: d,
					label: label,
					selected: selected,
					datum: { source: datum.source.split('/').at(-1), target: datum.target.split('/').at(-1) },
					reverse: datum?.reverse
				});
			});
		});
	}

	onDestroy(() => {
		delete $paths[id];
		$paths = [];
	});
</script>

<div
	bind:this={item}
	source={datum.source.split('/').slice(-1)[0]}
	target={datum.target.split('/').slice(-1)[0]}
/>
