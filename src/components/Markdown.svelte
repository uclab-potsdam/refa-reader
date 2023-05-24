<script>
	import { onMount } from 'svelte';
	import { selectedNode } from '@stores';
	import { observe } from '@utils';

	export let data;
	export let items;

	let htmlText = data.text;
	const footnoteRegex = /\[\^([^\]]+)\]/g;
	let footnoteCounter = 1;

	function getMainImage(id) {
		let match = items.filter((d) => d.data?.['o:id'] == id);

		if (match && match.length > 0) {
			let img = match?.[0].data?.thumbnail_display_urls?.medium;
			return img;
		}
	}

	const htmlWithCustomLinks = htmlText.replace(
		/<a\s+href="([^"]+)"\s*>([^<]+)<\/a>/g,
		(match, href, text) => {
			if (href.startsWith('http')) {
				return `<a class="external" target="_blank" href="${href}" title="${text}">${text}</a>`;
			} else {
				return `<a class="node-highlite" data-id="${
					href.split('/')[1]
				}" title="${text}">${text}<span class="symbol node" data-id="${
					href.split('/')[1]
				}">●</span></a>`;
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

<div class="markdown" on:click={handleClick} on:keydown={handleClick}>
	{@html finalHtml}
</div>

<style>
	:global(a) {
		color: blue;
		cursor: pointer;
	}

	:global(.node-highlite) {
		font-family: "Inter", sans-serif;
		font-weight: 450;
		font-style: normal;
		font-size: 16px;
		color: black;
		background-color: rgb(242, 242, 242);
		cursor: pointer;
		border-radius: 2px;
		padding: 2px;
	}

	:global(.selected) {
		color: white;
		background-color: blue;
	}

	:global(.symbol) {
		font-size: 18px;
		line-height: 0;
		vertical-align: middle;
		color: blue;
		padding-left: 0.25rem;
	}

	:global(.selected .symbol) {
		color: white;
	}

	:global(sup) {
		padding-right: 0.5rem;
	}

	:global(sup ~ span) {
		display: none;
	}

	:global(sup a) {
		text-decoration: none;
		color: black;
	}
</style>
