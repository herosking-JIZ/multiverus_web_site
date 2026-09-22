/**
 * SCRIPT DE TEST CSRF POUR LE PROJET BZT
 * Ce script simule un client frontend (comme React ou Vue)
 * pour tester que le nouveau middleware CSRF fonctionne.
 */

const BASE_URL = 'http://localhost:8080';

async function runTest() {
    console.log("🔍 Étape 1 : Récupération du Token CSRF...");

    try {
        const response = await fetch(`${BASE_URL}/api/csrf-token`);

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        // On récupère le corps JSON
        const data = await response.json();
        const token = data.csrfToken;

        // On récupère le cookie 'ps-csrf-token' depuis les headers (pour Node.js fetch)
        const rawCookies = response.headers.get('set-cookie');

        console.log("✅ Token récupéré :", token);
        console.log("✅ Cookie de session reçu :", rawCookies ? "OUI (HMAC Signature)" : "NON (ERREUR !)");

        if (!token) {
            console.error("❌ Le serveur n'a pas renvoyé de jeton CSRF.");
            return;
        }

        console.log("\n🔍 Étape 2 : Tentative d'accès à une route protégée sans le header...");
        const failedResponse = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': rawCookies }
        });

        const failedData = await response.ok ? await failedResponse.json() : { status: failedResponse.status };
        console.log("🛑 Résultat attendu (403 Forbidden) :", failedResponse.status === 403 ? "RÉUSSI (Accès refusé sans token)" : `ÉCHEC (${failedResponse.status})`);

        console.log("\n🔍 Étape 3 : Tentative d'accès avec le header 'x-csrf-token' correct...");
        const successResponse = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': token,
                'Cookie': rawCookies // On renvoie le cookie pour valider la signature
            }
        });

        // Comme on n'est pas loggé, on s'attend soit à un 401 (Unauthorized) 
        // soit à un 200 si le middleware CSRF a passé la main et que le controller a répondu.
        // L'essentiel est de ne PAS avoir de 403 (Invalid CSRF).

        if (successResponse.status === 403) {
            console.error("❌ ÉCHEC : Le serveur a rejeté le jeton valide (403).");
        } else {
            console.log("✅ SUCCÈS : Le middleware CSRF a validé la requête ! (Status:", successResponse.status, ")");
            console.log("   (Note: un 401 est normal ici si vous n'êtes pas connecté, l'important c'est d'avoir passé le mur CSRF)");
        }

    } catch (err) {
        console.error("❌ Erreur lors du test :", err.message);
        console.log("   Assurez-vous que le serveur tourne sur http://localhost:8080 (npm run dev)");
    }
}

runTest();
