<script>
	import Markdown from './Markdown.svelte';

	export let data;
	console.log(data.posts);
</script>

<div class="columns">
	{#each data.posts as post}
		{#if post.meta.pubic}
			<div class="column">
				<h2>
					<a href={post.path}>
						{post.meta.title}
					</a>
				</h2>
				<Markdown data={post} />
			</div>
		{/if}
	{/each}
</div>

<style>
	.columns {
		display: flex;
		flex-wrap: nowrap;
		overflow: scroll;
	}

	.column {
		width: 250px;
	}
</style>
