<script>
	export let essays;
	export let lang;
	export let description;
</script>

<header>
	{#if description[lang]}
		<h3>
			{description[lang]}
		</h3>
	{/if}
</header>

<style>
	header {
		min-height: 200px;
		padding: 1.4rem;
	}

	h3 {
		font-weight: 400;
		width: 65%;
		font-size: 1.4rem;
	}
	span {
		color: blue;
	}

	@media only screen and (max-width: 600px) {
		h3 {
			width: 100%;
			padding-top: 20px;
		}
	}
</style>
