<script>
	export let label;
</script>

{#if label}
	<p>{label}:</p>
{/if}

<style>
	p {
		font-size: 0.675rem;
		color: var(--theme-color);
	}
</style>