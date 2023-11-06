
import { fetchMarkdownData } from '$lib/utils'
import { json } from '@sveltejs/kit'

export const GET = async () => {
    const allPosts = await fetchMarkdownData()

    const sortedPosts = allPosts.sort((a, b) => {
        return new Date(b.path) - new Date(a.path)
    })

    return json(sortedPosts)
}