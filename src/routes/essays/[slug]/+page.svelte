<script>
	import Markdown from '../../../components/Markdown.svelte';
	import Graph from '../../../components/Graph.svelte';

	import { page } from '$app/stores';
	export let data;
	const datum = [...data.posts].find((d) => d.path.includes($page.params.slug));
</script>

<article>
	<section class="markdown__container">
		<h1>{datum.meta.title}</h1>
		<Markdown data={datum} />
	</section>
	<section class="graph__container">
		<Graph data={datum.text} />
	</section>
</article>

<style>
	article {
		display: flex;
	}

	section {
		flex: 1;
		height: 100vh;
		overflow: scroll;
	}

	.markdown__container {
		padding: 0 1rem 0 2rem;
		min-width: 700px;
	}
</style>
