// =====================================
// Unity Bridge - Système d'événements bidirectionnel
// =====================================

// Système de gestion des événements Unity
const UnityEvents = (function() {
    // Registre des écouteurs d'événements
    const listeners = {};

    return {
        // Ajouter un écouteur pour un type d'événement
        on: function(eventType, callback) {
            if (!listeners[eventType]) {
                listeners[eventType] = [];
            }
            listeners[eventType].push(callback);
        },

        // Retirer un écouteur
        off: function(eventType, callback) {
            if (!listeners[eventType]) return;
            const index = listeners[eventType].indexOf(callback);
            if (index > -1) {
                listeners[eventType].splice(index, 1);
            }
        },

        // Déclencher un événement
        emit: function(eventType, data) {
            if (!listeners[eventType]) return;
            listeners[eventType].forEach(function(callback) {
                try {
                    callback(data);
                } catch (e) {
                    console.error('[UnityEvents] Erreur dans le callback:', e);
                }
            });
        },

        // Retirer tous les écouteurs d'un type d'événement
        clear: function(eventType) {
            if (eventType) {
                delete listeners[eventType];
            } else {
                Object.keys(listeners).forEach(function(key) {
                    delete listeners[key];
                });
            }
        }
    };
})();

// Exposer UnityEvents globalement
window.UnityEvents = UnityEvents;

// =====================================
// Fonctions d'envoi vers Unity
// =====================================

// cette fonction sert à changer le nombre afficher sur la machine
// SetValue322 -> la machine affichera 0322
function ChangeCurrentValue() {
    var value = document.getElementById("currentValue").value;
    if (typeof unityInstance !== 'undefined') {
        unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'SetValue' + value);
    }
}

// cette fonction sert à envoyer la liste des objectifs vers Unity
// ChangeList544/1352/9871 -> les objectifs seront 544 puis 1352 puis 9871
function ChangeCurrentGoalList() {
    var value = document.getElementById("currentGoalList").value;
    if (typeof unityInstance !== 'undefined') {
        unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'ChangeList' + value);
    }
}

// cas possible : bloquage de rouleau
// si rouleau des 1 bloqué      -> on ne peut pas augmenté/réduire de 1
// si rouleau des 10 bloqué     -> on ne peut pas augmenté/réduire de 1 si prochaine valeur n'est pas dans la plage de valeur disponible
//                              exemple : notre valeur est de 5895
//                                                              on est bloqué sur 9 donc si on augmente/réduit de 1, min=5890 et max=5899
//                              -> on ne peut pas augmenté/réduire de 10
// si rouleau des 100 bloqué    -> on ne peut pas augmenté/réduire de 1 si prochaine valeur n'est pas dans la plage de valeur disponible
//                              -> on ne peut pas augmenté/réduire de 10 si prochaine valeur n'est pas dans la plage de valeur disponible
//                              exemple : notre valeur est de 3259
//                                                              on est bloqué sur 2 donc si on augmente/réduit de 1 ou de 10, min=3200 et max=3299
//                              -> on ne peut pas augmenté/réduire de 100
// si rouleau des 1000 bloqué   -> on ne peut pas augmenté/réduire de 1 si prochaine valeur n'est pas dans la plage de valeur disponible
//                              -> on ne peut pas augmenté/réduire de 10 si prochaine valeur n'est pas dans la plage de valeur disponible
//                              -> on ne peut pas augmenté/réduire de 100 si prochaine valeur n'est pas dans la plage de valeur disponible
//                              exemple : notre valeur est de 7381
//                                                              on est bloqué sur 7 donc si on augmente/réduit de 1 ou de 10 ou de 100, min=7000 et max=7999
//                              -> on ne peut pas augmenté/réduire de 1000
// PS: on peut bloquer plusieurs rouleaux en même temps
// + animation de blocage

// cette fonction sert à bloquer/débloquer le rouleau des 1000
function LockThousandRoll(locked) {
    if (typeof unityInstance !== 'undefined') {
        unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'LockThousand:' + (locked ? 1 : 0));
    }
}

// cette fonction sert à bloquer/débloquer le rouleau des 100
function LockHundredRoll(locked) {
    if (typeof unityInstance !== 'undefined') {
        unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'LockHundred:' + (locked ? 1 : 0));
    }
}

// cette fonction sert à bloquer/débloquer le rouleau des 10
function LockTenRoll(locked) {
    if (typeof unityInstance !== 'undefined') {
        unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'LockTen:' + (locked ? 1 : 0));
    }
}

// cette fonction sert à bloquer/débloquer le rouleau des 1
function LockUnitRoll(locked) {
    if (typeof unityInstance !== 'undefined') {
        unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'LockUnit:' + (locked ? 1 : 0));
    }
}

// =====================================
// Fonctions pour notifier Unity des changements du didacticiel
// =====================================

// Notifier Unity du démarrage du didacticiel
function NotifyTutorialStart(stage) {
    if (typeof unityInstance !== 'undefined') {
        unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'TutorialStart:' + (stage || 1));
    }
}

// Notifier Unity de l'arrêt du didacticiel
function NotifyTutorialQuit() {
    if (typeof unityInstance !== 'undefined') {
        unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'TutorialQuit');
    }
}

// Notifier Unity du changement d'étape du didacticiel
function NotifyTutorialStageChange(stage) {
    if (typeof unityInstance !== 'undefined') {
        unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'TutorialStage:' + stage);
    }
}

// Notifier Unity du changement de step dans une étape
function NotifyTutorialStepChange(stage, step) {
    if (typeof unityInstance !== 'undefined') {
        unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'TutorialStep:' + stage + ':' + step);
    }
}

// =====================================
// Réception des messages de Unity
// =====================================

// Mapping des messages Unity vers les types d'événements
const unityEventMap = {
    'UpClicked': 'upClick',
    'ButtonUp': 'upClick',
    'DownClicked': 'downClick',
    'ButtonDown': 'downClick',
    'GoalCompleted': 'goalCompleted',
    'Correct': 'goalCompleted',
    'Validated': 'validate',
    'Validate': 'validate',
    'ValueChanged': 'valueChanged',
    'RollChanged': 'rollChanged'
};

window.onUnityMessage = function(message) {
    console.log("[UnityBridge] Message reçu de Unity:", message);
    
    // Émettre l'événement brut pour les écouteurs génériques
    UnityEvents.emit('message', message);
    
    // Parser le message pour extraire le type et les données
    var eventType = message;
    var eventData = null;
    
    // Gérer les messages avec des données (format: "Type:data" ou "Type:data1:data2")
    if (message.indexOf(':') !== -1) {
        var parts = message.split(':');
        eventType = parts[0];
        eventData = parts.slice(1).join(':');
    }
    
    // Mapper vers un événement normalisé si possible
    var normalizedEvent = unityEventMap[eventType] || eventType;
    
    // Émettre l'événement normalisé
    UnityEvents.emit(normalizedEvent, eventData);
    
    // Rétrocompatibilité : gérer les messages pour le didacticiel
    if (typeof Tutorial !== 'undefined' && Tutorial.isActive()) {
        // Handle up button click
        if (normalizedEvent === 'upClick') {
            Tutorial.onUpClick();
        }
        // Handle down button click
        else if (normalizedEvent === 'downClick') {
            Tutorial.onDownClick();
        }
        // Handle goal completed
        else if (normalizedEvent === 'goalCompleted') {
            Tutorial.onGoalCompleted();
        }
        // Handle validation
        else if (normalizedEvent === 'validate') {
            Tutorial.onValidate(true);
        }
    }
};
