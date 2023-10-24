<script>
	import newUniqueId from 'locally-unique-id-generator';

	import { onMount, onDestroy, afterUpdate } from 'svelte';
	import { paths, graphSteps, selectedNodeUniqueId, scrollX } from '@stores';

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

	function getBounds(datum, p = 0) {
		const id = datum.split('/').slice(-1)[0];
		const elements = document.querySelectorAll(`.node[data-id="${id}"]`);
		const bounds = [];

		elements.forEach((element) => {
			const elementRect = element.getBoundingClientRect();
			let selected =
				element.getAttribute('unique-id') == null
					? 'not-a-text-node'
					: element.getAttribute('unique-id') == $selectedNodeUniqueId
					? 'selected'
					: 'not-selected';
			const bound = {
				x: elementRect.x + $scrollX,
				y: elementRect.y + p,
				width: elementRect.width - p / 2,
				height: elementRect.height,
				selected: selected
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
				const selected = sourceRect.selected;
				let startX, startY, endX, endY;

				let controlPoint2X;

				// if (datum?.reverse == true) {
				// 	startX = targetRect.x + sourceRect.width;
				// 	startY = targetRect.y;
				// 	endX = sourceRect.x;
				// 	endY = sourceRect.y;
				// 	if (sourceRect.x < targetRect.x || sourceRect.x == targetRect.x) {
				// 		controlPoint2X = sourceRect.x - controlPointOffset * 10;
				// 	} else if (sourceRect.x == sourceRect.x) {
				// 		controlPoint2X = sourceRect.x - controlPointOffset * 2;
				// 	} else {
				// 		controlPoint2X = sourceRect.x - controlPointOffset * 10;
				// 	}
				// } else {
				// 	startX = sourceRect.x + sourceRect.width;
				// 	startY = sourceRect.y;
				// 	endX = targetRect.x;
				// 	endY = targetRect.y;
				// 	if (targetRect.x < sourceRect.x || targetRect.x == sourceRect.x) {
				// 		controlPoint2X = targetRect.x - controlPointOffset * 4;
				// 	} else if (targetRect.x == sourceRect.x) {
				// 		controlPoint2X = targetRect.x - controlPointOffset * 2;
				// 	} else {
				// 		controlPoint2X = targetRect.x - controlPointOffset;
				// 	}
				// }

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

				// control points
				const controlPoint1X = startX + controlPointOffset;
				const controlPoint1Y = startY;

				// define the intensity of the control point of the cruve

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

	onMount(() => {
		getPositions();
	});

	afterUpdate(() => {
		getPositions();
	});

	onDestroy(() => {
		delete $paths[id];
		$paths = [];
	});
</script>

<div bind:this={item} />
