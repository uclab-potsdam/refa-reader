<script>
	import Columns from '@components/Columns.svelte';
	import Header from '@components/Header.svelte';
	import Language from '@components/Language.svelte';

	export let data;

	let lang = 'en';
</script>

<article style="--theme-color:blue">
	<Language bind:lang={lang} />
	<Header essays={data.posts.filter((d) => d.meta.isPublic & (d.meta.lang == lang)).length} {lang} />
	<Columns {data} {lang} />
</article>
