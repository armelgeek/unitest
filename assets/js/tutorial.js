// Tutorial (Didacticiel) for Counting Machine
// Uses browser's TTS (Text-to-Speech) SpeechSynthesis API

const Tutorial = (function() {
    // Tutorial state
    let state = {
        active: false,
        stage: 0,         // 0=inactive, 1=découverte des boutons, 2=compréhension des colonnes, 3=exercices libres
        step: 0,          // sub-step within a stage
        upClicks: 0,
        downClicks: 0,
        currentGoal: null,
        goalsCompleted: 0
    };

    // Tutorial numbers for stage 2
    const stage2Numbers = [1234, 5678, 9012];
    
    // Random numbers for stage 3
    function generateRandomNumber() {
        return Math.floor(Math.random() * 9999) + 1;
    }

    // TTS function using browser's SpeechSynthesis
    function speak(text, callback) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            if (callback) {
                utterance.onend = callback;
            }
            
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Text-to-Speech not supported in this browser');
            if (callback) {
                setTimeout(callback, 1000);
            }
        }
    }

    // Show dialog with text
    function showDialog(text) {
        const dialog = document.getElementById('tutorial-dialog');
        const dialogText = document.getElementById('tutorial-dialog-text');
        
        if (dialog && dialogText) {
            dialogText.textContent = text;
            dialog.classList.add('visible');
            dialog.classList.remove('hidden');
        }
    }

    // Hide dialog
    function hideDialog() {
        const dialog = document.getElementById('tutorial-dialog');
        if (dialog) {
            dialog.classList.remove('visible');
            dialog.classList.add('hidden');
        }
    }

    // Show column labels
    function showColumnLabels() {
        const labels = document.getElementById('tutorial-column-labels');
        if (labels) {
            labels.classList.add('visible');
            labels.classList.remove('hidden');
        }
    }

    // Hide column labels
    function hideColumnLabels() {
        const labels = document.getElementById('tutorial-column-labels');
        if (labels) {
            labels.classList.remove('visible');
            labels.classList.add('hidden');
        }
    }

    // Show quit button
    function showQuitButton() {
        const btn = document.getElementById('tutorial-quit-btn');
        if (btn) {
            btn.style.display = 'block';
        }
    }

    // Hide quit button
    function hideQuitButton() {
        const btn = document.getElementById('tutorial-quit-btn');
        if (btn) {
            btn.style.display = 'none';
        }
    }

    // Lock all rolls except unit
    function lockAllExceptUnit() {
        if (typeof LockThousandRoll === 'function') LockThousandRoll(true);
        if (typeof LockHundredRoll === 'function') LockHundredRoll(true);
        if (typeof LockTenRoll === 'function') LockTenRoll(true);
        if (typeof LockUnitRoll === 'function') LockUnitRoll(false);
    }

    // Unlock all rolls
    function unlockAllRolls() {
        if (typeof LockThousandRoll === 'function') LockThousandRoll(false);
        if (typeof LockHundredRoll === 'function') LockHundredRoll(false);
        if (typeof LockTenRoll === 'function') LockTenRoll(false);
        if (typeof LockUnitRoll === 'function') LockUnitRoll(false);
    }

    // Set current value in Unity
    function setCurrentValue(value) {
        if (typeof unityInstance !== 'undefined') {
            const paddedValue = String(value).padStart(4, '0');
            unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'SetValue' + paddedValue);
        }
    }

    // Set goal in Unity
    function setGoal(value) {
        if (typeof unityInstance !== 'undefined') {
            unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'ChangeList' + value);
        }
    }

    // Stage 1: Découverte des boutons
    function startStage1() {
        state.stage = 1;
        state.step = 0;
        state.upClicks = 0;
        state.downClicks = 0;

        // Notifier Unity du changement d'étape
        if (typeof NotifyTutorialStageChange === 'function') {
            NotifyTutorialStageChange(1);
        }

        // Lock all rolls except unit
        lockAllExceptUnit();
        setCurrentValue(0);

        const msg1 = "Bienvenue dans la Counting Machine ! Commençons doucement. Pour l'instant, tu vois uniquement la colonne Unité. Le chiffre affiché est prêt à être modifié.";
        showDialog(msg1);
        speak(msg1, function() {
            state.step = 1;
            // Notifier Unity du changement de step
            if (typeof NotifyTutorialStepChange === 'function') {
                NotifyTutorialStepChange(1, 1);
            }
            const msg2 = "Essaie d'appuyer sur le bouton Haut.";
            showDialog(msg2);
            speak(msg2);
        });
    }

    // Handle up click in stage 1
    function handleStage1UpClick() {
        state.upClicks++;
        
        if (state.upClicks === 1 && state.step === 1) {
            const msg = "Parfait ! Continue. Clique encore sur Haut jusqu'à ce que tu en aies fait trois au total.";
            showDialog(msg);
            speak(msg);
        }
        
        if (state.upClicks >= 3 && state.step < 2) {
            state.step = 2;
            // Notifier Unity du changement de step
            if (typeof NotifyTutorialStepChange === 'function') {
                NotifyTutorialStepChange(1, 2);
            }
            const msg = "Super ! Maintenant, appuie trois fois sur le bouton Bas.";
            showDialog(msg);
            speak(msg);
        }
    }

    // Handle down click in stage 1
    function handleStage1DownClick() {
        if (state.step >= 2) {
            state.downClicks++;
            
            if (state.downClicks >= 3 && state.step < 3) {
                state.step = 3;
                // Notifier Unity du changement de step
                if (typeof NotifyTutorialStepChange === 'function') {
                    NotifyTutorialStepChange(1, 3);
                }
                const msg = "Bien joué ! Tu as compris comment modifier un chiffre. Quand tu es prêt, clique sur Valider pour passer à la suite.";
                showDialog(msg);
                speak(msg);
            }
        }
    }

    // Handle validate in stage 1
    function handleStage1Validate() {
        if (state.step >= 3) {
            startStage2();
        }
    }

    // Stage 2: Compréhension des colonnes
    function startStage2() {
        state.stage = 2;
        state.step = 0;
        state.goalsCompleted = 0;

        // Notifier Unity du changement d'étape
        if (typeof NotifyTutorialStageChange === 'function') {
            NotifyTutorialStageChange(2);
        }

        // Unlock all rolls
        unlockAllRolls();
        setCurrentValue(0);

        // Show column labels
        showColumnLabels();

        const msg1 = "Maintenant, regardons les différentes colonnes. Ici, tu peux voir : Unité, Dizaine, Centaine, Millier.";
        showDialog(msg1);
        speak(msg1, function() {
            const msg2 = "Je vais t'envoyer un nombre, et tu devras reproduire chaque chiffre dans la bonne colonne. On commence par l'Unité, puis la Dizaine, puis la Centaine, et enfin le Millier.";
            showDialog(msg2);
            speak(msg2, function() {
                sendStage2Number();
            });
        });
    }

    // Send a number for stage 2
    function sendStage2Number() {
        if (state.goalsCompleted < stage2Numbers.length) {
            state.currentGoal = stage2Numbers[state.goalsCompleted];
            setGoal(state.currentGoal);
            setCurrentValue(0);
            
            const formattedNumber = String(state.currentGoal).split('').join(' ');
            const msg = state.goalsCompleted === 0 
                ? "Ton premier nombre est : " + formattedNumber + ". Remplis les colonnes dans l'ordre indiqué."
                : "Essayons avec le nombre : " + formattedNumber + ".";
            showDialog(msg);
            speak(msg);
        } else {
            finishStage2();
        }
    }

    // Handle validate in stage 2
    function handleStage2Validate(isCorrect) {
        if (isCorrect) {
            state.goalsCompleted++;
            
            if (state.goalsCompleted < stage2Numbers.length) {
                const msg = state.goalsCompleted === 1 
                    ? "Parfait ! Clique sur Valider pour vérifier. Très bien ! Essayons avec un autre nombre."
                    : "Très bien ! Essayons avec un autre nombre.";
                showDialog(msg);
                speak(msg, function() {
                    sendStage2Number();
                });
            } else {
                finishStage2();
            }
        }
    }

    // Finish stage 2
    function finishStage2() {
        hideColumnLabels();
        const msg = "Bravo ! Tu maîtrises les positions.";
        showDialog(msg);
        speak(msg, function() {
            startStage3();
        });
    }

    // Stage 3: Exercices libres
    function startStage3() {
        state.stage = 3;
        state.step = 0;

        // Notifier Unity du changement d'étape
        if (typeof NotifyTutorialStageChange === 'function') {
            NotifyTutorialStageChange(3);
        }

        showQuitButton();

        const msg = "On passe maintenant aux exercices libres ! Je vais te proposer des nombres aléatoires à compléter. Tu peux t'entraîner autant que tu veux.";
        showDialog(msg);
        speak(msg, function() {
            sendStage3Number();
        });
    }

    // Send a random number for stage 3
    function sendStage3Number() {
        state.currentGoal = generateRandomNumber();
        setGoal(state.currentGoal);
        setCurrentValue(0);
        
        const formattedNumber = String(state.currentGoal).split('').join(' ');
        const msg = "Complète le nombre : " + formattedNumber + ".";
        showDialog(msg);
        speak(msg);
    }

    // Handle validate in stage 3
    function handleStage3Validate(isCorrect) {
        if (isCorrect) {
            const msg = "Bien joué ! Tu veux continuer ou quitter le didacticiel ? Clique sur Quitter si tu veux revenir au menu.";
            showDialog(msg);
            speak(msg, function() {
                // Send next number after a short delay
                setTimeout(sendStage3Number, 2000);
            });
        }
    }

    // Public API
    return {
        // Start the tutorial
        start: function() {
            state.active = true;
            
            // Notifier Unity du démarrage du didacticiel
            if (typeof NotifyTutorialStart === 'function') {
                NotifyTutorialStart(1);
            }
            
            startStage1();
        },

        // Quit the tutorial
        quit: function() {
            state.active = false;
            state.stage = 0;
            state.step = 0;
            
            hideDialog();
            hideColumnLabels();
            hideQuitButton();
            unlockAllRolls();
            
            // Notifier Unity de l'arrêt du didacticiel
            if (typeof NotifyTutorialQuit === 'function') {
                NotifyTutorialQuit();
            }
            
            window.speechSynthesis.cancel();
            
            const msg = "Tu as quitté le didacticiel. À bientôt !";
            showDialog(msg);
            speak(msg, function() {
                hideDialog();
            });
        },

        // Check if tutorial is active
        isActive: function() {
            return state.active;
        },

        // Get current stage
        getStage: function() {
            return state.stage;
        },

        // Handle up button click from Unity
        onUpClick: function() {
            if (!state.active) return;
            
            if (state.stage === 1) {
                handleStage1UpClick();
            }
        },

        // Handle down button click from Unity
        onDownClick: function() {
            if (!state.active) return;
            
            if (state.stage === 1) {
                handleStage1DownClick();
            }
        },

        // Handle validate from Unity
        onValidate: function(isCorrect) {
            if (!state.active) return;
            
            if (state.stage === 1) {
                handleStage1Validate();
            } else if (state.stage === 2) {
                handleStage2Validate(isCorrect);
            } else if (state.stage === 3) {
                handleStage3Validate(isCorrect);
            }
        },

        // Handle goal completed message from Unity
        onGoalCompleted: function() {
            if (!state.active) return;
            
            this.onValidate(true);
        }
    };
})();

// Initialize tutorial when window loads
window.Tutorial = Tutorial;
