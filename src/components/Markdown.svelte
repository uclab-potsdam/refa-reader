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
	const finalHtml = `${htmlWithFootnotes}<ol class="biblio">${footnotes}</ol>`;

	let markdownItems;
	onMount(async () => {
		// observe();
		markdownItems = document?.querySelectorAll('.markdown a[data-id]');
	});

	let idx = 0;
	$: handleScroll(markdownItems, scrollTopVal);

	function handleScroll(items, scrollTopVal) {
		if (items?.[idx] && items?.[idx + 1]) {
			let firstInEssay = items[idx].offsetTop;
			let firstInEssayId = items[idx].getAttribute('data-id');
			let secondInEssay = items[idx + 1].offsetTop;
			let secondInEssayId = items[idx + 1].getAttribute('data-id');
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

			if (selectedItem && percentageDistance && pixelDistance) {
				selectedItem?.scrollTo({
					top: pixelDistance
				});
			}
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
<div class="markdown">
	{@html finalHtml}
</div>

<style>
	h1 {
		text-align: center;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 1.5em;
	}

	.markdown {
		padding-bottom: 40vh;
		padding-top: 5vh;
		font-size: 1.4rem;
		line-height: 1.3;
		text-shadow: 1px 1px 15px white;
	}

	:global(a) {
		color: var(--theme-color);
		cursor: pointer;
	}

	:global(.markdown a) {
		color: black;
		font-size: 0.9em;
		text-decoration: underline;
		text-underline-offset: 2px;
		text-decoration-color: var(--theme-color);
	}

	:global(.node-highlite) {
		font-family: 'Inter', sans-serif;
		font-weight: 450;
		font-style: normal;
		font-size: 0.7em !important;
		color: black;
		/* background-color: #f2f2f2; */
		cursor: text;
		border-radius: 2px;
		padding: 2px;
		text-decoration: unset !important;
		text-shadow: none;
		box-shadow: inset 0px 0px 5px 0px var(--theme-color);
	}

	:global(em .node-highlite) {
		font-style: italic;
	}
	:global(.node-highlite span) {
		font-style: normal;
		position: relative;
		top: -3px;
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
