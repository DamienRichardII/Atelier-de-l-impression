// Les demandes de devis ont été retirées : tous les produits se commandent en ligne. Ce fichier peut être supprimé.
export function POST() { return Response.json({ error: "Les demandes de devis ne sont plus disponibles." }, { status: 410 }); }
