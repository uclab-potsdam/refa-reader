<script>
	import { onMount } from 'svelte';
	import { Api, selectedNode, visibleLinks } from '../stores.js';
	import { observe } from '../utils.js';

	export let data;

	let htmlText = data.text;

	const footnoteRegex = /\[\^([^\]]+)\]/g;

	let footnoteCounter = 1;

	const htmlWithCustomLinks = htmlText.replace(
		/<a\s+href="([^"]+)"\s*>([^<]+)<\/a>/g,
		(match, href, text) => {
			if (!href.startsWith('http') && !href.startsWith('https')) {
				return `<a class="node-highlite" data-id="${Api}/resources/${href}" title="${text}">${text}(${href})</a>`;
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
		if ($selectedNode != null) {
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
		if (e.key === 'Enter' || e.key === ' ') {
			handleClick;
		}
	}}
>
	{@html finalHtml}
</div>

<style>
	.markdown {
		font-size: 20px;
	}

	:global(a) {
		color: blue;
	}

	:global(.node-highlite) {
		color: green;
	}

	:global(.selected) {
		background-color: blue;
		color: black;
	}
</style>
