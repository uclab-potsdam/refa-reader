<script>
	import { page } from '$app/stores';
	import * as config from '../setup.json';
</script>

<svelte:head>
	<title>{config.title}</title>
	<meta name="description" content={config.descriptionSeo} />
	<meta property="og:url" content={$page.url.origin} />
	<meta property="og:title" content={config.title} />
	<meta property="og:description" content={config.descriptionSeo} />
	<meta property="og:image" content={config.imageSeo} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={$page.url.origin} />
	<meta name="twitter:title" content="Restaging Fashion" />
	<meta name="twitter:description" content={config.descriptionSeo} />
	<meta name="twitter:image" content={config.imageSeo} />
</svelte:head>

<slot />
