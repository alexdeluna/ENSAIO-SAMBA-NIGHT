import { auth, db } from "./firebase-config.js";

import {
    collection,
    serverTimestamp,
    getDocs,
    doc,
    updateDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    loginAdministrador,
    logoutAdministrador
} from "./auth.js";


// ============================================================
// ÁREA PÚBLICA
// ============================================================

const telaPublica = document.getElementById("telaPublica");
const formCadastro = document.getElementById("formCadastro");

const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoWhatsapp = document.getElementById("whatsapp");

const btnCadastrar = document.getElementById("btnCadastrar");


// ============================================================
// CONFIRMAÇÃO
// ============================================================

const confirmacao = document.getElementById("confirmacao");
const codigoVip = document.getElementById("codigoVip");
const mensagemConfirmacao =
    document.getElementById("mensagemConfirmacao");

const btnNovoCadastro =
    document.getElementById("btnNovoCadastro");


// ============================================================
// ACESSO ADMINISTRATIVO
// ============================================================

const acessoAdmin =
    document.getElementById("acessoAdmin");

const telaAdminLogin =
    document.getElementById("telaAdminLogin");

const formLogin =
    document.getElementById("formLogin");

const emailAdmin =
    document.getElementById("emailAdmin");

const senhaAdmin =
    document.getElementById("senhaAdmin");

const btnLogin =
    document.getElementById("btnLogin");

const mensagemLogin =
    document.getElementById("mensagemLogin");

const btnVoltarPublico =
    document.getElementById("btnVoltarPublico");


// ============================================================
// PAINEL ADMINISTRATIVO
// ============================================================

const telaAdmin =
    document.getElementById("telaAdmin");

const btnLogout =
    document.getElementById("btnLogout");

const totalCadastros =
    document.getElementById("totalCadastros");

const totalPendentes =
    document.getElementById("totalPendentes");

const totalConferidos =
document.getElementById("totalConferidos");

const campoBusca =
    document.getElementById("campoBusca");

const listaAdmin =
    document.getElementById("listaAdmin");

const btnExcel =
    document.getElementById("btnExcel");

const btnPdf =
    document.getElementById("btnPdf");

    const filtrosStatus =
    document.querySelectorAll(".filtro-status");



// ============================================================
// VARIÁVEIS DO PAINEL
// ============================================================

let cadastrosVip = [];

let filtroAtual = "todos";


// ============================================================
// MOSTRAR TELA
// ============================================================

function mostrarTela(tela) {

    telaPublica.classList.add("oculto");

    confirmacao.classList.add("oculto");

    telaAdminLogin.classList.add("oculto");

    telaAdmin.classList.add("oculto");

    tela.classList.remove("oculto");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ============================================================
// MÁSCARA WHATSAPP
// ============================================================

campoWhatsapp.addEventListener("input", () => {

    let valor =
        campoWhatsapp.value.replace(/\D/g, "");

    if (valor.length > 11) {
        valor = valor.substring(0, 11);
    }

    if (valor.length <= 10) {

        valor = valor.replace(
            /^(\d{2})(\d{0,4})(\d{0,4}).*/,
            "($1) $2-$3"
        );

    } else {

        valor = valor.replace(
            /^(\d{2})(\d{5})(\d{0,4}).*/,
            "($1) $2-$3"
        );
    }

    campoWhatsapp.value = valor;
});


// ============================================================
// LIMPAR WHATSAPP
// ============================================================

function limparWhatsapp(valor) {

    return valor.replace(/\D/g, "");

}


// ============================================================
// GERAR CÓDIGO VIP
// ============================================================

function gerarCodigoVip() {

    const caracteres =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let codigo = "VIP-";

    for (let i = 0; i < 6; i++) {

        const indice =
            Math.floor(
                Math.random() * caracteres.length
            );

        codigo += caracteres[indice];
    }

    return codigo;
}


// ============================================================
// FORMATAR NOME
// ============================================================

function formatarNome(nome) {

    return nome
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(palavra =>
            palavra.charAt(0).toUpperCase() +
            palavra.slice(1)
        )
        .join(" ");
}


// ============================================================
// VALIDAR FORMULÁRIO
// ============================================================

function validarFormulario() {

    const nome =
        campoNome.value.trim();

    const email =
        campoEmail.value.trim();

    const whatsapp =
        limparWhatsapp(
            campoWhatsapp.value
        );


    if (nome.length < 3) {

        alert(
            "Informe seu nome completo."
        );

        campoNome.focus();

        return false;
    }


    if (
        !email.includes("@") ||
        !email.includes(".")
    ) {

        alert(
            "Informe um e-mail válido."
        );

        campoEmail.focus();

        return false;
    }


    if (whatsapp.length !== 11) {

        alert(
            "Informe um WhatsApp válido com DDD."
        );

        campoWhatsapp.focus();

        return false;
    }


    return true;
}


// ============================================================
// ESTADO DO BOTÃO
// ============================================================

function alterarEstadoBotao(estado) {

    if (estado === "carregando") {

        btnCadastrar.disabled = true;

        btnCadastrar.innerHTML =
            "CADASTRANDO...";

        return;
    }

    btnCadastrar.disabled = false;

    btnCadastrar.innerHTML =
        'CADASTRAR NA LISTA VIP <span>→</span>';
}


// ============================================================
// CADASTRO PÚBLICO
// ============================================================

formCadastro.addEventListener(
    "submit",
    async (evento) => {

        evento.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        alterarEstadoBotao("carregando");

        try {

            const nome =
                formatarNome(
                    campoNome.value
                );

            const email =
                campoEmail.value
                    .trim()
                    .toLowerCase();

            const whatsapp =
                limparWhatsapp(
                    campoWhatsapp.value
                );

            const codigo =
                gerarCodigoVip();


            const cadastroRef =
    doc(
        collection(
            db,
            "listaVip"
        )
    );

const emailRef =
    doc(
        db,
        "unicidadeEmail",
        email
    );

const whatsappRef =
    doc(
        db,
        "unicidadeWhatsapp",
        whatsapp
    );


const lote =
    writeBatch(db);


// ========================================================
// CADASTRO PRINCIPAL
// ========================================================

lote.set(
    cadastroRef,
    {
        codigo: codigo,
        nome: nome,
        email: email,
        whatsapp: whatsapp,
        status: "ativo",
        criadoEm: serverTimestamp()
    }
);


// ========================================================
// RESERVA DO E-MAIL
// ========================================================

lote.set(
    emailRef,
    {
        cadastroId: cadastroRef.id,
        criadoEm: serverTimestamp()
    }
);


// ========================================================
// RESERVA DO WHATSAPP
// ========================================================

lote.set(
    whatsappRef,
    {
        cadastroId: cadastroRef.id,
        criadoEm: serverTimestamp()
    }
);


// ========================================================
// EXECUTA TUDO COMO UMA ÚNICA OPERAÇÃO
// ========================================================

await lote.commit();

            codigoVip.textContent =
                codigo;

            mensagemConfirmacao.textContent =
                `Cadastro realizado com sucesso, ${nome}!`;


            mostrarTela(confirmacao);


        } catch (erro) {

            console.error(
                "Erro ao cadastrar usuário:",
                erro
            );

            if (erro.code === "permission-denied") {

    alert(
        "Este e-mail ou WhatsApp já está cadastrado na Lista VIP."
    );

} else {

    alert(
        "Não foi possível realizar seu cadastro. Tente novamente."
    );

}

            alterarEstadoBotao("normal");
        }

    }
);


// ============================================================
// NOVO CADASTRO
// ============================================================

btnNovoCadastro.addEventListener(
    "click",
    () => {

        formCadastro.reset();

        mostrarTela(telaPublica);

        campoNome.focus();

    }
);


// ============================================================
// ACESSO ADMIN — 5 TOQUES
// ============================================================

let quantidadeToques = 0;
let temporizadorToques = null;

acessoAdmin.addEventListener(
    "click",
    () => {

        quantidadeToques++;

        clearTimeout(
            temporizadorToques
        );


        temporizadorToques =
            setTimeout(() => {

                quantidadeToques = 0;

            }, 2000);


        if (quantidadeToques >= 5) {

            quantidadeToques = 0;

            clearTimeout(
                temporizadorToques
            );

            abrirLoginAdministrador();
        }

    }
);


// ============================================================
// ABRIR LOGIN ADMIN
// ============================================================

function abrirLoginAdministrador() {

    formLogin.reset();

    mensagemLogin.textContent = "";

    btnLogin.disabled = false;

    btnLogin.textContent =
        "ENTRAR";

    mostrarTela(
        telaAdminLogin
    );

    setTimeout(() => {

        emailAdmin.focus();

    }, 100);
}


// ============================================================
// VOLTAR PARA ÁREA PÚBLICA
// ============================================================

btnVoltarPublico.addEventListener(
    "click",
    () => {

        mostrarTela(
            telaPublica
        );

    }
);


// ============================================================
// LOGIN ADMINISTRATIVO
// ============================================================

formLogin.addEventListener(
    "submit",
    async (evento) => {

        evento.preventDefault();


        const email =
            emailAdmin.value.trim();

        const senha =
            senhaAdmin.value;


        if (!email || !senha) {

            mensagemLogin.textContent =
                "Informe e-mail e senha.";

            return;
        }


        btnLogin.disabled = true;

        btnLogin.textContent =
            "ENTRANDO...";

        mensagemLogin.textContent =
            "";


        try {

            await loginAdministrador(
                email,
                senha
            );


            mensagemLogin.textContent =
                "";


            mostrarTela(
                telaAdmin
            );


            // Carrega os cadastros
            // imediatamente após o login.
            await carregarCadastrosVip();


        } catch (erro) {

            console.error(
                "Falha no login administrativo:",
                erro
            );


            if (
                erro.code ===
                "auth/invalid-credential"
            ) {

                mensagemLogin.textContent =
                    "E-mail ou senha inválidos.";

            } else if (
                erro.message ===
                "USUARIO_NAO_AUTORIZADO"
            ) {

                mensagemLogin.textContent =
                    "Usuário não autorizado para acesso administrativo.";

            } else {

                mensagemLogin.textContent =
                    "Não foi possível realizar o login.";

            }


            btnLogin.disabled = false;

            btnLogin.textContent =
                "ENTRAR";
        }

    }
);


// ============================================================
// CARREGAR CADASTROS DO FIRESTORE
// ============================================================

async function carregarCadastrosVip() {

    listaAdmin.innerHTML = `
        <div class="admin-item">
            <div class="admin-item-info">
                Carregando cadastros...
            </div>
        </div>
    `;


    try {

        const consulta =
            await getDocs(
                collection(
                    db,
                    "listaVip"
                )
            );


        cadastrosVip = [];


        consulta.forEach(
            (documento) => {

                const dados =
                    documento.data();

                cadastrosVip.push({

                    id: documento.id,

                    codigo:
                        dados.codigo || "",

                    nome:
                        dados.nome || "",

                    email:
                        dados.email || "",

                    whatsapp:
                        dados.whatsapp || "",

                    status:
                        dados.status || ""

                });

            }
        );


        // Ordena alfabeticamente pelo nome.
        cadastrosVip.sort(
            (a, b) =>
                a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                )
        );


        atualizarContador();

        renderizarCadastros(
            cadastrosVip
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar lista VIP:",
            erro
        );


        totalCadastros.textContent =
            "0";


        listaAdmin.innerHTML = `
            <div class="admin-item">
                <div class="admin-item-nome">
                    Não foi possível carregar a lista.
                </div>

                <div class="admin-item-info">
                    Verifique as regras do Firestore e tente novamente.
                </div>
            </div>
        `;

    }

}


// ============================================================
// ATUALIZAR CONTADOR
// ============================================================

function atualizarContador() {

    const total =
        cadastrosVip.length;

    const conferidos =
        cadastrosVip.filter(
            cadastro =>
                cadastro.status === "conferido"
        ).length;

    const pendentes =
        total - conferidos;

    totalCadastros.textContent =
        total;

    totalPendentes.textContent =
        pendentes;

    totalConferidos.textContent =
        conferidos;
}


// ============================================================
// RENDERIZAR LISTA
// ============================================================

function renderizarCadastros(lista) {

    listaAdmin.innerHTML = "";


    if (lista.length === 0) {

        listaAdmin.innerHTML = `
            <div class="admin-item">

                <div class="admin-item-nome">
                    Nenhum cadastro encontrado.
                </div>

                <div class="admin-item-info">
                    Não existem registros correspondentes à pesquisa.
                </div>

            </div>
        `;

        return;
    }


    lista.forEach((cadastro) => {

        const item =
            document.createElement("div");

        item.className = "admin-item";


        const conferido =
            cadastro.status === "conferido";


        item.innerHTML = `

            <div class="admin-item-codigo">
                ${escaparHtml(cadastro.codigo)}
            </div>

            <div class="admin-item-nome">
                ${escaparHtml(cadastro.nome)}
            </div>

            <div class="admin-item-info">

                <strong>WhatsApp:</strong>
                ${formatarWhatsapp(cadastro.whatsapp)}

                <br>

                <strong>E-mail:</strong>
                ${escaparHtml(cadastro.email)}

                <br>

                <strong>Status:</strong>
                ${conferido ? "CONFERIDO" : "ATIVO"}

            </div>


            <button
                type="button"
                class="btn-conferencia ${conferido ? "conferido" : ""}"
                data-id="${escaparHtml(cadastro.id)}"
            >
                ${
                    conferido
                        ? "DESFAZER CONFERÊNCIA"
                        : "CONFERIR ENTRADA"
                }
            </button>

        `;


        listaAdmin.appendChild(item);

    });

}

// ============================================================
// CONFERÊNCIA NA ENTRADA
// ============================================================

listaAdmin.addEventListener(
    "click",
    async (evento) => {

        const botao =
            evento.target.closest(
                ".btn-conferencia"
            );


        if (!botao) {
            return;
        }


        const id =
            botao.dataset.id;


        const cadastro =
            cadastrosVip.find(
                item => item.id === id
            );


        if (!cadastro) {

            alert(
                "Cadastro não encontrado."
            );

            return;
        }


        const novoStatus =
            cadastro.status === "conferido"
                ? "ativo"
                : "conferido";


        const textoOriginal =
            botao.textContent;


        botao.disabled = true;

        botao.textContent =
            "ATUALIZANDO...";


        try {

            await updateDoc(
                doc(
                    db,
                    "listaVip",
                    id
                ),
                {
                    status: novoStatus
                }
            );


            // Atualiza o registro local
            cadastro.status =
                novoStatus;


            atualizarContador();

            // Renderiza novamente
            // sem consultar o Firestore.
            aplicarPesquisaAtual();


        } catch (erro) {

            console.error(
                "Erro ao atualizar conferência:",
                erro
            );


            alert(
                "Não foi possível atualizar a conferência."
            );


            botao.disabled = false;

            botao.textContent =
                textoOriginal;
        }

    }
);


// ============================================================
// APLICAR PESQUISA + FILTRO
// ============================================================

function aplicarPesquisaAtual() {

    const termo =
        campoBusca.value
            .trim()
            .toLowerCase();


    let resultado =
        [...cadastrosVip];


    // ========================================================
    // FILTRO POR STATUS
    // ========================================================

    if (filtroAtual === "pendentes") {

        resultado =
            resultado.filter(
                cadastro =>
                    cadastro.status !== "conferido"
            );

    }


    if (filtroAtual === "conferidos") {

        resultado =
            resultado.filter(
                cadastro =>
                    cadastro.status === "conferido"
            );

    }


    // ========================================================
    // PESQUISA
    // ========================================================

    if (termo) {

        resultado =
            resultado.filter(
                cadastro => {

                    return (

                        cadastro.nome
                            .toLowerCase()
                            .includes(termo)

                        ||

                        cadastro.whatsapp
                            .toLowerCase()
                            .includes(termo)

                        ||

                        cadastro.codigo
                            .toLowerCase()
                            .includes(termo)

                    );

                }
            );

    }


    renderizarCadastros(
        resultado
    );

}


// ============================================================
// PESQUISA
// ============================================================

campoBusca.addEventListener(
    "input",
    () => {

        aplicarPesquisaAtual();

    }
);

// ============================================================
// FILTROS DE STATUS
// ============================================================

filtrosStatus.forEach(
    botao => {

        botao.addEventListener(
            "click",
            () => {

                filtroAtual =
                    botao.dataset.filtro;


                // Remove seleção dos outros
                filtrosStatus.forEach(
                    item => {

                        item.classList.remove(
                            "ativo"
                        );

                    }
                );


                // Ativa o botão selecionado
                botao.classList.add(
                    "ativo"
                );


                aplicarPesquisaAtual();

            }
        );

    }
);


// ============================================================
// FORMATAR WHATSAPP
// ============================================================

function formatarWhatsapp(numero) {

    const valor =
        numero.replace(/\D/g, "");


    if (valor.length === 11) {

        return `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7)}`;

    }


    return escaparHtml(numero);
}


// ============================================================
// PROTEÇÃO CONTRA HTML
// ============================================================

function escaparHtml(valor) {

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// LOGOUT
// ============================================================

btnLogout.addEventListener(
    "click",
    async () => {

        try {

            await logoutAdministrador();

            cadastrosVip = [];

            campoBusca.value = "";

            listaAdmin.innerHTML = "";

            totalCadastros.textContent =
                "0";

                totalPendentes.textContent = "0";

totalConferidos.textContent = "0";

            mostrarTela(
                telaPublica
            );

        } catch (erro) {

            console.error(
                "Erro ao sair:",
                erro
            );

            alert(
                "Não foi possível encerrar a sessão."
            );

        }

    }
);

// ============================================================
// EXPORTAÇÃO EXCEL
// ============================================================

async function carregarBibliotecaExcel() {

    if (window.XLSX) {
        return;
    }

    await new Promise((resolve, reject) => {

        const script = document.createElement("script");

        script.src =
            "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";

        script.onload = resolve;

        script.onerror = () => {
            reject(
                new Error(
                    "Não foi possível carregar a biblioteca Excel."
                )
            );
        };

        document.head.appendChild(script);
    });
}


// ============================================================
// EXPORTAR EXCEL
// ============================================================

btnExcel.addEventListener(
    "click",
    async () => {

        if (cadastrosVip.length === 0) {

            alert(
                "Não existem cadastros para exportar."
            );

            return;
        }


        const textoOriginal =
            btnExcel.textContent;

        btnExcel.disabled = true;

        btnExcel.textContent =
            "GERANDO EXCEL...";


        try {

            await carregarBibliotecaExcel();


            const dados = cadastrosVip.map(
                cadastro => ({

                    "Código VIP":
                        cadastro.codigo,

                    "Nome":
                        cadastro.nome,

                    "WhatsApp":
                        formatarWhatsapp(
                            cadastro.whatsapp
                        ),

                    "E-mail":
                        cadastro.email,

                    "Status":
                        cadastro.status.toUpperCase()

                })
            );


            const planilha =
                XLSX.utils.json_to_sheet(
                    dados
                );


            // Largura das colunas
            planilha["!cols"] = [

                { wch: 16 },
                { wch: 32 },
                { wch: 18 },
                { wch: 38 },
                { wch: 12 }

            ];


            const livro =
                XLSX.utils.book_new();


            XLSX.utils.book_append_sheet(
                livro,
                planilha,
                "Lista VIP"
            );


            const data =
                new Date();


            const dataArquivo =
                data.toLocaleDateString(
                    "pt-BR"
                )
                .replace(/\//g, "-");


            XLSX.writeFile(
                livro,
                `Lista-VIP-Samba-Nigth-${dataArquivo}.xlsx`
            );


        } catch (erro) {

            console.error(
                "Erro ao exportar Excel:",
                erro
            );

            alert(
                "Não foi possível gerar o arquivo Excel."
            );

        } finally {

            btnExcel.disabled = false;

            btnExcel.textContent =
                textoOriginal;
        }

    }
);


// ============================================================
// BIBLIOTECA PDF
// ============================================================

async function carregarBibliotecaPDF() {

    if (
        window.jspdf &&
        window.jspdf.jsPDF
    ) {

        return;
    }


    await new Promise(
        (resolve, reject) => {

            const script =
                document.createElement("script");


            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";


            script.onload =
                resolve;


            script.onerror =
                () => {

                    reject(
                        new Error(
                            "Não foi possível carregar a biblioteca PDF."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


// ============================================================
// EXPORTAR PDF
// ============================================================

btnPdf.addEventListener(
    "click",
    async () => {

        if (cadastrosVip.length === 0) {

            alert(
                "Não existem cadastros para exportar."
            );

            return;
        }


        const textoOriginal =
            btnPdf.textContent;

        btnPdf.disabled = true;

        btnPdf.textContent =
            "GERANDO PDF...";


        try {

            await carregarBibliotecaPDF();


            const {
                jsPDF
            } = window.jspdf;


            const pdf =
                new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                });


            const margem =
                15;

            const larguraPagina =
                pdf.internal.pageSize.getWidth();

            const alturaPagina =
                pdf.internal.pageSize.getHeight();


            // ==================================================
            // CABEÇALHO
            // ==================================================

            pdf.setFillColor(
                8,
                8,
                8
            );

            pdf.rect(
                0,
                0,
                larguraPagina,
                35,
                "F"
            );


            pdf.setTextColor(
                244,
                196,
                0
            );

            pdf.setFont(
                "helvetica",
                "bold"
            );

            pdf.setFontSize(
                20
            );

            pdf.text(
                "ENSAIO DO SAMBA NIGTH",
                margem,
                14
            );


            pdf.setTextColor(
                255,
                255,
                255
            );

            pdf.setFontSize(
                11
            );

            pdf.text(
                "LISTA VIP",
                margem,
                23
            );


            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(
                9
            );

            pdf.text(
                "11/10/2026 — Véspera de feriado",
                margem,
                30
            );


            // ==================================================
            // RESUMO
            // ==================================================

            let y =
                47;


            pdf.setTextColor(
                40,
                40,
                40
            );

            pdf.setFont(
                "helvetica",
                "bold"
            );

            pdf.setFontSize(
                12
            );

            pdf.text(
                `Total de cadastrados: ${cadastrosVip.length}`,
                margem,
                y
            );


            y += 9;


            pdf.setDrawColor(
                210,
                210,
                210
            );

            pdf.line(
                margem,
                y,
                larguraPagina - margem,
                y
            );


            y += 8;


            // ==================================================
            // CABEÇALHO DA TABELA
            // ==================================================

            const colunaCodigo = 15;
            const colunaNome = 48;
            const colunaWhatsapp = 105;
            const colunaEmail = 140;

            pdf.setFillColor(
                244,
                196,
                0
            );

            pdf.rect(
                margem,
                y - 5,
                larguraPagina - (margem * 2),
                9,
                "F"
            );


            pdf.setTextColor(
                0,
                0,
                0
            );

            pdf.setFont(
                "helvetica",
                "bold"
            );

            pdf.setFontSize(
                7
            );


            pdf.text(
                "CÓDIGO",
                colunaCodigo,
                y
            );

            pdf.text(
                "NOME",
                colunaNome,
                y
            );

            pdf.text(
                "WHATSAPP",
                colunaWhatsapp,
                y
            );

            pdf.text(
                "E-MAIL",
                colunaEmail,
                y
            );


            y += 10;


            // ==================================================
            // REGISTROS
            // ==================================================

            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(
                7
            );


            cadastrosVip.forEach(
                (cadastro, indice) => {

                    // Nova página
                    if (
                        y > alturaPagina - 22
                    ) {

                        pdf.addPage();

                        y = 20;


                        pdf.setFillColor(
                            244,
                            196,
                            0
                        );

                        pdf.rect(
                            margem,
                            y - 5,
                            larguraPagina - (margem * 2),
                            9,
                            "F"
                        );


                        pdf.setTextColor(
                            0,
                            0,
                            0
                        );

                        pdf.setFont(
                            "helvetica",
                            "bold"
                        );

                        pdf.text(
                            "CÓDIGO",
                            colunaCodigo,
                            y
                        );

                        pdf.text(
                            "NOME",
                            colunaNome,
                            y
                        );

                        pdf.text(
                            "WHATSAPP",
                            colunaWhatsapp,
                            y
                        );

                        pdf.text(
                            "E-MAIL",
                            colunaEmail,
                            y
                        );


                        y += 10;

                        pdf.setFont(
                            "helvetica",
                            "normal"
                        );
                    }


                    // Linhas alternadas
                    if (indice % 2 === 0) {

                        pdf.setFillColor(
                            248,
                            248,
                            248
                        );

                        pdf.rect(
                            margem,
                            y - 4,
                            larguraPagina - (margem * 2),
                            8,
                            "F"
                        );
                    }


                    pdf.setTextColor(
                        40,
                        40,
                        40
                    );


                    pdf.text(
                        limitarTexto(
                            cadastro.codigo,
                            14
                        ),
                        colunaCodigo,
                        y
                    );


                    pdf.text(
                        limitarTexto(
                            cadastro.nome,
                            30
                        ),
                        colunaNome,
                        y
                    );


                    pdf.text(
                        limitarTexto(
                            formatarWhatsapp(
                                cadastro.whatsapp
                            ),
                            17
                        ),
                        colunaWhatsapp,
                        y
                    );


                    pdf.text(
                        limitarTexto(
                            cadastro.email,
                            35
                        ),
                        colunaEmail,
                        y
                    );


                    y += 8;

                }
            );


            // ==================================================
            // RODAPÉ
            // ==================================================

            const paginas =
                pdf.internal.getNumberOfPages();


            for (
                let pagina = 1;
                pagina <= paginas;
                pagina++
            ) {

                pdf.setPage(
                    pagina
                );


                pdf.setFontSize(
                    7
                );

                pdf.setTextColor(
                    120,
                    120,
                    120
                );


                pdf.text(
                    `Lista VIP — Ensaio do Samba Nigth`,
                    margem,
                    alturaPagina - 8
                );


                pdf.text(
                    `Página ${pagina} de ${paginas}`,
                    larguraPagina - margem,
                    alturaPagina - 8,
                    {
                        align: "right"
                    }
                );

            }


            // ==================================================
            // SALVAR
            // ==================================================

            const data =
                new Date();


            const dataArquivo =
                data.toLocaleDateString(
                    "pt-BR"
                )
                .replace(/\//g, "-");


            pdf.save(
                `Lista-VIP-Samba-Nigth-${dataArquivo}.pdf`
            );


        } catch (erro) {

            console.error(
                "Erro ao exportar PDF:",
                erro
            );

            alert(
                "Não foi possível gerar o arquivo PDF."
            );

        } finally {

            btnPdf.disabled = false;

            btnPdf.textContent =
                textoOriginal;

        }

    }
);


// ============================================================
// LIMITAR TEXTO NO PDF
// ============================================================

function limitarTexto(
    texto,
    limite
) {

    texto =
        String(texto || "");


    if (
        texto.length <= limite
    ) {

        return texto;
    }


    return (
        texto.substring(
            0,
            limite - 3
        ) + "..."
    );

}
