<script>
	import Columns from '@components/Columns.svelte';
	import Header from '@components/Header.svelte';
	import Language from '@components/Language.svelte';

	export let data;
</script>

<article style="--theme-color:blue">
	<Header />
	<Columns {data} />
</article>
