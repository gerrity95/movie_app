window.cookieconsent.initialise({
  'palette': {
    'popup': {
      'background': '#64386b',
      'text': '#ffcdfd',
    },
    'button': {
      'background': '#f8a8ff',
      'text': '#3f0045',
    },
  },
  'theme': 'classic',
  'type': 'opt-out',
  'cookie': {
    'name': 'fmovies_cookie',
    'secure': true,
  },
  'revokable': 'true',
  'onInitialise': function(status) {
    const type = this.options.type;
    const didConsent = this.hasConsented();
    if (type == 'opt-in' && didConsent) {
      gtag('config', 'G-J4CGFXDF0J');
    }
    if (type == 'opt-out' && !didConsent) {
      gtag('config', 'G-J4CGFXDF0J', {
        'client_storage': 'none',
      });
      // https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out
    }
  },
  'onStatusChange': function(status, chosenBefore) {
    const type = this.options.type;
    const didConsent = this.hasConsented();
    if (type == 'opt-in' && didConsent) {
      gtag('config', 'G-J4CGFXDF0J');
    }
    if (type == 'opt-out' && !didConsent) {
      gtag('config', 'G-J4CGFXDF0J', {
        'client_storage': 'none',
      });
      // https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out
    }
  },
  'onRevokeChoice': function() {
    const type = this.options.type;
    if (type == 'opt-in') {
      gtag('config', 'G-J4CGFXDF0J', {
        'client_storage': 'none',
      });
      // https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out
    }
    if (type == 'opt-out') {
      gtag('config', 'G-J4CGFXDF0J');
    }
  },
});
