<script>
	import { page } from '$app/stores';

	export let data;
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content={$page.url.origin} />
	<meta property="og:title" content={data.title} />
	<meta property="og:description" content={data.description} />
	<meta property="og:image" content={data.image} />
	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={$page.url.origin} />
	<meta name="twitter:title" content="Restaging Fashion" />
	<meta name="twitter:description" content={data.description} />
	<meta name="twitter:image" content={data.image} />
</svelte:head>
