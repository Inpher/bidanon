module.exports = function(models){

    var User = models.user;
    var Person = models.person;
    var Bid = models.bid;

    return {

        signup: function (req,res)
        {

            var body = req.body;

            User.findOne({ username: body.username
            },function(err, user) {
                if (err)
                    res.send(500, {'message': err});
                // check to see if theres already a user with that email
                if (user) {
                    res.send(403, {'message': 'User already exist!'});
                }else {
                    var newUser = new User({ username: body.username,email: body.email, password:body.password})
                    newUser.save(function (err, user) {
                        if (err){
                            res.send(500, {'message': err});
                        }
                        res.json({ 'message': 'User was successfully registered!'});
                    });
                }
            });
        },

        login:function(req,res)
        {
            res.json({ auth_token: req.user.token.auth_token});
        },

        logout: function(req,res)
        {
            req.user.auth_token = null;
            req.user.save(function(err,user){
                if (err){
                    res.send(500, {'message': err});
                }
                res.json({ message: 'See you!'});
            });
        },
        createPerson: function(req,res)
        {
            var person = req.body.person;

            if (typeof person.name != "string") {
                res.send(400, {'message': "Name must be a string!"});
            }
            if (typeof person.age != "number") {
                res.send(400, {'message': "Age must be a number!"});
            }

            var newPerson = new Person({ name: person.name, age: person.age})
            newPerson.save(function (err, user) {
                if (err){
                    res.send(500, {'message': err});
                }
                res.json({ 'message': 'Person was successfully added!'});
            });

        },
        updatePerson: function(req,res)
        {
            var _id = req.params.id;
            var person = req.body.person;

            var query = { _id: _id };
            Person.update(query, {name:person.name,age:person.age}, null, function (err, bid) {
                if (err){
                    res.send(500, {'message': err});
                }
                res.json({ 'message': 'Person was successfully updated!'});
            })

        },
        removePerson: function(req,res)
        {
            var _id = req.params.id;

            Person.remove({ _id:_id}, function (err, user) {
                if (err){
                    res.send(500, {'message': err});
                }
                res.json({ 'message': 'Person was successfully removed!'});
            })


        },
        getPeople: function(req,res)
        {

            Person.find(function(err,people){
                res.json({people: people });
            })


        },
        createBid: function(req,res)
        {

            console.log(req.body);
            var bid = req.body.bid;

            if (typeof bid.score != "number") {
                res.send(400, {'message': "Score must be a number!"});
            }
            if (typeof bid.amount != "number") {
                res.send(400, {'message': "Amount must be a number!"});
            }

            var newBid = new Bid({ score: bid.score, amount: bid.amount})
            newBid.save(function (err, bid) {
                if (err){
                    res.send(500, {'message': err});
                }
                res.json({ 'message': 'Bid was successfully created!'});
            });

        },
        updateBid: function(req,res)
        {
            var _id = req.params.id;
            console.log(req.body);
            console.log(_id);

            var bid = req.body.bid;

            var query = { _id: _id };
            Bid.update(query, {score:bid.score,amount:bid.amount}, null, function (err, bid) {
                if (err){
                    res.send(500, {'message': err});
                }
                res.json({ 'message': 'Bid was successfully updated!'});
            })

        },
        removeBid: function(req,res)
        {
            var _id = req.params.id;

            Bid.remove({ _id:_id}, function (err, user) {
                if (err){
                    res.send(500, {'message': err});
                }
                res.json({ 'message': 'Bid was successfully removed!'});
            })

        },

        getBids: function(req,res)
        {
            Bid.find(function(err,bids){
                res.json({bids: bids });
            });

        },

    	// computeFindata: function(req,res)
    	// {
    	// }
    }

}



