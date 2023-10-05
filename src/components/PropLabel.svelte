<script>
	export let label;
</script>

{#if label}
	<p>{label}:</p>
{/if}

<style>
	p {
		position: absolute;
		margin-right: 20px;
		text-align: right;
		font-size: 0.675rem;
		color: var(--theme-color);
	}
</style>