<script>
	import Markdown from '../../../components/Markdown.svelte';
	import Graph from '../../../components/Graph.svelte';

	import { page } from '$app/stores';
	export let data;
	const datum = [...data.posts].find((d) => d.path.includes($page.params.slug));
</script>

<article>
	<section>
		<h1>{datum.meta.title}</h1>
		<Markdown data={datum} />
	</section>
	<section>
		<Graph data={datum.text} />
	</section>
</article>

<style>
	article {
		display: flex;
	}

	section {
		flex: 1;
	}
</style>
