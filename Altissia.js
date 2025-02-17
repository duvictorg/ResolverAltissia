// ==UserScript==
// @name         ResolverLeçonAltissia
// @namespace    http://tampermonkey.net/
// @version      2025-02-13
// @description  try to take over the world!
// @author       duvictorg
// @match        https://learn.altissia.org/platform/learning-path/mission/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=altissia.org
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function CliqueBouton(button){
        if (button) {
            let { left, top, width, height } = button.getBoundingClientRect();
            let x = left + width / 2; // Centre du bouton en X
            let y = top + height / 2; // Centre du bouton en Y

            let clickEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: x,
                clientY: y
            });

            button.dispatchEvent(clickEvent); // Simule le clic
        }
    }

    async function FaireExercice(TextButton,reponses,repondre) {
        let button = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === TextButton);
        let retrybutton = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === 'Réessayer');
        let commencerbutton = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === 'Commencer');
        let playbutton = document.querySelectorAll('.plyr__control.plyr__control--overlaid');
        let subtitles = document.getElementsByClassName('c-lfgsZH c-PJLV c-lfgsZH-ecAMBT-variant-primary c-lfgsZH-kLwveE-isPill-true c-lfgsZH-AcuUA-cv');
        let reponse;
        let question;
        let blocreponse;
        let textreponse;
        let blocreponseOrdre;
        let resultat;
        let key;

        if (commencerbutton){
            await CliqueBouton(commencerbutton);
            return 0;
        }

        if (repondre){
            blocreponse = document.getElementsByClassName('c-fvyLRe');
            blocreponseOrdre = document.getElementsByClassName('c-hHNqvo');
            textreponse = document.getElementsByClassName('c-iJOJc');
            if (blocreponse.length != 0){
                question = GetQuestion();
                if (question == ''){
                    let str = document.getElementsByClassName('c-PJLV c-PJLV-fZAZlL-size-14');
                    if (str && str.length > 0){
                        str = str[0].textContent
                        str = str.split(' / ')[0];
                        let nombre_exo = parseInt(str,10);
                        nombre_exo -= 1;
                        question = String(nombre_exo);
                    }
                }
                reponse = reponses.get(question);
                for (let i = 0; i < reponse.length; i++){
                    blocreponse = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === reponse[i]);
                    await CliqueBouton(blocreponse);
                }
                await wait(100);
                await CliqueBouton([...document.querySelectorAll("button")].find(b => b.textContent.trim() === 'Valider'));
                await CliqueBouton([...document.querySelectorAll("button")].find(b => b.textContent.trim() === 'Continuer'));
            }
            else if (textreponse.length != 0){
                question = GetQuestion();
                if (question == ''){
                    let str = document.getElementsByClassName('c-PJLV c-PJLV-fZAZlL-size-14');
                    if (str && str.length > 0){
                        str = str[0].textContent
                        str = str.split(' / ')[0];
                        let nombre_exo = parseInt(str,10);
                        nombre_exo -= 1;
                        question = String(nombre_exo);
                    }
                }
                reponse = reponses.get(question);
                let input = document.querySelectorAll('input.c-iJOJc');
                if (input){
                    for (let i = 0; i < input.length; i++){
                        input[i].value=reponse[i];
                        await wait(50);
                        input[i].dispatchEvent(new Event('input', { bubbles: true }));
                        await wait(50);
                        input[i].dispatchEvent(new Event('change', { bubbles: true }));
                        await wait(50);
                    }
                    await wait(100);
                    await CliqueBouton([...document.querySelectorAll("button")].find(b => b.textContent.trim() === 'Valider'));
                    await CliqueBouton([...document.querySelectorAll("button")].find(b => b.textContent.trim() === 'Continuer'));

                }

            }
            else if (blocreponseOrdre.length != 0){
                if (reponses.size != 0){
                    await wait(100);
                    key = reponses.keys().next().value;
                    reponse = reponses.get(key)[0];
                    let buttons = document.querySelectorAll(".c-hHNqvo");
                    if (!buttons){
                        return 0;
                    }
                    let Blocs = []
                    let Blocs_Repondre = []
                    for (let i = 0; i < buttons.length; i++){
                        Blocs.push(buttons[i].textContent);
                        Blocs_Repondre.push(buttons[i]);
                    }
                    let BlocsAvecIndices = AlgoTexteOrdre(reponse,Blocs);
                    for (const indice of BlocsAvecIndices){
                        await wait(50);
                        await CliqueBouton(Blocs_Repondre[indice]);
                    }
                    reponses.delete(key);
                    await wait(100);
                    await CliqueBouton([...document.querySelectorAll("button")].find(b => b.textContent.trim() === 'Valider'));
                    await CliqueBouton([...document.querySelectorAll("button")].find(b => b.textContent.trim() === 'Continuer'));

                }
            }

        }

        else{
            // si bouton réessayer est là
            if (retrybutton) {
                // on récupère le résultat obtenu
                let str = document.getElementsByClassName('c-kfnnR');
                if (str){
                    str = str[0].textContent;
                    let match = str.match(/\d+/);
                    resultat = match ? parseInt(match[0], 10) : NaN;
                    if (resultat < 80){
                        await CliqueBouton(retrybutton);
                    }
                }

            }

            // si bouton de vidéo est là
            if (playbutton && subtitles.length != 0){
                await wait(100);
                await CliqueBouton(playbutton[0]);
                console.log(subtitles);
                await wait(100);
                let seekInput = document.querySelector('input[data-plyr="seek"]');
                if (seekInput) {
                    seekInput.value = 100;
                    let event = new Event('input', { bubbles: true });
                    seekInput.dispatchEvent(event);
                    await CliqueBouton([...document.querySelectorAll("button")].find(b => b.textContent.trim() === 'Continuer'));
                    return 0;
                }
            }


            if (TextButton == 'Valider') {
                button = document.getElementsByClassName('c-lfgsZH c-PJLV c-lfgsZH-ecAMBT-variant-primary c-lfgsZH-kLwveE-isPill-true c-jUtMbh')[0];
                await CliqueBouton(button);
                let liste_elem = ["c-clUrWd c-clUrWd-bkfbUO-isCorrect-true","c-gUxMKR c-gUxMKR-bkfbUO-isCorrect-true","c-cFbiKG c-cFbiKG-eNHmlz-isCorrect-true"];
                let elem;
                for (let indice_elem = 0; indice_elem < liste_elem.length; indice_elem++){
                    elem = document.getElementsByClassName(liste_elem[indice_elem]);
                    if (elem.length != 0){
                        question = GetQuestion();
                        if (question == ''){
                            question = String(reponses.size);
                        }

                        reponse = [];
                        for (let i = 0; i < elem.length; i++) {
                            reponse.push(elem[i].textContent);
                            reponses.set(question,reponse);
                        }
                    }
                }
            }
            else if (TextButton == 'Continuer'){
                button = document.getElementsByClassName('c-lfgsZH c-PJLV c-lfgsZH-erdtLv-variant-danger c-lfgsZH-kLwveE-isPill-true c-jUtMbh');
                if (button.length == 0){
                    button = button = document.getElementsByClassName('c-lfgsZH c-PJLV c-lfgsZH-erdtLv-variant-danger c-lfgsZH-kLwveE-isPill-true c-jUtMbh');
                    if (button.length == 0){
                        button = document.getElementsByClassName('c-lfgsZH c-PJLV c-lfgsZH-ecAMBT-variant-primary c-lfgsZH-kLwveE-isPill-true c-lfgsZH-huIgme-isWider-true')[0];
                    }
                    else{
                        button = button[0];
                    }
                }
                else{
                    button = button[0];
                }
                await CliqueBouton(button);
            }


            if (resultat){
                return resultat;
            }
            else{
                return 0;
            }
        }

    }

    function NombreExos(){
        let str = document.getElementsByClassName('c-PJLV c-PJLV-fZAZlL-size-14');
        if (str && str.length > 0){
            str = str[0].textContent
            str = str.split(' / ')[1];
            let nombre_exo = parseInt(str,10);
            return nombre_exo;
        }
        else {
            return 0;
        }
    }

    function GetQuestion(){
        let questions = document.getElementsByClassName('c-fZLwXq');
        let question = '';
        if (questions){
            for (let i = 0; i < questions.length; i++){
                question += questions[i].textContent;
            }
            return question;
        }
    }

    function AlgoTexteOrdre(Texte, Blocs) {
        let OrdreIndices = [];
        let texteRestant = Texte;

        // Trier les blocs par longueur décroissante pour vérifier les blocs les plus longs en premier
        // Nous gardons une trace des indices originaux des blocs
        let BlocsAvecIndices = Blocs.map((bloc, index) => ({ bloc, index }));
        BlocsAvecIndices.sort((a, b) => b.bloc.length - a.bloc.length);

        while (texteRestant.length > 0) {
            // Trouver le bloc qui correspond au début du texte restant (sensible à la casse)
            let blocTrouve = BlocsAvecIndices.find(({ bloc }) => texteRestant.startsWith(bloc));

            if (blocTrouve) {
                // Ajouter l'indice du bloc trouvé à l'ordre des indices
                OrdreIndices.push(blocTrouve.index);
                // Retirer le bloc trouvé du texte restant
                texteRestant = texteRestant.slice(blocTrouve.bloc.length).trim();
                // Retirer le bloc de la liste des blocs pour éviter les doublons
                BlocsAvecIndices = BlocsAvecIndices.filter(({ index }) => index !== blocTrouve.index);
            }
            else {
                break;
            }
        }
        let phraseReconstruite = OrdreIndices.map(index => Blocs[index]).join(' ');
        console.log("phrase : ", phraseReconstruite);
        return OrdreIndices;
    }

    async function BoucleExos(reponses,repondre){
        await FaireExercice('Valider',reponses,repondre);
        await wait(100);
        await FaireExercice('Continuer',reponses,repondre);
        await wait(100);
    }

    async function Exercice(){
        let nombre_exos = NombreExos() + 1;
        let resultat;
        let reponses = new Map();
        let repondre = false;
        let bouton_continuer;

        for (let exos = 0; exos < nombre_exos; exos++) {
            await BoucleExos(reponses, repondre);

            if (exos == nombre_exos - 1) {
                await wait(500);
                resultat = await FaireExercice('pass', reponses, repondre);

                if (resultat >= 80) {
                    await FaireExercice('Continuer', reponses, repondre);
                }
                else {
                    repondre = true;
                    console.log(reponses);
                    for (let i = 0; i < nombre_exos; i++) {
                        await BoucleExos(reponses, repondre);
                    }

                    resultat = await FaireExercice('pass', reponses, false);

                    if (resultat >= 80) {
                        bouton_continuer = document.querySelectorAll('.c-lfgsZH.c-cIdiJW.c-lfgsZH-ecAMBT-variant-primary.c-lfgsZH-kLwveE-isPill-true');

                        if (bouton_continuer) {
                            await CliqueBouton(bouton_continuer[0]);
                        }
                    }
                }
            }
            bouton_continuer = document.querySelectorAll('.c-lfgsZH.c-cIdiJW.c-lfgsZH-ecAMBT-variant-primary.c-lfgsZH-kLwveE-isPill-true');

            if (bouton_continuer) {
                await CliqueBouton(bouton_continuer[0]);
            }
        }
    }






    async function Lecon(){
        await wait(1000);
        console.log("lancement");
        let positions = [];
        let Exercices = document.querySelectorAll('.c-cwwqcQ.c-dYHwLo');
        if (Exercices){
            for (let i = 0; i < Exercices.length; i++){
                if (Exercices[i].querySelector('svg').getAttribute('data-icon') != "check"){
                    positions.push(document.querySelectorAll('.c-cwwqcQ.c-dYHwLo')[i]);
                }
            }
            if (positions.length > 0){
                await CliqueBouton(positions[0]);
                await wait(750);
                let StartRecap = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === 'Commencer');
                if (StartRecap){
                    await CliqueBouton(StartRecap);
                    await wait(200);
                }
                await Exercice();
                await wait(750);
                window.location.href = window.location.href;
            }
        }


    }

    await Lecon();
})();
