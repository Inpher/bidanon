module.exports = function(models){

    var User = models.user;
    var Person = models.person;
    var Bid = models.bid;
    var Request = models.request;
    var PublicProfile = models.publicProfile;

    return {

        signup: function (req,res)
        {

            var body = req.body;
            console.log(body);
            User.findOne({ username: body.username
            },function(err, user) {
                if (err)
                    res.send(500, {'message': err});
                // check to see if theres already a user with that email
                if (user) {
                    res.send(403, {'message': 'User already exist!'});
                }else {
                    var newUser = new User({ username: body.username, email: body.email, type: body.type, password:body.password});
                    console.log(newUser);
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
            res.json({ auth_token: req.user.token.auth_token, type:req.user.type, "_id":req.user._id});
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

        createProfile: function(req,res)
        {
          var _id = req.user.id;
          console.log(req)
          var profile = req.body.profile;
          var query = { _id: _id };
          var newProfile = new PublicProfile({
            name: "James",
            avgMonthlyIncome : profile.financial.avgIncome,
            avgMonthlySpendings : profile.financial.avgSpendings,
            desc : "hello world I am cool",
            score : profile.financial.score,
            u_id : req.user.id,
          })
          newProfile.save(function (err, profile) {
            if (err) {
              res.send(500, {'message': err});
            }
            res.json({ 'message': 'Profile was successfully created'});
          })
        },

        getBids: function(req,res)
        {
            Bid.find(function(err,bids){
                res.json({bids: bids });
            });

        },
        getRequests: function(req,res)
        {
            Request.find(function(err,requests){
                res.json({requests: requests });
            });

        },
        getBidsPerUser: function (req,res) {
            var _id = req.params.uid;
            Bid.find({ "u_id":  _id},function(err,bids){
                res.json({bids: bids });
            });
        }
    }

}
