function fetch() {}

Polymer({
    is: 'push-activation',

    tapSubscribePush: function() {
        if (this.isSubscribed) {
            this.unsubscribeUser();
        } else {
            this.subscribeUser();
        }
    },


    publicServerKey: 'BPOOvDThOUuSxiC-DuMv-WXG0XbSCwKR6Jux0CkyeyZ86OMF2U64VYKksNCJKoJdq1ISzYKfCUUxB6hKM0zeNGA',

    attached: function() {
        this.getSwRegistration()
            .then(this.initUI.bind(this));
    },


    // initialize UI and get subscription details
    initUI: function (swRegistration) {
        swRegistration.pushManager.getSubscription()
            .then(function(subscription) {
                return subscription !== null
            })
            .then(this.updateSubscriptionButton.bind(this));
    },

    updateSubscriptionButton: function (isSubscribed) {
        var btn = this.$.subscribeButton;
        this.isSubscribed = isSubscribed;
        if (isSubscribed) {
            btn.icon = 'social:notifications-active';
        } else {
            btn.icon = 'social:notifications-off';
        }
        btn.disabled = false;
    },


    getSwRegistration: function() {
        return navigator.serviceWorker.getRegistration()
            .then(function (swRegistration) {
                return swRegistration ? swRegistration
                    : Promise.reject('No running worker');
            });
    },

    unsubscribeUser: function () {
        this.getSwRegistration()
        .then(swr => swr.pushManager.getSubscription())
        .then(subscription => {
            if (subscription) {subscription.unsubscribe();}
            return subscription;
        })
        .then(this.unregisterSubscriptionOnServer)
        .then(() => {this.updateSubscriptionButton(false);});
    },

    unregisterSubscriptionOnServer: function (subscription) {
        return fetch('/unregisterSubscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({subscription: subscription})
        });
    },

    subscribeUser: function () {
        this.getSwRegistration()
        .then(swr => swr.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.b64ToArray(this.publicServerKey)}))
        .then(this.registerSubscriptionOnServer)
        .then(() => this.updateSubscriptionButton(true));
    },

    b64ToArray: function (base64String) { /* ... */ },

    registerSubscriptionOnServer: function (subscription) {
        return fetch('/registerSubscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: subscription })
        });
    }

});
