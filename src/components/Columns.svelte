<script>
	export let data;
	console.log(data.posts);
</script>

<div class="columns">
	{#each data.posts as post}
		<div class="column">
			<h2>
				<a href={post.path}>
					{post.meta.title}
				</a>
			</h2>
			<div>
				{post.text}
			</div>
		</div>
	{/each}
</div>

<style>
	.columns {
		display: flex;
		flex-wrap: nowrap;
		overflow: scroll;
	}

	.column {
		flex: 1;
		min-width: 150px;
	}
</style>
