<script>
	import { paths } from '@stores';
</script>

<svg>
	{#each Object.entries($paths) as [id, path]}
		<path id="path_{id}" class={path.class} d={path.d} />

		{#if path.class.length > 0}
			<text class={path.class}>
				<textPath href="#path_{id}" startOffset="98%" text-anchor="end">{path.label}</textPath>
			</text>
		{/if}
	{/each}
</svg>

<style>
	svg {
		position: fixed;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
		pointer-events: none;
		/* z-index: -1; */
		transform: translateZ(0);
		font-family: 'Inter', sans-serif;
	}

	text {
		font-size: clamp(8px, 0.4vw, 12px);
		fill: #969696;
		/* opacity: 0; */
	}

	path {
		pointer-events: visibleStroke;
		stroke: #969696;
		stroke-width: 0.1;
		stroke-linecap: round;
		stroke-linejoin: round;
		cursor: pointer;
		fill: none;
	}

	text.highlite {
		fill: var(--theme-color);
		opacity: 1;
	}

	path.highlite {
		/* stroke-width: 0.2; */
		stroke: var(--theme-color);
	}
</style>
