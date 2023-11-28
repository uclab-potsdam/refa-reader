<script>
	import { page } from '$app/stores';
	import * as config from '@setup';

    const essayData = [...$page.data.posts].find((d) => d.path.includes($page.params.slug));
</script>

<svelte:head>
	<title>{essayData?.meta?.title || config.title}</title>
	<meta name="description" content={essayData?.meta?.description || config.descriptionSeo} />
	<meta property="og:url" content={$page.url.origin} />
	<meta property="og:title" content={essayData?.meta?.title || config.title} />
	<meta property="og:description" content={essayData?.meta?.description || config.descriptionSeo} />
	<meta property="og:image" content={essayData?.meta?.cover|| config.imageSeo} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={$page.url.origin} />
	<meta name="twitter:title" content={essayData?.meta?.title || config.title} />
	<meta name="twitter:description" content={essayData?.meta?.description || config.descriptionSeo} />
	<meta name="twitter:image" content={essayData?.meta?.cover|| config.imageSeo} />
</svelte:head>

<slot />
