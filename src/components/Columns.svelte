<script>
	import { base } from '$app/paths';
	export let data;
	export let lang;
</script>

<div class="columns">
	{#each data.posts as post}
		{#if post.meta.isPublic && post.meta.lang == lang}
			<a href="{base}{post.path}" target="_self">
				<div class="column" style="--meta-color: {post.meta.color}">
					<h2>
						{post.meta.title}
					</h2>
					{#if post.meta.cover}
						<img src={post.meta.cover} alt={post.meta.title} />
					{/if}
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
		align-items: stretch;
		overflow-x: scroll;
		scroll-snap-type: x mandatory;
	}

	.columns a {
		flex: 0 0 380px;
		display: flex;
		align-content: space-around;
	}

	.column {
		padding: 10px;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 40;
		line-clamp: 40;
		-webkit-box-orient: vertical;
		scroll-snap-align: center;
		cursor: pointer;
	}

	.column:hover {
		background-color: #e6e6e6;
		color: var(--meta-color);
	}

	.column:hover > img {
		filter: grayscale(0%);
	}

	a {
		color: black;
		text-decoration: none;
	}

	.text {
		pointer-events: none;
		font-size: 1rem;
	}

	h2 {
		min-height: 150px;
		text-align: center;
		font-size: 30px;
		line-height: 30px;
		padding-bottom: 10px;
	}

	img {
		width: 100%;
		/* height: 250px;
		object-fit: cover;
		object-position: top center; */
		padding-bottom: 0.5rem;
		filter: grayscale(100%);
	}

	@media only screen and (max-width: 800px) {
		.columns {
			flex-wrap: wrap;
		}
	}
</style>
