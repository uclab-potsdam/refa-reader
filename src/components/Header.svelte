<script>
	export let essays;
	export let lang;
</script>

<header>
	{#if lang == 'en'}
		<h3>
			An interactive visualisation that provides access to a selection of objects from the
			'Lipperheidesche Kostümbibliothek'. <br />
			 <span>{essays}</span> {essays === 1 ? 'essay is' : 'essays are'} juxtaposed with a graph navigation that allows the user to browse
			the paintings, prints, drawings and clothes in the collection. Instead of showing the collection
			in its entirety, it is accessible through a curated selection of essays designed to provide a better
			understanding of it. The aim is to combine editorial approaches with free navigation of the collection.
		</h3>
	{:else if lang == 'de'}
		IN GERMAN
		<h3>
			An interactive visualisation that provides access to a selection of objects from the
			'Lipperheidesche Kostümbibliothek'. <br />
			 <span>{essays}</span> {essays === 1 ? 'essay is' : 'essays are'} juxtaposed with a graph navigation that allows the user to browse
			the paintings, prints, drawings and clothes in the collection. Instead of showing the collection
			in its entirety, it is accessible through a curated selection of essays designed to provide a better
			understanding of it. The aim is to combine editorial approaches with free navigation of the collection.
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
</style>
