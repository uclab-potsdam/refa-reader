<script>
	import { onMount } from 'svelte';
	export let data;
	export let items;
	export let scrollTopVal;

	let htmlText = data.text;
	const footnoteRegex = /\[\^([^\]]+)\]/g;
	let footnoteCounter = 1;

	const htmlWithCustomLinks = htmlText.replace(
		/<a\s+href="([^"]+)"\s*>([^<]+)<\/a>/g,
		(match, href, text) => {
			if (href.startsWith('http')) {
				return `<a class="external" target="_blank" href="${href}" title="${text}">${text}</a>`;
			} else {
				// let uniqueId = newUniqueId();
				let uniqueId = href.split('/')[1];
				return `<a class="node-highlite" unique-id="${uniqueId}" id="${href.split('/')[1]}"
				data-id="${href.split('/')[1]}" title="${text}">${text}
				<span class="symbol node" unique-id="${uniqueId}" data-id="item_${href.split('/')[1]}"
				data-class="${items
					.filter((d) => d.label == text)
					.map((d) => {
						return d.data?.['@type']?.[1];
					})}">
					●
					</span></a>`;
			}
		}
	);

	const htmlWithFootnotes = htmlWithCustomLinks.replace(footnoteRegex, (match, footnoteText) => {
		const footnoteNumber = footnoteCounter++;
		return `<sup id="fn-${footnoteNumber}"><a href="#fnref-${footnoteNumber}">${footnoteNumber}</a></sup><span id="fn-${footnoteNumber}-content">${footnoteText}</span>`;
	});

	const footnotes = Array.from({ length: footnoteCounter - 1 }, (_, i) => {
		const footnoteNumber = i + 1;
		const footnoteContent = htmlWithFootnotes.match(
			new RegExp(`<span id="fn-${footnoteNumber}-content">([^<]+)<\/span>`)
		)[1];
		return `<li id="fnref-${footnoteNumber}"> ${footnoteContent}</li>`;
	}).join('');
	const finalHtml = `${htmlWithFootnotes}
	<ol class="biblio">${footnotes}</ol>`;

	let markdownItems;
	let offset = 100;
	onMount(async () => {
		markdownItems = document?.querySelectorAll('.markdown a[data-id]');
		adjustOffsetTops(markdownItems);
	});

	function adjustOffsetTops(items) {
		let lastOffset = null;
		markdownItems = Array.from(items).map((item) => {
			let currentOffset = item.offsetTop;
			if (lastOffset !== null && currentOffset <= lastOffset) {
				item.adjustedOffsetTop = lastOffset + offset; // Add a custom property to store the adjusted offset
			} else {
				item.adjustedOffsetTop = currentOffset;
			}
			lastOffset = item.adjustedOffsetTop;
			return item;
		});
	}
	let idx = 0;
	$: handleScroll(markdownItems, scrollTopVal);

	function handleScroll(items, scrollTopVal) {
		let firstInEssay = items?.[idx]?.adjustedOffsetTop;
		let secondInEssay = items?.[idx + 1]?.adjustedOffsetTop;
		let firstInEssayId = items?.[idx]?.getAttribute('data-id');
		let secondInEssayId = items?.[idx + 1]?.getAttribute('data-id');
		let firstInGraph = document.querySelector(`.node[data-id="${firstInEssayId}"]`)?.offsetTop;
		let secondInGraph = document.querySelector(`.node[data-id="${secondInEssayId}"]`)?.offsetTop;
		let percentageDistance = getPercentageDistance(scrollTopVal, firstInEssay, secondInEssay);
		let pixelDistance = getPixelDistance(percentageDistance, firstInGraph, secondInGraph);

		if (scrollTopVal > secondInEssay) {
			idx++;
		}

		if (scrollTopVal < firstInEssay && idx != 0) {
			idx--;
		}

		const selectedItem = document.querySelector('.links:first-of-type');

		if (firstInEssay && secondInEssay && selectedItem && percentageDistance && pixelDistance) {
			selectedItem?.scrollTo({
				top: pixelDistance
			});
		}
	}

	function getPercentageDistance(scrollTop, firstPoint, secondPoint) {
		const totalDistance = secondPoint - firstPoint;
		const distanceFromFirst = scrollTop - firstPoint;
		const percentage = (distanceFromFirst / totalDistance) * 100;
		return percentage;
	}

	function getPixelDistance(percentage, firstPoint, secondPoint) {
		const distanceFromFirst = secondPoint - firstPoint;
		return firstPoint + (distanceFromFirst * percentage) / 100;
	}
</script>

<h1>{data.meta.title}</h1>
<div class="metadata">
	{#if data.meta?.author}
		<div class="author">{data.meta.author}</div>
	{/if}
	{#if data.meta?.date}
		<div class="date">{new Date(data.meta.date)?.toLocaleDateString(data.meta.lang)}</div>
	{/if}
</div>
<div class="markdown">
	{@html finalHtml}
</div>

<style>
	h1 {
		text-align: center;
		margin-top: 40px;
		margin-bottom: 0.5rem;
		font-size: 2em;
		line-height: 1em;
	}

	.markdown {
		font-weight: 400;
		padding-bottom: 40vh;
		padding-top: 5vh;
		font-size: 1.4rem;
		line-height: 1.35;
	}

	.metadata {
		/* padding-top: 1rem; */
		text-align: center;
		/* display: flex;
		justify-content: space-between; */
	}

	.author,
	.date {
		font-size: 1rem;
	}

	:global(a) {
		color: var(--theme-color);
		cursor: pointer;
	}

	:global(.markdown a) {
		color: black;
		font-size: 0.9em;
		text-decoration: underline dotted;
		text-underline-offset: 2px;
		text-decoration-color: var(--theme-color);
	}

	:global(.node-highlite) {
		font-family: 'Inter', sans-serif;
		font-weight: 450;
		font-style: normal;
		font-size: 0.7em !important;
		color: black;
		cursor: text;
		border-radius: 2px;
		padding: 2px;
		text-decoration: unset !important;
		box-shadow: inset 0px 0px 2px 0px var(--theme-color);
		background: white;
		position: relative;
		z-index: 10;
	}

	:global(.markdown *:is(h1, h2, h3, h4, h5, h6)) {
		font-family: 'Redaction', serif;
	}

	:global(.markdown h1) {
		font-size: 1.4em;
		line-height: 1.1em;
		font-weight: 400;
	}

	:global(.markdown h2) {
		font-size: 1.3em;
		line-height: 1em;
		font-weight: 400;
	}

	:global(.markdown h3) {
		font-size: 1.2em;
		line-height: 1em;
		font-weight: 400;
	}

	:global(.markdown h4) {
		font-size: 0.8em;
		font-weight: 400;
	}

	:global(.biblio) {
		font-size: 0.875rem;
	}

	:global(.markdown h1),
	:global(.markdown h2),
	:global(.markdown h3),
	:global(.markdown h4) {
		text-align: center;
		border-top: 1px solid var(--light-grey);
		padding-top: 1rem;
		margin: 3rem 0 1rem 0;
	}

	:global(.markdown > p),
	:global(.markdown blockquote),
	:global(.markdown ul),
	:global(.biblio) {
		font-family: 'Redaction', sans-serif;
		margin-bottom: 1rem;
	}

	:global(.markdown li) {
		padding-bottom: 1rem;
	}

	:global(.markdown > p) {
		text-indent: 2rem;
	}

	:global(em .node-highlite) {
		font-style: italic;
	}

	:global(.node-highlite span) {
		font-style: normal;
		position: relative;
	}

	:global(.symbol) {
		font-size: 1em;
		line-height: 0;
		vertical-align: middle;
		color: var(--theme-color);
	}

	:global(sup) {
		padding-right: 0.5rem;
		line-height: 0;
	}

	:global(sup ~ span) {
		display: none;
	}

	:global(sup a) {
		text-decoration: none !important;
		color: var(--theme-color) !important;
	}
</style>
