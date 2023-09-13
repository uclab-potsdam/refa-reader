<script>
	import Columns from '@components/Columns.svelte';
	import Header from '@components/Header.svelte';

	export let data;
</script>

<article style="--theme-color:blue">
	<Header />
	<Columns {data} />
</article>
