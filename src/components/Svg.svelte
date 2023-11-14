<script>
	import { paths, hoverNode } from '@stores';
</script>

{#if Object.keys($paths).length > 0}
	<svg>
		<g>
			{#each Object.entries($paths) as [id, path]}
				{#each path as item}
					<path id="path_{id}" class={item.class} data-attr={item.selected} d={item.d} />
					<!-- {#if (item.class != undefined && item.selected != 'not-selected' && item.class == 'highlite') || $hoverNode == item.datum.source || $hoverNode == item.datum.target} -->
					{#if ($hoverNode == item.datum.source && item.selected != 'not-selected') || $hoverNode == item.datum.target}
						<text
							class="background {item.class}"
							source={item.datum.source}
							target={item.datum.target}
						>
							<textPath
								alignment-baseline="middle"
								href="#path_{id}"
								startOffset="99%"
								text-anchor="end"
							>
								{item.label}
								{#if item.reverse && item.label}
									&nbsp;-
								{/if}
								{#if !item.reverse && item.label}
									→
								{/if}
							</textPath>
						</text>
						<text class={item.class} source={item.datum.source} target={item.datum.target}>
							<textPath
								alignment-baseline="middle"
								href="#path_{id}"
								startOffset="99%"
								text-anchor="end"
							>
								{item.label}
								{#if item.reverse && item.label}
									←
								{/if}
								{#if !item.reverse && item.label}
									→
								{/if}
							</textPath>
						</text>
					{/if}
				{/each}
			{/each}
		</g>
	</svg>
{/if}

<style>
	svg {
		position: absolute;
		overflow: visible;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: 1;
		transform: translateZ(0);
		font-family: 'Inter', sans-serif;
		text-rendering: optimizeSpeed;
		/* shape-rendering: optimizeSpeed; */
	}

	.background {
		stroke: white;
		stroke-linecap: round;
		stroke-width: 0.5em;
	}

	text {
		font-size: clamp(8px, 0.8vw, 10px);
		fill: #969696;
		fill: var(--theme-color);
		text-rendering: optimizeSpeed;
		font-weight: 300;
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
		display: block;
	}

	path[data-attr='selected'],
	path.highlite {
		stroke: var(--theme-color);
		stroke-width: 0.5;
	}
</style>
