const path = require('path');
const fs = require('fs');

function factorial(n) {
    if (n === 0 || n === 1) {
        return 1;
    }
    return n * factorial(n - 1);
}
function isPrime(value) {
    for (var i = 2; i < value; i++) {
        if (value % i === 0) {
            return false;
        }
    }
    return value > 1;
}
function findPrime(n) {
    let primeNumer = 0;
    for (let i = 0; i < n; i++) {
        primeNumer++;
        while (!isPrime(primeNumer)) {
            primeNumer++;
        }
    }
    return primeNumer;
}

module.exports =
    class ContactsController extends require('./Controller') {
        constructor(HttpContext) {
            super(HttpContext);
        }
        error(message) { // Send error message 
            this.HttpContext.path.params.error = message;
            this.HttpContext.response.JSON(this.HttpContext.path.params);
        }
        result(value) { // Send result
            this.HttpContext.path.params.value = value;
            this.HttpContext.response.JSON(this.HttpContext.path.params);
        }
        sendHelpPage(accessPath) {
            let helpPagePath = path.join(process.cwd(), accessPath);
            let content = fs.readFileSync(helpPagePath);
            this.HttpContext.response.content("text/html", content); // Sert la page HTML
        }
        valideateOperator(op) {
            let singleNumberOperators = ["!", "p", "np"];
            let doubleNumberOperators = [" ", "-", "*", "/", "%"];
            let valide = true;
            // Si 'op' n'est pas une opération valide ou est manquant
            if (!singleNumberOperators.includes(op) && !doubleNumberOperators.includes(op)) {
                valide = false;
            }
            return valide;
        }
        isMissingOrNaN(value){
            let error = false;
            if(!value || isNaN(value))
                error = true;
            return error;
        }
        tooManyOperators(limit){
            let tooMany = false;
            if(Object.keys(this.HttpContext.path.params).length > limit)
                tooMany = true;
            return tooMany;
        }
        get() {
            if (this.HttpContext.path.queryString == '?' || !this.HttpContext.path.queryString) {
                // Afficher la page qui affiche les commandes possible
                // Send helpPage.html
                this.sendHelpPage("wwwroot/helpPages/mathsServiceHelp.html");
            }
            else { // Si on veut faire une opération (queryString 'op' existe)
                let singleNumberOperators = ["!", "p", "np"];
                let doubleNumberOperators = [" ", "-", "*", "/", "%"];
                let op = this.HttpContext.path.params.op;
                // Si 'op' n'est pas une opération valide ou est manquant
                if (!this.valideateOperator(this.HttpContext.path.params.op)) {
                    this.error("Parameter 'op' is missing or invalid!");
                }
                else {
                    if (singleNumberOperators.includes(op)) { // Vérifier si le nombre de paramètres nécessaire à faire les opérations existe.
                        if (this.isMissingOrNaN(this.HttpContext.path.params.n)) {
                            this.error("'n' is missing or not a number!");
                        }
                        else if (this.tooManyOperators(2)) { // S'il y a trop de paramètres dans la requête (Besoin de 'op' et 'n' seulement)
                            this.error("Too many parameters!");
                        }
                        else { // Si 'op' est valide et 'n' est un nombre valide.
                            let n = this.HttpContext.path.params.n;
                            let value;
                            switch (op) {
                                case "!":
                                    if (n >= 0) {
                                        value = factorial(parseInt(n));
                                        this.result(value);
                                    }
                                    else { // Si n est < 0
                                        this.error("'n' must be a positive number");
                                    }
                                    break;
                                case "p":
                                    value = isPrime(n);
                                    this.result(value);
                                    break;
                                case "np":
                                    value = findPrime(n);
                                    this.result(value);
                                    break;
                            }
                        }
                    }
                    else if (doubleNumberOperators.includes(op)) { // Si est un opérateur à deux nombres
                        if (this.isMissingOrNaN(this.HttpContext.path.params.x)) { // Si 'X' est invalide ou inexistant
                            this.error("'x' is missing or not a number!");
                        }
                        else if (this.isMissingOrNaN(this.HttpContext.path.params.y)){ // Si 'Y' est invalide ou inexistant
                            this.error("'y' is missing or not a number!");
                        }
                        else if (this.tooManyOperators(3)) { // S'il y a trop de paramètres dans la requête (Besoin de 'op', 'x' et 'y' seulement)
                            this.error("Too many parameters!");
                        }
                        else { // Si 'op', 'X' ET 'Y' sont tous valide
                            let x = parseInt(this.HttpContext.path.params.x);
                            let y = parseInt(this.HttpContext.path.params.y);
                            let value;
                            switch (op) {
                                case " ":
                                    value = x + y;
                                    this.HttpContext.path.params.op = "+"; // Remplacer le ' ' dans le querystring par le symbole '+', Problème unique à l'opérateur '+'
                                    this.result(value);
                                    break;
                                case "-":
                                    value = x - y;
                                    this.result(value);
                                    break;
                                case "/":
                                    if (x == 0 || y == 0) {
                                        value = x / y;
                                        this.error("Division by 0!");
                                    }
                                    else {
                                        value = x / y;
                                        this.result(value);
                                    }
                                    break;
                                case "*":
                                    value = x * y;
                                    this.result(value);
                                    break;
                                case "%":
                                    if (x == 0 || y == 0) {
                                        value = x / y;
                                        this.error("Division by 0!");
                                    }
                                    else {
                                        value = x % y;
                                        this.result(value);
                                    }
                                    break;
                            }
                        }
                    }
                }
            }
        }
    }