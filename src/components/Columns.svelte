<script>
	export let data;
</script>

<div class="columns">
	{#each data.posts as post}
		{#if post.meta.pubic}
			<a href={post.path} target="_self">
				<div class="column">
					<h2>
						{post.meta.title}
					</h2>
					<div class="text">
						{@html post.text}
					</div>
				</div>
			</a>
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
		overflow: scroll;
		height: 100vh;
	}

	.column:hover {
		background-color: #fefefe;
	}

	a {
		color: black;
		text-decoration: none;
	}

	.text {
		pointer-events: none;
	}
</style>
