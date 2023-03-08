<script>
    import Markdown from '../../../components/Markdown.svelte';
	import { page } from '$app/stores';
	export let data;
	const datum = [...data.posts].find((d) => d.path.includes($page.params.slug));
</script>

<h1>{datum.meta.title}</h1>

<Markdown data={datum} />	
