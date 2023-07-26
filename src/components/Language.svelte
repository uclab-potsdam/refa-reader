<script>
	export let lang;

	function switchLanguage(newLang) {
		lang = newLang;
	}
</script>

<div>
	<span on:click={() => switchLanguage('en')} class:selected={lang === 'en'} disabled={lang === 'en'}>EN</span> /
	<span on:click={() => switchLanguage('de')} class:selected={lang === 'de'} disabled={lang === 'de'}> DE</span>
</div>

<style>
	div {
		position: absolute;
		top: 10px;
		right: 10px;
        cursor: pointer;
	}

	.selected {
        color: blue;
	}
</style>
