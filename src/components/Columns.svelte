<script>
	export let data;
</script>

<div class="columns">
	{#each data.posts as post}
		{#if post.meta.pubic}
			<div class="column">
				<h2>
					<a href={post.path} target="_self">
						{post.meta.title}
					</a>
				</h2>
				{@html post.text}
			</div>
		{/if}
	{/each}
</div>

<style>
	.columns {
		display: flex;
		/* flex-wrap: nowrap; */
		overflow-x: auto;
	}

	.column {
		min-width: 300px;
		padding: 0 1rem;
	}
</style>
