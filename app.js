import { auth, db } from "./firebase-config.js";

import {
    collection,
    serverTimestamp,
    getDocs,
    doc,
    getDoc,
    onSnapshot,
    setDoc,
    updateDoc,
    writeBatch,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

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

const btnAbaConferencia = document.getElementById("btnAbaConferencia");
const btnAbaConfiguracoes = document.getElementById("btnAbaConfiguracoes");
const adminTelaConferencia = document.getElementById("adminTelaConferencia");
const adminTelaConfiguracoes = document.getElementById("adminTelaConfiguracoes");
const btnAbaEventos = document.getElementById("btnAbaEventos");
const adminTelaEventos = document.getElementById("adminTelaEventos");
const seletorEventoAdmin = document.getElementById("seletorEventoAdmin");
const formNovoEvento = document.getElementById("formNovoEvento");
const novoEventoNome = document.getElementById("novoEventoNome");
const novoEventoData = document.getElementById("novoEventoData");
const mensagemEventos = document.getElementById("mensagemEventos");
const listaEventosAdmin = document.getElementById("listaEventosAdmin");
const formConfiguracoesEvento = document.getElementById("formConfiguracoesEvento");
const mensagemConfiguracoes = document.getElementById("mensagemConfiguracoes");
const btnSalvarConfiguracoes = document.getElementById("btnSalvarConfiguracoes");
const camposConfiguracao = {
    nomeEvento: document.getElementById("configNomeEvento"),
    dataEvento: document.getElementById("configDataEvento"),
    textoData: document.getElementById("configTextoData"),
    horarioPortoes: document.getElementById("configHorarioPortoes"),
    rotuloPortoes: document.getElementById("configRotuloPortoes"),
    horarioAtracao: document.getElementById("configHorarioAtracao"),
    rotuloAtracao: document.getElementById("configRotuloAtracao"),
    tituloLista: document.getElementById("configTituloLista"),
    textoApresentacao: document.getElementById("configTextoApresentacao"),
    inscricoesAtivas: document.getElementById("configInscricoesAtivas")
};
const elementosPublicos = {
    data: document.getElementById("publicDataEvento"),
    textoData: document.getElementById("publicTextoData"),
    horarioPortoes: document.getElementById("publicHorarioPortoes"),
    rotuloPortoes: document.getElementById("publicRotuloPortoes"),
    horarioAtracao: document.getElementById("publicHorarioAtracao"),
    rotuloAtracao: document.getElementById("publicRotuloAtracao"),
    tituloLista: document.getElementById("publicTituloLista"),
    textoApresentacao: document.getElementById("publicTextoApresentacao")
};
const CONFIGURACAO_PADRAO_EVENTO = Object.freeze({
    nomeEvento: "Ensaio do Samba Nigth", dataEvento: "2026-11-07", textoData: "Véspera de feriado",
    horarioPortoes: "14:00", rotuloPortoes: "Portões abertos", horarioAtracao: "15:00",
    rotuloAtracao: "Grupo tocando", tituloLista: "LISTA VIP",
    textoApresentacao: "Garanta seu cadastro e venha curtir esse encontro especial com a gente!", inscricoesAtivas: true
});
let configuracaoEvento = { ...CONFIGURACAO_PADRAO_EVENTO };
// Estado independente da página pública: não sobrescreve o formulário de edição do painel.
let configuracaoPublicaEvento = { ...CONFIGURACAO_PADRAO_EVENTO };
let eventoIdFormulario = "";
let publicacaoMudouDurantePreenchimento = false;

function normalizarConfiguracaoEvento(evento = {}) {
    // Cada evento parte dos padrões, nunca da configuração do evento selecionado anteriormente.
    return { ...CONFIGURACAO_PADRAO_EVENTO, ...evento };
}



// ============================================================
// VARIÁVEIS DO PAINEL
// ============================================================

let cadastrosVip = [];

let filtroAtual = "todos";
let eventosDisponiveis = [];
let eventoSelecionadoId = "__legacy__";
let eventoPublicadoId = "";
const ID_LISTA_ANTERIOR = "__legacy__";


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
// CONFIGURAÇÃO PÚBLICA DO EVENTO
// ============================================================
function formatarDataPublica(valor) {
    if (!valor) return "";
    const partes = valor.split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : valor;
}
function formatarHorarioPublico(valor) {
    return valor ? `${valor.split(":")[0]}h${valor.split(":")[1] === "00" ? "" : valor.split(":")[1]}` : "";
}
function aplicarConfiguracaoPublica() {
    const publica = configuracaoPublicaEvento;
    elementosPublicos.data.textContent = formatarDataPublica(publica.dataEvento);
    elementosPublicos.textoData.textContent = publica.textoData || "";
    elementosPublicos.horarioPortoes.textContent = formatarHorarioPublico(publica.horarioPortoes);
    elementosPublicos.rotuloPortoes.textContent = publica.rotuloPortoes || "";
    elementosPublicos.horarioAtracao.textContent = formatarHorarioPublico(publica.horarioAtracao);
    elementosPublicos.rotuloAtracao.textContent = publica.rotuloAtracao || "";
    elementosPublicos.tituloLista.textContent = publica.tituloLista || "LISTA VIP";
    elementosPublicos.textoApresentacao.textContent = publica.textoApresentacao || "";
    document.title = `${publica.nomeEvento || "Samba Nigth"} | Lista VIP`;
    const form = document.getElementById("formCadastro");
    const aviso = document.getElementById("avisoInscricoesEncerradas");
    if (!publica.inscricoesAtivas) {
        if (form) form.classList.add("oculto");
        if (aviso) aviso.classList.remove("oculto");
    } else {
        if (form) form.classList.remove("oculto");
        if (aviso) aviso.classList.add("oculto");
    }
}
function carregarConfiguracaoEvento() {
    const ref = doc(db, "configuracoes", "eventoPublicado");
    // onSnapshot recebe a publicação inicial e cada troca feita pelo painel, sem F5.
    return onSnapshot(ref, (snap) => {
        if (!snap.exists()) {
            console.warn("Ainda não existe configuração de evento publicado.");
            return;
        }
        const dados = snap.data();
        const novoId = String(dados.eventoId || "");
        const idAnterior = eventoPublicadoId;
        const formularioEmAndamento = Boolean(
            campoNome.value.trim() || campoEmail.value.trim() || campoWhatsapp.value.trim()
        );

        configuracaoPublicaEvento = normalizarConfiguracaoEvento(dados);
        eventoPublicadoId = novoId;
        aplicarConfiguracaoPublica();

        // Se o evento mudou durante o preenchimento, não redireciona o cadastro silenciosamente.
        if (idAnterior && novoId !== idAnterior && formularioEmAndamento) {
            publicacaoMudouDurantePreenchimento = true;
            const continuar = window.confirm(
                "O evento publicado mudou enquanto você preenchia o cadastro. " +
                "Para evitar cadastrar na lista errada, os campos serão limpos. Deseja continuar com o novo evento?"
            );
            if (continuar) {
                formCadastro.reset();
                publicacaoMudouDurantePreenchimento = false;
                eventoIdFormulario = novoId;
            }
        } else if (!formularioEmAndamento) {
            eventoIdFormulario = novoId;
            publicacaoMudouDurantePreenchimento = false;
        }
    }, (erro) => {
        console.error("Não foi possível acompanhar a publicação em tempo real:", erro);
    });
}
function preencherFormularioConfiguracoes() {
    Object.entries(camposConfiguracao).forEach(([chave, campo]) => {
        if (chave === "inscricoesAtivas") campo.checked = configuracaoEvento[chave] !== false;
        else campo.value = configuracaoEvento[chave] || "";
    });
}
function abrirAbaAdmin(aba) {
    const configuracoes = aba === "configuracoes";
    const eventos = aba === "eventos";
    adminTelaConferencia.classList.toggle("oculto", configuracoes || eventos);
    adminTelaConfiguracoes.classList.toggle("oculto", !configuracoes);
    adminTelaEventos.classList.toggle("oculto", !eventos);
    btnAbaConferencia.classList.toggle("ativo", !configuracoes && !eventos);
    btnAbaConfiguracoes.classList.toggle("ativo", configuracoes);
    btnAbaEventos.classList.toggle("ativo", eventos);
    if (configuracoes) preencherFormularioConfiguracoes();
    if (eventos) renderizarEventosAdmin();
}
btnAbaConferencia.addEventListener("click", () => abrirAbaAdmin("conferencia"));
btnAbaConfiguracoes.addEventListener("click", () => abrirAbaAdmin("configuracoes"));
btnAbaEventos.addEventListener("click", () => abrirAbaAdmin("eventos"));
formConfiguracoesEvento.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensagemConfiguracoes.textContent = "Salvando...";
    btnSalvarConfiguracoes.disabled = true;
    const dados = {};
    Object.entries(camposConfiguracao).forEach(([chave, campo]) => {
        dados[chave] = chave === "inscricoesAtivas" ? campo.checked : campo.value.trim();
    });
    dados.atualizadoEm = serverTimestamp();
    try {
        if (eventoSelecionadoId === ID_LISTA_ANTERIOR) {
            mensagemConfiguracoes.textContent = "Selecione um evento cadastrado para alterar suas configurações.";
            return;
        }
        dados.atualizadoEm = serverTimestamp();
        const idEventoSalvo = eventoSelecionadoId;
        dados.eventoId = idEventoSalvo;
        await setDoc(doc(db, "eventos", idEventoSalvo), dados, { merge: true });
        // Atualiza a cópia local do evento específico; os demais eventos permanecem intactos.
        const indiceEvento = eventosDisponiveis.findIndex(e => e.id === idEventoSalvo);
        const dadosLocais = { ...normalizarConfiguracaoEvento(dados), id: idEventoSalvo };
        if (indiceEvento >= 0) eventosDisponiveis[indiceEvento] = dadosLocais;
        else eventosDisponiveis.push(dadosLocais);
        // O documento compartilhado é apenas o snapshot da página pública.
        await setDoc(doc(db, "configuracoes", "eventoPublicado"), dados, { merge: false });
        configuracaoEvento = normalizarConfiguracaoEvento(dados);
        configuracaoPublicaEvento = normalizarConfiguracaoEvento(dados);
        eventoPublicadoId = idEventoSalvo;
        atualizarSeletorEventos();
        renderizarEventosAdmin();
        aplicarConfiguracaoPublica();
        mensagemConfiguracoes.textContent = "Evento atualizado e publicado na página pública.";
    } catch (erro) {
        console.error("Erro ao salvar configurações:", erro);
        mensagemConfiguracoes.textContent = "Não foi possível salvar. Confira as regras do Firestore.";
    } finally { btnSalvarConfiguracoes.disabled = false; }
});
carregarConfiguracaoEvento();

// ============================================================
// GERENCIAMENTO DE EVENTOS
// ============================================================
async function carregarEventos() {
    const snap = await getDocs(collection(db, "eventos"));
    eventosDisponiveis = snap.docs.map(item => ({ id: item.id, ...item.data() }));
    if (!eventosDisponiveis.length) {
        // Primeiro acesso: cria um registro de evento a partir da configuração atual,
        // sem mover nem excluir a lista legada existente.
        const novoRef = doc(collection(db, "eventos"));
        const dadosIniciais = { ...normalizarConfiguracaoEvento(configuracaoEvento), criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp() };
        await setDoc(novoRef, dadosIniciais);
        eventoPublicadoId = novoRef.id;
        configuracaoEvento = { ...configuracaoEvento, eventoId: novoRef.id };
        await setDoc(doc(db, "configuracoes", "eventoPublicado"), { ...dadosIniciais, eventoId: novoRef.id }, { merge: false });
        eventosDisponiveis = [{ id: novoRef.id, ...dadosIniciais }];
    } else if (!eventoPublicadoId || !eventosDisponiveis.some(e => e.id === eventoPublicadoId)) {
        // Se o evento publicado foi excluído ou a configuração ficou inconsistente,
        // publica explicitamente um único evento existente para manter o cadastro público funcional.
        const primeiroEvento = eventosDisponiveis[0];
        eventoPublicadoId = primeiroEvento.id;
        configuracaoEvento = normalizarConfiguracaoEvento({ ...primeiroEvento, eventoId: primeiroEvento.id });
        await setDoc(doc(db, "configuracoes", "eventoPublicado"), configuracaoEvento, { merge: false });
    }
    if (eventoSelecionadoId === ID_LISTA_ANTERIOR && eventoPublicadoId) eventoSelecionadoId = eventoPublicadoId;
    atualizarSeletorEventos();
    renderizarEventosAdmin();
}
function atualizarSeletorEventos() {
    const atual = eventoSelecionadoId;
    seletorEventoAdmin.innerHTML = '<option value="__legacy__">Lista anterior (cadastros existentes)</option>';
    eventosDisponiveis.forEach(evento => {
        const option = document.createElement("option");
        option.value = evento.id;
        option.textContent = `${evento.nomeEvento || "Evento sem nome"}${evento.inscricoesAtivas === false ? " — inscrições encerradas" : ""}`;
        seletorEventoAdmin.appendChild(option);
    });
    if (atual !== ID_LISTA_ANTERIOR && eventosDisponiveis.some(e => e.id === atual)) seletorEventoAdmin.value = atual;
    else if (eventoPublicadoId) seletorEventoAdmin.value = eventoPublicadoId;
    eventoSelecionadoId = seletorEventoAdmin.value;
}
seletorEventoAdmin.addEventListener("change", async () => {
    eventoSelecionadoId = seletorEventoAdmin.value;
    if (eventoSelecionadoId !== ID_LISTA_ANTERIOR) {
        const evento = eventosDisponiveis.find(e => e.id === eventoSelecionadoId);
        if (evento) {
            configuracaoEvento = normalizarConfiguracaoEvento({ ...evento, eventoId: evento.id });
            preencherFormularioConfiguracoes();
        }
    }
    await carregarCadastrosVip();
});
formNovoEvento.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensagemEventos.textContent = "Criando evento...";
    const nome = novoEventoNome.value.trim();
    const data = novoEventoData.value;
    if (!nome || !data) return;
    try {
        const ref = doc(collection(db, "eventos"));
        const dados = { ...CONFIGURACAO_PADRAO_EVENTO, nomeEvento: nome, dataEvento: data, inscricoesAtivas: true, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp() };
        await setDoc(ref, dados);
        eventosDisponiveis.push({ id: ref.id, ...dados });
        eventoSelecionadoId = ref.id;
        atualizarSeletorEventos();
        seletorEventoAdmin.value = ref.id;
        eventoSelecionadoId = ref.id;
        novoEventoNome.value = "";
        novoEventoData.value = "";
        mensagemEventos.textContent = "Evento criado. Revise as configurações antes de publicar.";
        configuracaoEvento = normalizarConfiguracaoEvento({ ...dados, eventoId: ref.id });
        preencherFormularioConfiguracoes();
        renderizarEventosAdmin();
        await carregarCadastrosVip();
        abrirAbaAdmin("configuracoes");
    } catch (erro) {
        console.error("Erro ao criar evento", erro);
        mensagemEventos.textContent = "Não foi possível criar o evento. Verifique as regras do Firestore.";
    }
});
function renderizarEventosAdmin() {
    if (!listaEventosAdmin) return;
    listaEventosAdmin.innerHTML = "";
    if (!eventosDisponiveis.length) {
        listaEventosAdmin.textContent = "Nenhum evento cadastrado.";
        return;
    }
    eventosDisponiveis.forEach(evento => {
        const card = document.createElement("div");
        card.className = "admin-item";
        const publicado = evento.id === eventoPublicadoId;
        card.innerHTML = `<div class="admin-item-nome">${escaparHtml(evento.nomeEvento || "Evento sem nome")}</div><div class="admin-item-info">Data: ${escaparHtml(formatarDataPublica(evento.dataEvento || ""))}<br>Status das inscrições: ${evento.inscricoesAtivas === false ? "ENCERRADAS" : "ATIVAS"}<br>${publicado ? "Publicado na página pública" : "Não publicado"}</div><div class="admin-item-acoes"><button type="button" class="btn-conferencia" data-editar-evento="${escaparHtml(evento.id)}">EDITAR / PUBLICAR</button><button type="button" class="btn-conferencia" data-toggle-evento="${escaparHtml(evento.id)}">${evento.inscricoesAtivas === false ? "ATIVAR INSCRIÇÕES" : "ENCERRAR INSCRIÇÕES"}</button><button type="button" class="btn-excluir-cadastro" data-excluir-evento="${escaparHtml(evento.id)}">EXCLUIR EVENTO</button></div>`;
        listaEventosAdmin.appendChild(card);
    });
}
listaEventosAdmin.addEventListener("click", async (evento) => {
    const editar = evento.target.closest("[data-editar-evento]");
    const toggle = evento.target.closest("[data-toggle-evento]");
    const excluir = evento.target.closest("[data-excluir-evento]");
    if (editar) {
        eventoSelecionadoId = editar.dataset.editarEvento;
        seletorEventoAdmin.value = eventoSelecionadoId;
        const item = eventosDisponiveis.find(e => e.id === eventoSelecionadoId);
        if (item) { configuracaoEvento = normalizarConfiguracaoEvento({ ...item, eventoId: item.id }); preencherFormularioConfiguracoes(); }
        abrirAbaAdmin("configuracoes");
        return;
    }
    if (toggle) {
        const item = eventosDisponiveis.find(e => e.id === toggle.dataset.toggleEvento);
        if (!item) return;
        try {
            const atualizado = { ...item, inscricoesAtivas: item.inscricoesAtivas === false, atualizadoEm: serverTimestamp() };
            await setDoc(doc(db, "eventos", item.id), atualizado, { merge: true });
            item.inscricoesAtivas = atualizado.inscricoesAtivas;
            if (item.id === eventoPublicadoId) {
                configuracaoEvento.inscricoesAtivas = atualizado.inscricoesAtivas;
                await setDoc(doc(db, "configuracoes", "eventoPublicado"), { inscricoesAtivas: atualizado.inscricoesAtivas, eventoId: item.id }, { merge: true });
                aplicarConfiguracaoPublica();
            }
            atualizarSeletorEventos(); renderizarEventosAdmin();
        } catch (erro) { console.error(erro); alert("Não foi possível alterar o status das inscrições. Verifique as regras do Firestore."); }
        return;
    }
    if (excluir) {
        const id = excluir.dataset.excluirEvento;
        const item = eventosDisponiveis.find(e => e.id === id);
        if (!item) return;
        if (!confirm(`Excluir o evento “${item.nomeEvento}”? Os participantes associados também serão excluídos. A Lista anterior não será alterada.`)) return;
        const senha = prompt("Confirme sua senha administrativa para excluir este evento:");
        if (senha === null || !auth.currentUser?.email) return;
        try {
            await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(auth.currentUser.email, senha));
            // Proteção adicional: a exclusão só pode atingir o ID confirmado no diálogo.
            if (!id || !eventosDisponiveis.some(e => e.id === id)) {
                throw new Error("ID do evento inválido para exclusão.");
            }
            const todos = await getDocs(collection(db, "listaVip"));
            const associados = todos.docs.filter(d => d.data().eventoId === id);
            // Exclui apenas participantes cujo eventoId corresponde exatamente ao evento confirmado.
            for (let i = 0; i < associados.length; i += 200) {
                const lote = writeBatch(db);
                associados.slice(i, i + 200).forEach(d => {
                    const cadastro = d.data();
                    lote.delete(doc(db, "listaVip", d.id));
                    if (cadastro.email) lote.delete(doc(db, "unicidadeEmail", `${id}__${String(cadastro.email).trim().toLowerCase()}`));
                    if (cadastro.whatsapp) lote.delete(doc(db, "unicidadeWhatsapp", `${id}__${String(cadastro.whatsapp).replace(/\D/g, "")}`));
                });
                await lote.commit();
            }
            // Exclui somente o documento com o ID escolhido, nunca a coleção inteira.
            await deleteDoc(doc(db, "eventos", id));
            // Confirma no banco e recarrega os demais eventos; não faz exclusão em lote na coleção eventos.
            const eventosRestantesSnapshot = await getDocs(collection(db, "eventos"));
            eventosDisponiveis = eventosRestantesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            if (id === eventoPublicadoId) {
                const proximoPublicado = eventosDisponiveis[0] || null;
                eventoPublicadoId = proximoPublicado?.id || "";
                if (proximoPublicado) {
                    const snapshotPublico = { ...normalizarConfiguracaoEvento(proximoPublicado), eventoId: proximoPublicado.id };
                    configuracaoEvento = snapshotPublico;
                    await setDoc(doc(db, "configuracoes", "eventoPublicado"), snapshotPublico, { merge: false });
                } else {
                    await setDoc(doc(db, "configuracoes", "eventoPublicado"), { eventoId: "", inscricoesAtivas: false }, { merge: false });
                }
            }
            eventoSelecionadoId = eventosDisponiveis.some(e => e.id === eventoSelecionadoId)
                ? eventoSelecionadoId
                : (eventoPublicadoId || ID_LISTA_ANTERIOR);
            atualizarSeletorEventos();
            renderizarEventosAdmin();
            await carregarCadastrosVip();
            if (eventoSelecionadoId !== ID_LISTA_ANTERIOR) {
                const selecionado = eventosDisponiveis.find(e => e.id === eventoSelecionadoId);
                if (selecionado) configuracaoEvento = normalizarConfiguracaoEvento(selecionado);
            }
            alert(`Evento “${item.nomeEvento || id}” excluído. Os demais eventos foram preservados.`);
        } catch (erro) {
            console.error("Erro ao excluir evento", erro);
            alert(erro.code === "auth/invalid-credential" ? "Senha incorreta. O evento não foi excluído." : "Não foi possível excluir o evento. Verifique a autenticação e as regras do Firestore.");
        }
    }
});

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


// Se o participante limpar os campos após uma mudança de publicação, permite iniciar
// um novo cadastro já vinculado ao evento que está visível na página.
function sincronizarFormularioVazio() {
    const vazio = !campoNome.value.trim() && !campoEmail.value.trim() && !campoWhatsapp.value.trim();
    if (vazio) {
        eventoIdFormulario = eventoPublicadoId;
        publicacaoMudouDurantePreenchimento = false;
    }
}
[campoNome, campoEmail, campoWhatsapp].forEach(campo => campo.addEventListener("input", sincronizarFormularioVazio));

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
        if (publicacaoMudouDurantePreenchimento) {
            alert("O evento publicado mudou. Limpe e preencha novamente os dados para evitar uma inscrição na lista errada.");
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

// Leia o evento publicado diretamente do Firestore no momento do cadastro.
// Isso evita usar um ID antigo se a página pública ficou aberta enquanto o admin publicou outro evento.
const snapshotPublicacao = await getDoc(doc(db, "configuracoes", "eventoPublicado"));
if (!snapshotPublicacao.exists()) {
    throw new Error("Nenhum evento está publicado para inscrições.");
}
const dadosPublicacao = snapshotPublicacao.data();
const eventoIdCadastro = String(dadosPublicacao.eventoId || "");
if (eventoIdFormulario && eventoIdCadastro !== eventoIdFormulario) {
    publicacaoMudouDurantePreenchimento = true;
    throw new Error("O evento publicado mudou durante o preenchimento. Atualize os dados do formulário antes de continuar.");
}
if (!eventoIdCadastro || dadosPublicacao.inscricoesAtivas !== true) {
    throw new Error("As inscrições estão encerradas ou não há evento publicado.");
}
const eventoPublicadoRef = await getDoc(doc(db, "eventos", eventoIdCadastro));
if (!eventoPublicadoRef.exists() || eventoPublicadoRef.data().inscricoesAtivas === false) {
    throw new Error("O evento publicado não está disponível para inscrições.");
}
eventoPublicadoId = eventoIdCadastro;
const chaveEmail = `${eventoIdCadastro}__${email}`;
const chaveWhatsapp = `${eventoIdCadastro}__${whatsapp}`;
const emailRef = doc(db, "unicidadeEmail", chaveEmail);
const whatsappRef = doc(db, "unicidadeWhatsapp", chaveWhatsapp);


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
        eventoId: eventoIdCadastro,
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

        } finally {
            // Sempre libera o botão, tanto após sucesso quanto após erro.
            // O formulário continua disponível quando o usuário escolhe "Novo cadastro".
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
        alterarEstadoBotao("normal");

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
            abrirAbaAdmin("conferencia");


            // Carrega os cadastros
            // imediatamente após o login.
            await carregarEventos();
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
                        dados.status || "",
                    eventoId: dados.eventoId || ID_LISTA_ANTERIOR

                });

            }
        );


        cadastrosVip = cadastrosVip.filter(cadastro => cadastro.eventoId === eventoSelecionadoId);

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


            <div class="admin-item-acoes">
                <button
                    type="button"
                    class="btn-conferencia ${conferido ? "conferido" : ""}"
                    data-id="${escaparHtml(cadastro.id)}"
                >
                    ${conferido ? "DESFAZER CONFERÊNCIA" : "CONFERIR ENTRADA"}
                </button>
                <button
                    type="button"
                    class="btn-excluir-cadastro"
                    data-excluir-id="${escaparHtml(cadastro.id)}"
                    aria-label="Excluir cadastro de ${escaparHtml(cadastro.nome)}"
                >EXCLUIR CADASTRO</button>
            </div>

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

        const botaoExcluir = evento.target.closest(".btn-excluir-cadastro");
        if (botaoExcluir) {
            const idExcluir = botaoExcluir.dataset.excluirId;
            const cadastroExcluir = cadastrosVip.find(item => item.id === idExcluir);
            if (!cadastroExcluir) {
                alert("Cadastro não encontrado.");
                return;
            }
            const confirmado = confirm(`Deseja realmente excluir o cadastro de ${cadastroExcluir.nome}?\n\nEsta ação não pode ser desfeita.`);
            if (!confirmado) return;

            botaoExcluir.disabled = true;
            botaoExcluir.textContent = "EXCLUINDO...";
            try {
                const loteExclusao = writeBatch(db);
                loteExclusao.delete(doc(db, "listaVip", idExcluir));
                // As reservas legadas usam e-mail e WhatsApp como ID.
                // O fluxo de exclusão remove somente as reservas associadas ao cadastro selecionado.
                const eventoIdReserva = cadastroExcluir.eventoId || ID_LISTA_ANTERIOR;
                loteExclusao.delete(doc(db, "unicidadeEmail", `${eventoIdReserva}__${String(cadastroExcluir.email || "").trim().toLowerCase()}`));
                loteExclusao.delete(doc(db, "unicidadeWhatsapp", `${eventoIdReserva}__${String(cadastroExcluir.whatsapp || "").replace(/\D/g, "")}`));
                // Compatibilidade com reservas criadas pela versão anterior.
                loteExclusao.delete(doc(db, "unicidadeEmail", String(cadastroExcluir.email || "").trim().toLowerCase()));
                loteExclusao.delete(doc(db, "unicidadeWhatsapp", String(cadastroExcluir.whatsapp || "").replace(/\D/g, "")));
                await loteExclusao.commit();
                cadastrosVip = cadastrosVip.filter(item => item.id !== idExcluir);
                aplicarPesquisaAtual();
                atualizarContador();
            } catch (erro) {
                console.error("Erro ao excluir cadastro:", erro);
                alert("Não foi possível excluir o cadastro. Verifique as regras do Firestore e tente novamente.");
                botaoExcluir.disabled = false;
                botaoExcluir.textContent = "EXCLUIR CADASTRO";
            }
            return;
        }

        const botao = evento.target.closest(".btn-conferencia");
        if (!botao) return;


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
// CONTEXTO DA EXPORTAÇÃO: sempre usar o evento selecionado no painel
// ============================================================
function obterContextoExportacao() {
    const idSelecionado = seletorEventoAdmin?.value || eventoSelecionadoId;
    let evento = null;

    if (idSelecionado && idSelecionado !== ID_LISTA_ANTERIOR) {
        evento = eventosDisponiveis.find(item => item.id === idSelecionado) || null;
    }

    // A Lista anterior não representa um evento novo; identifica-se com a
    // configuração pública atual, sem modificar o estado do painel.
    if (!evento) {
        evento = idSelecionado === ID_LISTA_ANTERIOR
            ? configuracaoPublicaEvento
            : eventosDisponiveis.find(item => item.id === eventoPublicadoId) || configuracaoPublicaEvento;
    }

    const nome = String(evento?.nomeEvento || "Lista anterior").trim();
    const dataISO = String(evento?.dataEvento || "").trim();
    const dataExibicao = dataISO ? formatarDataPublica(dataISO) : "Data não informada";
    const nomeArquivo = nome
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "Lista-VIP";
    const dataArquivo = dataISO ? dataISO.split("-").reverse().join("-") : "sem-data";

    return { nome, dataISO, dataExibicao, nomeArquivo, dataArquivo };
}

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

            const contextoEvento = obterContextoExportacao();
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


            const planilha = XLSX.utils.aoa_to_sheet([
                [contextoEvento.nome],
                [`Data do evento: ${contextoEvento.dataExibicao}`],
                [`Total de cadastrados: ${cadastrosVip.length}`],
                [],
                Object.keys(dados[0] || { "Código VIP": "", "Nome": "", "WhatsApp": "", "E-mail": "", "Status": "" }),
                ...dados.map(item => Object.values(item))
            ]);


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


            XLSX.writeFile(
                livro,
                `Lista-VIP-${contextoEvento.nomeArquivo}-${contextoEvento.dataArquivo}.xlsx`
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

            const contextoEvento = obterContextoExportacao();
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

            pdf.setFontSize(16);
            pdf.text(
                pdf.splitTextToSize(contextoEvento.nome, larguraPagina - (margem * 2)),
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
                `Data do evento: ${contextoEvento.dataExibicao}`,
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

            pdf.save(
                `Lista-VIP-${contextoEvento.nomeArquivo}-${contextoEvento.dataArquivo}.pdf`
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