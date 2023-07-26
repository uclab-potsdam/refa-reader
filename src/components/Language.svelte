<script>
	import { onMount } from 'svelte';

	export let lang;

	function switchLanguage(newLang) {
		lang = newLang;
		localStorage.setItem('selectedLanguage', newLang);
	}

	onMount(() => {
		const storedLanguage = localStorage.getItem('selectedLanguage');
		if (storedLanguage) {
			lang = storedLanguage;
		}
	});
</script>

<div>
	<span
		on:click={() => switchLanguage('en')}
		on:keydown={() => switchLanguage('en')}
		class:selected={lang === 'en'}
		disabled={lang === 'en'}>EN</span
	>
	/
	<span
		on:click={() => switchLanguage('de')}
		on:keydown={() => switchLanguage('de')}
		class:selected={lang === 'de'}
		disabled={lang === 'de'}
	>
		DE</span
	>
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
