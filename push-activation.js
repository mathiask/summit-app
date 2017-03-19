Polymer({
    is: 'push-activation',

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

    tapSubscribePush: function(e) {
        this.getSwRegistration()
            .then(function () {
                this.$.subscribeButton.disabled = true;
                if (this.isSubscribed) {
                    this.unsubscribeUser();
                } else {
                    this.subscribeUser();
                }
            }.bind(this));
    },

    getSwRegistration: function() {
        if (this.swRegistration) {
            return Promise.resolve(this.swRegistration);
        }
        return navigator.serviceWorker.getRegistration()
            .then(function (swRegistration) {
                if (swRegistration) {
                    this.swRegistration = swRegistration;
                    return swRegistration;
                } else {
                    return Promise.reject('No running service worker found!');
                }
            }.bind(this));
    },

    unsubscribeUser: function () {
        this.swRegistration.pushManager.getSubscription()
            .then(function(subscription) {
                if (subscription) {
                    subscription.unsubscribe();

                }
                return subscription;
            })
            .then(this.unregisterSubscriptionOnServer)
            .then(function() {
                this.updateSubscriptionButton(false);
            }.bind(this))
    },

    unregisterSubscriptionOnServer: function (subscription) {
        return fetch('/unregisterSubscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: subscription })
        });
    },

    subscribeUser: function () {
        this.swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlB64ToUint8Array(this.publicServerKey)
        })
            .then(this.registerSubscriptionOnServer)
            .then(function(){
                console.log('User successfully subscribed');
                this.updateSubscriptionButton(true);
            }.bind(this))
    },

    urlB64ToUint8Array: function (base64String) {
        // ...
    },

    registerSubscriptionOnServer: function (subscription) {
        return fetch('/registerSubscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: subscription })
        });
    }

});
