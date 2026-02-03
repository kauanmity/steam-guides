// ==UserScript==
// @name         Steam Comments Nuker 2026
// @namespace    steam.comments.nuker
// @version      2.0.0
// @description  REAL delete all comments (Steam 2026)
// @match        https://steamcommunity.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const DELAY = 400;

    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    async function loadAllComments() {
        let more;
        do {
            more = document.querySelector('.commentthread_showmore');
            if (more) {
                more.click();
                await sleep(800);
            }
        } while (more);
    }

    async function deleteAll() {
        if (!window.CCommentThread || !window.g_sessionID) {
            alert('Steam API não carregada.');
            return;
        }

        await loadAllComments();

        const comments = document.querySelectorAll('.commentthread_comment');
        console.log(`Encontrados ${comments.length} comentários`);

        for (const c of comments) {
            const id = c.dataset.commentid;
            if (!id) continue;

            try {
                CCommentThread.DeleteComment(
                    c.closest('.commentthread')?.dataset.threadid,
                    id,
                    g_sessionID
                );
                await sleep(DELAY);
            } catch (e) {
                console.warn('Erro ao apagar comentário', id);
            }
        }

        alert('Comentários apagados.');
    }

    function addButton() {
        if (document.getElementById('nuke-comments')) return;

        const btn = document.createElement('button');
        btn.id = 'nuke-comments';
        btn.textContent = '🔥 APAGAR TODOS OS COMENTÁRIOS';
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            padding: 12px 18px;
            background: #c0392b;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
        `;

        btn.onclick = () => {
            if (confirm('Isso vai APAGAR TODOS os seus comentários. Continuar?')) {
                deleteAll();
            }
        };

        document.body.appendChild(btn);
    }

    const obs = new MutationObserver(addButton);
    obs.observe(document.body, { childList: true, subtree: true });

    addButton();
})();
