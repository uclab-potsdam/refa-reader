<script>
	import { page } from '$app/stores';
	import Columns from '@components/Columns.svelte';
	import Header from '@components/Header.svelte';
	import Language from '@components/Language.svelte';
	import { onMount } from 'svelte';
	import * as config from '@setup';
	export let data;

	let lang = '';
	onMount(async () => {
		const storedLanguage = localStorage.getItem('selectedLanguage');
		if (storedLanguage) {
			lang = storedLanguage;
		} else {
			lang = config.languages[0];
		}
	});
</script>

{#if config && lang}
	<article style="--theme-color:blue">
		<Language bind:lang languages={config.languages} />
		<Header
			essays={data.posts.filter((d) => d.meta.isPublic & (d.meta.lang == lang)).length}
			{lang}
			description={config.description}
			title={config.title}
		/>
		<Columns {data} {lang} />
	</article>
{/if}

<svelte:head>
	<title>{config.title}</title>
	<meta name="description" content={config.descriptionSeo} />
	<meta property="og:url" content={$page.url.origin} />
	<meta property="og:title" content={config.title} />
	<meta property="og:description" content={config.descriptionSeo} />
	<meta property="og:image" content={config.imageSeo} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={$page.url.origin} />
	<meta name="twitter:title" content={config.title} />
	<meta name="twitter:description" content={config.descriptionSeo} />
	<meta name="twitter:image" content={config.imageSeo} />
</svelte:head>
