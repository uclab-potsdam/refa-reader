
import { fetchMarkdownData } from '$lib/utils'
import { json } from '@sveltejs/kit'

export const GET = async () => {
    const allPosts = await fetchMarkdownData()
    const sortedPosts = allPosts.sort()
    return json(sortedPosts)
}

export const prerender = true;