var subscriptions = [];

app.post('/registerSubscription', (req, res) => {
    subscriptions.push(req.body.subscription);
    res.status(200).send({success: true});
});

app.post('/unregisterSubscription', (req, res) => {
    var subscriptionObject = req.body.subscription;
    subscriptions =
        subscriptions.filter(el => el.endpoint !== subscriptionObject.endpoint);
    res.status(200).send({success: true});
});
