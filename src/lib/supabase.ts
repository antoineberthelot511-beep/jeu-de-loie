import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Throwing here would crash the whole client bundle at import time (every page imports
  // `supabase`), breaking hydration so buttons show their CSS :active state but no onClick
  // ever fires. Log clearly instead and fall back to a placeholder so the app still loads;
  // actual Supabase calls will then fail with a visible network error inside each handler's
  // try/catch.
  console.error(
    "Supabase: NEXT_PUBLIC_SUPABASE_URL et/ou NEXT_PUBLIC_SUPABASE_ANON_KEY sont manquantes. " +
      "Vérifie les variables d'environnement de ce déploiement (elles doivent être définies au build)."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);
