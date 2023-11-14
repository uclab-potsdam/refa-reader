<script>
	export let title;
	export let lang;
	export let description;
</script>

<header>
	<h1>{title}</h1>
	{#if description[lang]}
		<h3>
			{description[lang]}
		</h3>
	{/if}
</header>

<style>
	header {
		min-height: 200px;
		padding: 10px;
	}

	h3 {
		font-weight: 400;
		width: 65%;
		font-size: 1.4rem;
	}
	span {
		color: blue;
	}

	@media only screen and (max-width: 800px) {
		h3 {
			width: 100%;
			padding-top: 20px;
		}
	}
</style>
