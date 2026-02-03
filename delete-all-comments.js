// ==UserScript==
// @name         Steam Comment Nuker (2025)
// @namespace    steam.comment.nuker
// @version      3.1.0
// @description  Automatically delete all Steam comments you can remove (2025 compatible)
// @author       kauanmity
// @match        https://steamcommunity.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const DELETE_DELAY = 350;

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    async function loadAllComments() {
        let button;
        do {
            button = document.querySelector('.commentthread_showmore');
            if (button) {
                button.click();
                await sleep(800);
            }
        } while (button);
    }

    function executeDelete(anchor) {
        const jsCode = anchor.getAttribute('href');
        if (!jsCode || !jsCode.startsWith('javascript:')) return;

        try {
            new Function(jsCode.replace('javascript:', ''))();
        } catch (error) {
            console.warn('Failed to delete comment:', error);
        }
    }

    async function deleteAllComments() {
        await loadAllComments();

        let deletedCount = 0;

        while (true) {
            const deleteButtons = document.querySelectorAll(
                'a.actionlink[href^="javascript:CCommentThread.DeleteComment"]'
            );

            if (deleteButtons.length === 0) break;

            for (const button of deleteButtons) {
                executeDelete(button);
                deletedCount++;
                await sleep(DELETE_DELAY);
            }

            await sleep(800);
        }

        alert(`🔥 ${deletedCount} comments deleted successfully`);
    }

    function addControlButton() {
        if (document.getElementById('steam-comment-nuker')) return;

        const button = document.createElement('button');
        button.id = 'steam-comment-nuker';
        button.textContent = '🔥 DELETE ALL COMMENTS';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 99999;
            padding: 12px 18px;
            background: #c0392b;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
        `;

        button.onclick = () => {
            if (confirm('This will delete all comments you are allowed to remove. Continue?')) {
                deleteAllComments();
            }
        };

        document.body.appendChild(button);
    }

    const observer = new MutationObserver(addControlButton);
    observer.observe(document.body, { childList: true, subtree: true });

    addControlButton();
})();
