import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// =====================================================
// VERIFICAR SE USUÁRIO É ADMINISTRADOR
// =====================================================

export async function verificarAdministrador() {

    const usuario = auth.currentUser;

    if (!usuario) {
        return false;
    }

    try {

        const referencia = doc(
            db,
            "administradores",
            usuario.uid
        );

        const documento = await getDoc(referencia);

        if (!documento.exists()) {
            return false;
        }

        const dados = documento.data();

        return dados.ativo === true;

    } catch (erro) {

        console.error(
            "Erro ao verificar administrador:",
            erro
        );

        return false;
    }
}


// =====================================================
// LOGIN DO ADMINISTRADOR
// =====================================================

export async function loginAdministrador(email, senha) {

    try {

        const resultado =
            await signInWithEmailAndPassword(
                auth,
                email,
                senha
            );

        const usuario = resultado.user;

        const administrador =
            await verificarAdministrador();

        if (!administrador) {

            await signOut(auth);

            throw new Error(
                "USUARIO_NAO_AUTORIZADO"
            );
        }

        return usuario;

    } catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );

        throw erro;
    }
}


// =====================================================
// LOGOUT
// =====================================================

export async function logoutAdministrador() {

    await signOut(auth);

}