
import { createClient } from '@/utils/supabase/server';
import ExamContainer from '@/components/exam/ExamContainer';
import { notFound } from 'next/navigation';

export default async function PracticePage({
    params,
    searchParams,
}: {
    params: { teilId: string };
    searchParams: { back?: string };
}) {
    // await params in Next.js 15+ (though 16.1 might be similar, safer to await)
    const teilId = (await params).teilId;
    const backLink = (await searchParams).back;

    const supabase = await createClient();

    // Fetch the specific Teil content
    // We also want to know which Theme it belongs to (for the title),
    // and which simple "Part" number it is (1 or 2).
    const { data: teil, error } = await supabase
        .from('teile')
        .select(`
            *,
            parts (part_number),
            theme_teile (
                themes (title)
            )
        `)
        .eq('id', teilId)
        .single();

    if (error || !teil) {
        return notFound();
    }

    // Resolve Theme Title
    // A teil might belong to multiple themes technically, but usually one.
    // We take the first one or a default.
    const linkedTheme = Array.isArray(teil.theme_teile)
        ? teil.theme_teile[0]
        : teil.theme_teile;

    // Resolve Part Number
    const partNum = Array.isArray(teil.parts)
        ? teil.parts[0]?.part_number
        : teil.parts?.part_number;

    const themeTitle = linkedTheme?.themes?.title || 'Practice Exercise';

    // Prepare content/solutions map for ExamContainer
    // ExamContainer expects { [partNum]: content }
    const partsContent: Record<number, any> = {};
    const partsSolutions: Record<number, any> = {};

    if (partNum && teil.content) {
        partsContent[partNum] = teil.content;
        partsSolutions[partNum] = teil.solution;
    }

    // If backLink is provided (from query param), use it.
    // Otherwise fallback to dashboard filter based on part number.
    const effectiveBackLink = backLink || `/?filter=part${partNum}`;

    return (
        <ExamContainer
            themeTitle={themeTitle}
            partsContent={partsContent}
            partsSolutions={partsSolutions}
            initialPart={partNum}
            singlePartMode={true}
            backLink={effectiveBackLink}
            teilId={Number(teilId)}
            partId={teil.part_id}
        />
    );
}
