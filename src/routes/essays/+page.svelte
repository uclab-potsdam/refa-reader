<script>
	import Columns from '../../components/Columns.svelte';
	import Header from '../../components/Header.svelte';

	export let data;
</script>

<Header />
<Columns data={data} />
