<script>
	import { paths } from '@stores';
</script>

{#if Object.keys($paths).length > 0}
	<svg>
		{#each Object.entries($paths) as [id, path]}
			<!-- {#each path as item} -->
			<path id="path_{id}" class={path.class} d={path.d} />

			{#if path.class != undefined && path.class == 'highlite'}
				<text class="{path.class} background">
					<textPath
						dominant-baseline="middle"
						href="#path_{id}"
						startOffset="98%"
						text-anchor="end"
					>
						{path.label}
					</textPath>
				</text>
				<text class={path.class}>
					<textPath
						dominant-baseline="middle"
						href="#path_{id}"
						startOffset="98%"
						text-anchor="end"
					>
						{path.label}
					</textPath>
				</text>
			{/if}
		{/each}
		<!-- {/each} -->
	</svg>
{/if}

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

	.background {
		stroke: white;
		stroke-width: 0.6em;
	}

	text {
		font-size: clamp(10px, 0.8vw, 12px);
		fill: #969696;
		/* opacity: 0; */
	}

	path {
		pointer-events: visibleStroke;
		stroke: #969696;
		stroke-width: 0.1;
		/* stroke-linecap: round;
		stroke-linejoin: round; */
		cursor: pointer;
		fill: none;
	}

	text.highlite {
		fill: var(--theme-color);
		/* fill: white; */
		opacity: 1;
	}

	path.background.highlite {
		stroke-width: 8;
		stroke: var(--theme-color);
	}

	path.highlite {
		stroke-width: 7;
		stroke-width: 0.2;

		stroke: white;
		stroke: var(--theme-color);
	}
</style>
