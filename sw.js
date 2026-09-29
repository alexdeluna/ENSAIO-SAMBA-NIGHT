const CACHE_VERSION = "samba-nigth-v1.0.0";

const CACHE_NAME = CACHE_VERSION;

const ARQUIVOS_CACHE = [
    "./",
    "./index.html",
    "./visual.css",
    "./app.js",
    "./auth.js",
    "./firebase-config.js",
    "./manifest.json",
    "./assets/samba-nigth.png"
];


// ============================================================
// INSTALAÇÃO
// ============================================================

self.addEventListener("install", evento => {

    evento.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    ARQUIVOS_CACHE
                );

            })

    );

    // Permite que a nova versão seja ativada
    // sem ficar esperando a versão anterior.
    self.skipWaiting();
});


// ============================================================
// ATIVAÇÃO
// ============================================================

self.addEventListener("activate", evento => {

    evento.waitUntil(

        caches.keys()
            .then(nomesCaches => {

                return Promise.all(

                    nomesCaches
                        .filter(nome =>
                            nome !== CACHE_NAME
                        )
                        .map(nome =>
                            caches.delete(nome)
                        )

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});


// ============================================================
// REQUISIÇÕES
// ============================================================

self.addEventListener("fetch", evento => {

    const requisicao =
        evento.request;

    // Não interfere em requisições que não sejam GET.
    if (requisicao.method !== "GET") {
        return;
    }


    const url =
        new URL(requisicao.url);


    // Firebase e outros domínios externos
    // não entram no nosso cache.
    if (url.origin !== self.location.origin) {
        return;
    }


    // ========================================================
    // HTML
    // ========================================================
    //
    // Para HTML, tenta primeiro a rede.
    // Isso ajuda a detectar novas versões.
    //

    if (
        requisicao.mode === "navigate" ||
        url.pathname.endsWith(".html")
    ) {

        evento.respondWith(

            fetch(requisicao)
                .then(resposta => {

                    const copia =
                        resposta.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                requisicao,
                                copia
                            );

                        });

                    return resposta;

                })

                .catch(() => {

                    return caches.match(
                        requisicao
                    );

                })

        );

        return;
    }


    // ========================================================
    // ARQUIVOS DO PWA
    // ========================================================
    //
    // JS, CSS, imagens etc.
    //

    evento.respondWith(

        caches.match(requisicao)
            .then(respostaCache => {

                if (respostaCache) {
                    return respostaCache;
                }

                return fetch(requisicao);

            })

    );

});
