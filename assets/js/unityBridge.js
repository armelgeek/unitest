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

window.onUnityMessage = function(message) {
    console.log("[UnityBridge override] Message:", message);
};
