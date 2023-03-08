<script>
	import { marked } from 'marked';
	export let data;

	const Api = 'https://uclab.fh-potsdam.de/refa/api';

	const renderer = new marked.Renderer();
	renderer.link = (href, title, text) => {
		if (href.includes('http')) {
			return `<a class="external" target="_blank" href="${href}" title="${text}">${text}</a>`;
		} else {
			return `<a class="node-highlite" data-id="${Api}/resources/${href}" title="${text}">${text}(${href})</a>`;
		}
	};

	// Add a custom rule for parsing footnotes
	const footnoteRE = /\[\^([^\]]+)\]/g;
	let nextFootNoteId = 1;
	let footnotes = {};
	renderer.text = (text) => {
		let output = text;
		// Find all footnotes in the text
		output = output.replace(footnoteRE, (match, noteId) => {
			let footnote = footnotes[noteId];
			if (!footnote) {
				footnote = { id: nextFootNoteId, text: noteId };
				footnotes[noteId] = footnote;
				nextFootNoteId++;
			}
			return `<sup class="footnote-reference" id="footnote-reference-${footnote.id}"><a href="#footnote-${footnote.id}">${footnote.id}</a></sup>`;
		});
		return output;
	};
	const htmlPromise = new Promise((resolve) => {
		const html = marked(data.text, { renderer });
		resolve(html);
	});

	let biblio;

	htmlPromise.then((html) => {
		// Render the footnotes
		const footnotesHTML = Object.values(footnotes)
			.map((footnote) => {
				return `<li id="footnote-${footnote.id}">${footnote.text} <a href="#footnote-reference-${footnote.id}">&#8617;</a></li>`;
			})
			.join('');
		biblio = `<ol class="footnotes">${footnotesHTML}</ol>`;
	});

	$: html = marked(data.text, { renderer });

	// function getMainImage(id) {
	//     let match = $selectedMarkdown.items.filter((d) => d.url == id);
	//     if (match && match.length > 0) {
	//         let img = match?.[0].data?.thumbnail_display_urls?.medium;
	//         return img;
	//     }
	// }
</script>

<div class="markdown">
	{@html html}
	<div class="biblio">{@html biblio}</div>
</div>
