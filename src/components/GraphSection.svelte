<script>
	import Card from '@components/Card.svelte';
	import Paths from '@components/Paths.svelte';

	export let desc;
	export let step;
	export let entities;
	export let updatePosition;
	export let highliteNode;
	export let index;
	export let openNode;
	export let highlite;
</script>

{#if step.new.some((d) => d.highlite === highlite)}
	<h4>{desc}</h4>
	<div class="divider {highlite === false ? 'classification' : ''}">
		{#each step.paginate as datum}
			{#if datum.highlite == highlite}
				{#if step.new.some((existingNode) => existingNode.title === datum.title)}
					{#if step.new.some((existingNode) => existingNode.title === datum.title)}
						<Card
							{entities}
							{updatePosition}
							{datum}
							on:click={() => {
								openNode(datum, index + 1);
							}}
							on:keydown={() => {
								openNode(datum, index + 1);
							}}
						/>
						{#if datum.source && datum.target}
							<Paths
								{datum}
								{updatePosition}
								{highliteNode}
								label={datum.property ? datum.property : ''}
							/>
						{/if}
					{/if}
				{:else if datum.source && datum.target}
					<Paths
						{datum}
						{updatePosition}
						{highliteNode}
						label={datum.property ? datum.property : ''}
					/>
				{/if}
			{/if}
		{/each}
	</div>
{/if}

<style>
	h4 {
		font-size: 1rem;
		margin-bottom: 1rem;
        color: #adadad;
	}

	.divider {
		border-bottom: 1px dashed #adadad;
		margin-bottom: 1rem;
        padding-bottom: 1rem;
	}

	.classification {
		color: #adadad;
	}

	:global(.classification img) {
		opacity: 0.3;
	}

    :global(.classification img:hover) {
		opacity: 1;
	}

    /* :global(.classification textPath) {
        fill: #adadad;
    }

    :global(.classification path.highlite) {
        stroke: #adadad;
    } */
</style>
