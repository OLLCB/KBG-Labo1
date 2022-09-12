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
        get() {
            if (this.HttpContext.path.queryString == '?' || !this.HttpContext.path.queryString) {
                // Afficher la page qui affiche les commandes possible
                // Send helpPage.html
                let helpPagePath = path.join(process.cwd(), "wwwroot/helpPages/mathsServiceHelp.html");
                let content = fs.readFileSync(helpPagePath);
                this.HttpContext.response.content("text/html", content); // Sert la page HTML
            }
            else { // Si on veut faire une opération (queryString 'op' existe)
                let singleNumberOperators = ["!", "p", "np"];
                let doubleNumberOperators = [" ", "-", "*", "/", "%"];
                let op = this.HttpContext.path.params.op;
                // Si 'op' n'est pas une opération valide ou est manquant
                if (!singleNumberOperators.includes(op) && !doubleNumberOperators.includes(op)) {
                    this.HttpContext.path.params.error = "Parameter 'op' is missing or invalid!";
                    this.HttpContext.response.JSON(this.HttpContext.path.params);
                }
                else {
                    if (singleNumberOperators.includes(op)) { // Vérifier si le nombre de paramètres nécessaire à faire les opérations existe.
                        if (!this.HttpContext.path.params.n || isNaN(this.HttpContext.path.params.n)) {
                            this.HttpContext.path.params.error = "'n' is missing or not a number!";
                            this.HttpContext.response.JSON(this.HttpContext.path.params);
                        }
                        else if(Object.keys(this.HttpContext.path.params).length > 2){ // S'il y a trop de paramètres dans la requête (Besoin de 'op' et 'n' seulement)
                            this.HttpContext.path.params.error = "Too many parameters!";
                            this.HttpContext.response.JSON(this.HttpContext.path.params);
                        }
                        else { // Si 'op' est valide et 'n' est un nombre valide.
                            let n = this.HttpContext.path.params.n;
                            let value;
                            switch (op) {
                                case "!":
                                    if (n >= 0) {
                                        value = factorial(parseInt(n));
                                        this.HttpContext.path.params.value = value;
                                        this.HttpContext.response.JSON(this.HttpContext.path.params);
                                    }
                                    else { // Si n est < 0
                                        this.HttpContext.path.params.error = "'n' must be a positive number";
                                        this.HttpContext.response.JSON(this.HttpContext.path.params);
                                    }
                                    break;
                                case "p":
                                    value = isPrime(n);
                                    this.HttpContext.path.params.value = value;
                                    this.HttpContext.response.JSON(this.HttpContext.path.params);
                                    break;
                                case "np":
                                    value = findPrime(n);
                                    this.HttpContext.path.params.value = value;
                                    this.HttpContext.response.JSON(this.HttpContext.path.params);
                                    break;
                            }
                        }
                    }
                    else if (doubleNumberOperators.includes(op)) { // Si est un opérateur à deux nombres
                        if (!this.HttpContext.path.params.x || isNaN(this.HttpContext.path.params.x)) { // Si 'X' est invalide ou inexistant
                            this.HttpContext.path.params.error = "'x' is missing or not a number!";
                            this.HttpContext.response.JSON(this.HttpContext.path.params);
                        }
                        else if (!this.HttpContext.path.params.y || isNaN(this.HttpContext.path.params.y)) // Si 'Y' est invalide ou inexistant
                        {
                            this.HttpContext.path.params.error = "'y' is missing or not a number!";
                            this.HttpContext.response.JSON(this.HttpContext.path.params);
                        }
                        else if(Object.keys(this.HttpContext.path.params).length > 3){ // S'il y a trop de paramètres dans la requête (Besoin de 'op', 'x' et 'y' seulement)
                            this.HttpContext.path.params.error = "Too many parameters!";
                            this.HttpContext.response.JSON(this.HttpContext.path.params);
                        }
                        else { // Si 'op', 'X' ET 'Y' sont tous valide
                            let x = parseInt(this.HttpContext.path.params.x);
                            let y = parseInt(this.HttpContext.path.params.y);
                            let value;
                            switch (op) {
                                case " ":
                                    value = x + y;
                                    this.HttpContext.path.params.value = value;
                                    this.HttpContext.path.params.op = "+";
                                    this.HttpContext.response.JSON(this.HttpContext.path.params);
                                    break;
                                case "-":
                                    value = x - y;
                                    this.HttpContext.path.params.value = value;
                                    this.HttpContext.response.JSON(this.HttpContext.path.params);
                                    break;
                                case "/":
                                    if (x == 0 || y == 0) {
                                        value = x / y;
                                        this.HttpContext.path.params.error = "Division by 0!";
                                        this.HttpContext.response.JSON(this.HttpContext.path.params);
                                    }
                                    else {
                                        value = x / y;
                                        this.HttpContext.path.params.value = value;
                                        this.HttpContext.response.JSON(this.HttpContext.path.params);
                                    }
                                    break;
                                case "*":
                                    value = x * y;
                                    this.HttpContext.path.params.value = value;
                                    this.HttpContext.response.JSON(this.HttpContext.path.params);
                                    break;
                                case "%":
                                    if (x == 0 || y == 0) {
                                        value = x / y;
                                        this.HttpContext.path.params.error = "Division by 0!";
                                        this.HttpContext.response.JSON(this.HttpContext.path.params);
                                    }
                                    else {
                                        value = x % y;
                                        this.HttpContext.path.params.value = value;
                                        this.HttpContext.response.JSON(this.HttpContext.path.params);
                                    }
                                    break;
                            }
                        }
                    }
                }
            }
        }
    }