<script>
	import { onMount } from 'svelte';
	import { selectedNode, items } from '../stores.js';

	import { observe } from '../utils.js';

	export let data;

	let htmlText = data.text;
	const footnoteRegex = /\[\^([^\]]+)\]/g;
	let footnoteCounter = 1;

	function getMainImage(id) {
		// let match = $items.filter((d) => d.data['o:id'] == id);
		// if (match && match.length > 0) {
		// 	let img = match?.[0].data?.thumbnail_display_urls?.medium;
		// 	return img;
		// }
	}

	const htmlWithCustomLinks = htmlText.replace(
		/<a\s+href="([^"]+)"\s*>([^<]+)<\/a>/g,
		(match, href, text) => {
			if (href.startsWith('http')) {
				return `<a class="external" target="_blank" href="${href}" title="${text}">${text}</a>`;
			} else {
				let img = getMainImage(`${href.split('/')[1]}`);
				if (img) {
					return `<a class="node-highlite" data-id="${
						href.split('/')[1]
					}" title="${text}">${text}(${href})</a><img src="${img}" alt="${text}"></img>`;
				} else {
					return `<a class="node-highlite" data-id="${
						href.split('/')[1]
					}" title="${text}">${text}(${href})</a>`;
				}
			}

			return match;
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
	const finalHtml = `${htmlWithFootnotes}<ol>${footnotes}</ol>`;

	onMount(async () => {
		observe();
	});

	function handleClick(event) {
		if (event.target.tagName === 'A') {
			if (event.target.getAttribute('data-id')) {
				$selectedNode = event.target.getAttribute('data-id');
				event.target.classList.toggle('selected');
			}
		}
	}

	$: {
		if ($selectedNode != null && typeof document !== 'undefined') {
			document.querySelectorAll('a[data-id]').forEach((link) => {
				link.classList.remove('selected');
			});

			let selected = document.querySelector(`a[data-id="${$selectedNode}"]`);
			if (selected) {
				$selectedNode == $selectedNode;
				selected.classList.add('selected');
			}
		}
	}
</script>

<div
	class="markdown"
	on:click={handleClick}
	on:keydown={(e) => {
		console.log('ciao');
		if (e.key === 'Enter' || e.key === ' ') {
			handleClick;
		}
	}}
>
	{@html finalHtml}
</div>

<style>
	:global(a) {
		color: blue;
		cursor: pointer;
	}

	:global(.node-highlite) {
		background-color: #d9ff00;
		color: black;
	}

	:global(.selected) {
		background-color: blue;
		color: white;
	}

	:global(sup) {
		padding-right: 0.5rem;
	}
</style>
