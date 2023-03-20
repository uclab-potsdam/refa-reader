<script>
	import { onMount } from 'svelte';
	import { Api, graphData } from '../stores.js';
	import { extractLinks } from '../utils.js';
	export let data;

	onMount(async () => {
		const items = await extractLinks(data);
		// console.log(items);
	});
</script>

<div class="graph">graph</div>

<style>
</style>
