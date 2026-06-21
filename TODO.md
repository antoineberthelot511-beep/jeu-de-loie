\# TODO — jeu-de-loie



\## Règle agent

Traite UNE seule tâche non cochée à la fois. Coche-la, commit, stop.



\## Tâches

\- \[x] \*\*1. Sauver le design du narrateur\*\*

&#x20; - Fichiers : src/app/host/\[code]/page.tsx, src/lib/supabase.ts

&#x20; - Fini quand : le bouton "Enregistrer" écrit elements + canvasBg dans la table `games` (colonne jsonb `board`), "Charger" relit depuis Supabase au lieu du localStorage.



\- \[x] \*\*2. Le joueur voit le plateau en temps réel\*\*

&#x20; - Fichiers : src/app/play/\[code]/page.tsx

&#x20; - Fini quand : ce que le narrateur place et enregistre s'affiche sur le téléphone du joueur, et se met à jour en live (abonnement Supabase).



\- \[x] \*\*3. Outil "pion joueur"\*\*

&#x20; - Fichiers : src/app/host/\[code]/page.tsx

&#x20; - Fini quand : un bouton ajoute un pion sur le canvas pour chaque joueur connecté (avec son avatar/pseudo), déplaçable par le narrateur.



\- \[ ] \*\*4. Le joueur déplace son propre pion\*\*

&#x20; - Fichiers : src/app/play/\[code]/page.tsx

&#x20; - Fini quand : depuis son tel le joueur peut bouger SON pion, et ça se synchronise sur le canvas du narrateur en temps réel.



\- \[ ] \*\*5. Mode "jeu" (verrou édition)\*\*

&#x20; - Fichiers : src/app/host/\[code]/page.tsx

&#x20; - Fini quand : un bouton bascule entre "Édition" (on construit le plateau) et "Jeu" (plus d'ajout/suppression, seuls les pions bougent).



\- \[ ] \*\*6. Dé / lancer\*\*

&#x20; - Fini quand : en mode Jeu, un bouton lance un dé (1-6) et le résultat s'affiche pour tous.



\- \[ ] \*\*7. Export du plateau en PNG\*\*

&#x20; - Fini quand : un bouton télécharge le canvas en image.

