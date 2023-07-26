<script>
	import Columns from '@components/Columns.svelte';
	import Header from '@components/Header.svelte';
	import Language from '@components/Language.svelte';
	import { onMount } from 'svelte';

	export let data;

	let lang = '';
	onMount(() => {
		const storedLanguage = localStorage.getItem('selectedLanguage');
		if (storedLanguage) {
			lang = storedLanguage;
		} else {
			lang = 'en';
		}
	});
</script>

{#if lang}
	<article style="--theme-color:blue">
		<Language bind:lang />
		<Header
			essays={data.posts.filter((d) => d.meta.isPublic & (d.meta.lang == lang)).length}
			{lang}
		/>
		<Columns {data} {lang} />
	</article>
{/if}
