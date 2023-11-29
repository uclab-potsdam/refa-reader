export const load = async ({ fetch }) => {
    const response = await fetch(`/api/posts`)
    const posts = await response.json()

    return {
        posts
    }
}

import { fetchMarkdownData } from '$lib/utils'

export const prerender = true;
export const entries = async () => {
    const allPosts = await fetchMarkdownData()
    const sortedPosts = allPosts.sort()

    return sortedPosts.map(post => ({
        slug: post.path.replaceAll("/",""),
    }));
}