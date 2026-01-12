import { createClient } from '@/utils/supabase/server';
import { signout } from '@/app/login/actions';
import { getLatestPracticeAttempts } from '@/utils/supabase/attempts';
import Link from 'next/link';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const filter = (await searchParams).filter || 'all';

  // Common: Fetch Parts to map "part1"/"part2" to IDs
  const { data: partsData } = await supabase.from('parts').select('*');
  const parts = partsData || [];

  let themeList: any[] = [];
  let teileList: any[] = [];

  if (filter === 'all') {
    // ---------------------------------------------------------
    // "All" View: Grouped by Theme (Full Exams)
    // ---------------------------------------------------------
    const { data: themeTeile } = await supabase.from('theme_teile').select(`
      theme_id,
      themes (id, title, description),
      parts (id, part_number, name)
    `);

    // Group by Theme
    const themesMap = new Map();
    themeTeile?.forEach((item: any) => {
      if (!themesMap.has(item.theme_id)) {
        themesMap.set(item.theme_id, {
          ...item.themes,
          parts: []
        });
      }
      themesMap.get(item.theme_id).parts.push(item.parts);
    });

    themeList = Array.from(themesMap.values());

  } else {
    // ---------------------------------------------------------
    // Filtered View: Direct List of Teile (e.g. "All Part 1s")
    // ---------------------------------------------------------
    const targetPartNum = filter === 'part1' ? 1 : 2;
    const targetPart = parts.find((p: any) => p.part_number === targetPartNum);

    if (targetPart) {
      // Query 'teile' directly as requested
      // We join 'theme_teile' only to get the theme_id for the link
      const { data: teileData } = await supabase
        .from('teile')
        .select(`
          *,
          theme_teile (theme_id, themes (title))
        `)
        .eq('part_id', targetPart.id);

      teileList = teileData || [];
    }
  }

  // Fetch latest practice attempts for the logged-in user
  const practiceAttempts = user ? await getLatestPracticeAttempts() : [];
  const practiceScoreMap = new Map<number, { obtained: number; possible: number }>();
  practiceAttempts.forEach((attempt: any) => {
    practiceScoreMap.set(attempt.teil_id, {
      obtained: Number(attempt.obtained),
      possible: Number(attempt.possible),
    });
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-telc-blue dark:text-gray-100">Deutsch B2 Exam Simulator</h1>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {user.email}
              </span>
              <form action={signout}>
                <button className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1 rounded transition-colors text-gray-800 dark:text-gray-200">
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-telc-blue text-white hover:bg-blue-700 px-4 py-2 rounded transition-colors font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <Link
          href="/dashboard"
          className={`px-4 py-2 rounded transition-colors ${filter === 'all' ? 'bg-telc-blue text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          Themes (Full Exams)
        </Link>
        <Link
          href="/dashboard?filter=part1"
          className={`px-4 py-2 rounded transition-colors ${filter === 'part1' ? 'bg-telc-blue text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          All Part 1 (Leseverstehen)
        </Link>
        <Link
          href="/dashboard?filter=part2"
          className={`px-4 py-2 rounded transition-colors ${filter === 'part2' ? 'bg-telc-blue text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          All Part 2 (Leseverstehen)
        </Link>
      </div>

      <div className="grid gap-4">
        {/* VIEW: All Themes */}
        {filter === 'all' && themeList.map((theme: any) => (
          <Link key={theme.id} href={`/exam/${theme.id}`} className="block">
            <div className="border border-gray-300 rounded p-4 hover:shadow-md transition bg-white dark:bg-gray-800 dark:border-gray-700 group">
              <h2 className="text-xl font-bold text-telc-blue dark:text-blue-300 group-hover:text-telc-red transition-colors">
                {theme.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{theme.description || 'No description'}</p>
              <div className="mt-2 flex gap-2">
                {theme.parts.map((p: any) => (
                  <span key={p.id} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                    Part {p.part_number}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}

        {/* VIEW: Filtered Parts (Teile) */}
        {filter !== 'all' && teileList.map((teil: any) => {
          // Attempt to resolve theme linkage for navigation.
          // If a Teil is used in multiple themes, this might be an array.
          // We'll take the first one found.
          const linkedTheme = Array.isArray(teil.theme_teile)
            ? teil.theme_teile[0]
            : teil.theme_teile;

          const themeId = linkedTheme?.theme_id;
          // User requested to use the teil.title directly
          const displayTitle = teil.title || linkedTheme?.themes?.title || 'Practice Unit';

          // Get user's score for this teil (if any)
          const score = practiceScoreMap.get(teil.id);

          return (
            <Link
              key={teil.id}
              href={`/practice/${teil.id}`}
              className="block"
            >
              <div className="border border-gray-300 rounded p-4 hover:shadow-md transition bg-white group flex justify-between items-center dark:bg-gray-800 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-telc-blue group-hover:text-telc-red transition-colors dark:text-blue-300">
                    {displayTitle}
                  </h2>
                  <p className="text-gray-600 mb-1 dark:text-gray-400">
                    {/* Optionally show some preview text from content if needed */}
                    Exercise Unit
                  </p>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-200 font-bold dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-900/50">
                    {filter === 'part1' ? 'Leseverstehen Teil 1' : 'Leseverstehen Teil 2'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Score Badge */}
                  {score && (
                    <div className={`text-sm font-bold px-3 py-1 rounded ${score.obtained === score.possible
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      }`}>
                      {score.obtained}/{score.possible}
                    </div>
                  )}
                  <div className="text-gray-400 text-2xl group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {filter !== 'all' && teileList.length === 0 && (
          <p className="text-gray-500 italic">No exercises found for this part.</p>
        )}
      </div>
    </div>
  );
}
