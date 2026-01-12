'use server'

import { createClient } from '@/utils/supabase/server'

// Points per correct answer for Part 1 and Part 2
const POINTS_PER_QUESTION = 5

export interface AttemptData {
    teilId: number
    partId: number
    themeId?: number | null
    correctCount: number
    totalCount: number
}

export async function saveAttempt(data: AttemptData) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'User not authenticated' }
    }

    const obtained = data.correctCount * POINTS_PER_QUESTION
    const possible = data.totalCount * POINTS_PER_QUESTION

    const { error } = await supabase.from('attempts').insert({
        user_id: user.id,
        teil_id: data.teilId,
        part_id: data.partId,
        theme_id: data.themeId || null,
        correct_count: data.correctCount,
        total_count: data.totalCount,
        obtained,
        possible,
    })

    if (error) {
        console.error('Error saving attempt:', error)
        return { error: error.message }
    }

    return { success: true, obtained, possible }
}

export async function getLatestPracticeAttempts() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get latest practice attempt per teil (where theme_id is null)
    const { data, error } = await supabase
        .from('attempts')
        .select('teil_id, correct_count, total_count, obtained, possible, created_at')
        .eq('user_id', user.id)
        .is('theme_id', null)
        .order('created_at', { ascending: false })

    if (error || !data) return []

    // Deduplicate to get only latest per teil
    const latestByTeil = new Map<number, typeof data[0]>()
    data.forEach(attempt => {
        if (!latestByTeil.has(attempt.teil_id)) {
            latestByTeil.set(attempt.teil_id, attempt)
        }
    })

    return Array.from(latestByTeil.values())
}

export async function getLatestThemeAttempts(themeId: number) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get latest attempt per part for this theme
    const { data, error } = await supabase
        .from('attempts')
        .select('part_id, correct_count, total_count, obtained, possible, created_at')
        .eq('user_id', user.id)
        .eq('theme_id', themeId)
        .order('created_at', { ascending: false })

    if (error || !data) return []

    // Deduplicate to get only latest per part
    const latestByPart = new Map<number, typeof data[0]>()
    data.forEach(attempt => {
        if (!latestByPart.has(attempt.part_id)) {
            latestByPart.set(attempt.part_id, attempt)
        }
    })

    return Array.from(latestByPart.values())
}

// Get aggregated theme scores for dashboard
export async function getThemeScores() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Map()

    const { data, error } = await supabase
        .from('attempts')
        .select('theme_id, part_id, obtained, possible, created_at')
        .eq('user_id', user.id)
        .not('theme_id', 'is', null)
        .order('created_at', { ascending: false })

    if (error || !data) return new Map()

    // Group by theme, then get latest per part within each theme
    const themeScores = new Map<number, { obtained: number; possible: number }>()
    const seenThemeParts = new Set<string>()

    data.forEach(attempt => {
        const key = `${attempt.theme_id}-${attempt.part_id}`
        if (!seenThemeParts.has(key)) {
            seenThemeParts.add(key)

            const current = themeScores.get(attempt.theme_id!) || { obtained: 0, possible: 0 }
            themeScores.set(attempt.theme_id!, {
                obtained: current.obtained + Number(attempt.obtained),
                possible: current.possible + Number(attempt.possible),
            })
        }
    })

    return themeScores
}
