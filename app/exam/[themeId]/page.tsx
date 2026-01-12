
import { createClient } from '@/utils/supabase/server';
import ExamContainer from '@/components/exam/ExamContainer';
import { notFound } from 'next/navigation';

export default async function ExamPage({
    params,
    searchParams,
}: {
    params: { themeId: string };
    searchParams: { part?: string };
}) {
    const themeId = (await params).themeId;
    const partParam = (await searchParams).part;
    const initialPart = partParam ? parseInt(partParam, 10) : 1;

    const supabase = await createClient();

    // Fetch Theme details
    const { data: theme, error: themeError } = await supabase
        .from('themes')
        .select('*')
        .eq('id', themeId)
        .single();

    if (themeError || !theme) {
        return notFound();
    }

    // Fetch ALL parts for this theme
    const { data: themeTeile } = await supabase
        .from('theme_teile')
        .select(`
      teil_id,
      teile (*),
      parts (part_number)
    `)
        .eq('theme_id', themeId);

    // Transform to map { partNumber: content }
    const partsContent: Record<number, any> = {};
    const partsSolutions: Record<number, any> = {};

    themeTeile?.forEach((item: any) => {
        // Handle array/object mismatch if any
        const teileObj = Array.isArray(item.teile) ? item.teile[0] : item.teile;
        const partNum = Array.isArray(item.parts) ? item.parts[0]?.part_number : item.parts?.part_number;

        if (typeof partNum === 'number' && teileObj) {
            partsContent[partNum] = teileObj.content;
            partsSolutions[partNum] = teileObj.solution;
        }
    });

    // Calculate Next Exam Link & Progress
    // We need to find the "next" theme that has the SAME part.
    let nextExamLink = null;
    let singlePartMode = false;
    let progress = { current: 0, total: 0 };

    if (partParam) {
        singlePartMode = true;
        const currentPartNum = parseInt(partParam, 10);

        // Fetch all themes that include this specific part
        const { data: themesWithPart } = await supabase
            .from('theme_teile')
            .select(`
                theme_id,
                themes!inner(id),
                parts!inner(part_number)
            `)
            .eq('parts.part_number', currentPartNum)
            .order('theme_id', { ascending: true }); // Ensure consistent ordering

        if (themesWithPart) {
            // Extract unique ordered theme IDs
            const orderedThemeIds = Array.from(new Set(themesWithPart.map((t: any) => t.theme_id)));
            const currentIndex = orderedThemeIds.indexOf(themeId);

            progress = {
                current: currentIndex + 1,
                total: orderedThemeIds.length
            };

            if (currentIndex !== -1 && currentIndex < orderedThemeIds.length - 1) {
                const nextId = orderedThemeIds[currentIndex + 1];
                nextExamLink = `/exam/${nextId}?part=${currentPartNum}`;
            }
        }

    } else {
        // Default Full Exam Sequence
        const { data: allThemes } = await supabase
            .from('themes')
            .select('id')
            .order('id', { ascending: true });

        if (allThemes) {
            const currentIndex = allThemes.findIndex(t => t.id === themeId);

            progress = {
                current: currentIndex + 1,
                total: allThemes.length
            };

            if (currentIndex !== -1 && currentIndex < allThemes.length - 1) {
                const nextTheme = allThemes[currentIndex + 1];
                nextExamLink = `/exam/${nextTheme.id}`;
            }
        }
    }

    return (
        <ExamContainer
            themeTitle={theme.title}
            partsContent={partsContent}
            partsSolutions={partsSolutions}
            initialPart={initialPart}
            nextExamLink={nextExamLink}
            singlePartMode={singlePartMode}
            progress={progress}
        />
    );
}
