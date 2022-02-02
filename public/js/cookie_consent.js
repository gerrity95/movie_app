window.cookieconsent.initialise({
    "palette": {
    "popup": {
    "background": "#64386b",
    "text": "#ffcdfd"
    },
    "button": {
    "background": "#f8a8ff",
    "text": "#3f0045"
    }
    },
    "theme": "classic",
    "type": "opt-out",
    "cookie": {
        "name": "fmovies_cookie",
    },
    "revokable": "true",
    "SameSite": "Lax",
    onInitialise: function (status) {
        var type = this.options.type;
        var didConsent = this.hasConsented();
        if (type == 'opt-in' && didConsent) {
        console.log("Cookies enabled");
        }
        if (type == 'opt-out' && !didConsent) {
        console.log("Cookies disabled");
        // https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out
        }
        },
    onStatusChange: function(status, chosenBefore) {
        var type = this.options.type;
        var didConsent = this.hasConsented();
        if (type == 'opt-in' && didConsent) {
            console.log("Cookies enabled");
        }
        if (type == 'opt-out' && !didConsent) {
            console.log("Cookies disabled");
        // https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out
        }
        },
    onRevokeChoice: function() {
        var type = this.options.type;
        if (type == 'opt-in') {
            console.log("Cookies disabled");
        // https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out
        }
        if (type == 'opt-out') {
            console.log("Cookies enabled");
        }
        }
    });