<script>
	export let data;
</script>

<div class="columns">
	{#each data.posts as post}
		{#if post.meta.isPublic}
			<a href={post.path} target="_self">
				<div class="column">
					{#if post.meta.cover}
						<img src={post.meta.cover} alt={post.meta.title} />
					{/if}
					<h2>
						{post.meta.title}
					</h2>
					{#if post.meta.description}
						<div class="text">
							{@html post.meta.description}
						</div>
					{/if}
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
		padding: .5rem;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 40;
		line-clamp: 40;
		-webkit-box-orient: vertical;
		/* overflow: scroll;
		height: 100vh; */
	}

	.column:hover {
		background-color: #e6e6e6;
	}

	a {
		color: black;
		text-decoration: none;
	}

	.text {
		pointer-events: none;
	}

	h2 {
		min-height: 100px;
	}

	img {
		max-width: 100%;
		padding-bottom: .5rem;
	}
</style>
