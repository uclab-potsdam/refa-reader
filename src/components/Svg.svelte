<script>
	import { paths } from '@stores';
	import newUniqueId from 'locally-unique-id-generator';
</script>

{#if Object.keys($paths).length > 0}
	<svg>
		{#each Object.entries($paths) as [id, path]}
			{#each path as item}
				{@const uniqueId = newUniqueId()}
				<path id="path_{uniqueId || id}" class={item.class} data-attr={item.selected} d={item.d} />
				{#if item.class != undefined && item.selected != 'not-selected' && item.class == 'highlite'}
					<text class={item.class}>
						<textPath
							alignment-baseline="baseline"
							dominant-baseline="text-before-edge"
							href="#path_{uniqueId || id}"
							startOffset="98%"
							text-anchor="end"
						>
							{item.label}
						</textPath>
					</text>
				{/if}
			{/each}
		{/each}
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
		text-rendering:optimizeSpeed
	}

	.background {
		stroke: white;
		stroke-width: 0.8em;
	}

	text {
		font-size: clamp(10px, 0.8vw, 12px);
		fill: #969696;
		text-rendering:optimizeSpeed
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
		fill: var(--theme-color);
		opacity: 1;
	}

	/* path.background.highlite {
		stroke: var(--theme-color);
	} */

	path.highlite {
		stroke-width: 0.5;
		stroke: var(--theme-color);
	}

	path[data-attr='selected'] {
		stroke: var(--theme-color);
	}

	path[data-attr='not-selected'] {
		stroke: #969696;
		stroke-width: 0.1;
	}
</style>
