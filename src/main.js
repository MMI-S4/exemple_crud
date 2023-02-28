const Express = require('express');
const Colors = require('colors'); // Utile pour afficher en couleur dans la console
let mongoose = require('mongoose'); // Interface MongoDB

// QUINCHON Guillaume TP11

const app = Express();
const SERVER_PORT = 3000; // Le port d'écoute du serveur
const MONGO_SERVER = process.env.MONGO_SERVER || 'localhost' ;
const MONGO_DATABASE = process.env.MONGO_DATABASE || 'mmidb' ;
const mongoURL = 'mongodb://'+MONGO_SERVER+'/'+MONGO_DATABASE; // URL pour se connecter à MongoDB

// Connexion à MongoDB
mongoose.connect(mongoURL, { useNewUrlParser: true });

let db = mongoose.connection;
// En cas d'erreur de connexion
db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB'));
// Si la BDD est connectée
db.once('open', () => {
    console.log(('Connexion à la base réussie').yellow);
});

app.use(Express.urlencoded())

// Création du schéma
let PlayerSchema = new mongoose.Schema({
    username: String,
    password: String,
    playername: String,
    dateCreation: Date,
    level: Number,
    premium: Boolean
});

// Création du model à partir du schéma
let Player = mongoose.model('Player', PlayerSchema);

// Page d'accueil
app.get('/', (req, res) => {
    // Affiche comment utiliser l'API avec des exemples
    const page = `
    <h1>Utilisation de l\'API</h1>
    GET <a href="/users">/users</a> : Récupérer la liste des utilisateurs
    <br><br>
    Exemple : <a href="/users">/users</a>
    <br><hr><br>
    GET <a href="/user/:id">/user/:<sup>(Str)</sup>id</a> : Récupérer les données de l\'utilisateur
    <br><br>
    Exemple : <a href="/user/632ab827e566a1d8fc3a62dc">/user/632ab827e566a1d8fc3a62dc</a>
    <br><hr><br>
    GET <a href="/user/create/:username/:password/:playername/:level/:premium">/user/create/:<sup>(Str)</sup>username/:<sup>(Str)</sup>password/:<sup>(Str)</sup>playername/:<sup>(Num)</sup>level/:<sup>(Bool)</sup>premium</a> : Créer un nouvel utilisateur
    <br><br>
    Exemple : <a href="/user/create/john/sdsgrsg/John/80/false">/user/create/john/sdsgrsg/John/80/false</a>
    <br><hr><br>
    GET <a href="/user/update/:id/:username/:password/:playername/:level/:premium">/user/update/:<sup>(Str)</sup>id/:<sup>(Str)</sup>username/:<sup>(Str)</sup>password/:<sup>(Str)</sup>playername/:<sup>(Num)</sup>level/:<sup>(Bool)</sup>premium</a> : Mettre à jour l'utilisateur
    <br><br>
    Exemple : <a href="/user/update/632ad2edcbf3e2bf69b36f4f/johnny/sdsgrsg/John2/80/false">/user/update/632ad2edcbf3e2bf69b36f4f/johnny/sdsgrsg/John2/80/false</a>
    <br><hr><br>
    GET <a href="/user/delete/:id">/user/delete/:<sup>(Str)</sup>id</a> : Supprimer l'utilisateur
    <br><br>
    Exemple : <a href="/user/delete/632abaaff5d377e738eed194">/user/delete/632abaaff5d377e738eed194</a>
    <br><br><br>
    <small>QUINCHON Guillaume TP11</small>
  `;
    res.send(page);
});

// Lister les utilisateurs
app.get('/users', (req, res) => {
    // Récupérer tous les utilisateurs
    Player.find(function (err, users) {
        // Si il y a une erreur
        if (err) {
            res.json({ message: 'Impossible de récupérer les utilisateurs' });
        }
        // Envoyer les informations des utilisateurs
        res.json(users);
    });
})

// Accéder à un utilisateur existant
app.get('/user/:id', (req, res) => {
    // Sélectionner l'utilisateur à partir de son id
    Player.findById(req.params.id, (err, user) => {
        if (err) {
            res.json({ message: 'Impossible d\'accéder à l\'utilisateur' });
        }
        res.json(user);
    });
});

// Créer un nouvel utilisateur
app.get('/user/create/:username/:password/:playername/:level/:premium', (req, res) => {
    // Créer un nouvel objet Player
    let user = new Player();
    // Faire correspondre les champs de l'objet avec les données de la requête
    user.username = req.params.username;
    user.password = req.params.password;
    user.playername = req.params.playername;
    user.dateCreation = Date();
    user.level = req.params.level;
    user.premium = req.params.premium;

    // Enregistrer le nouvel utilisateur
    user.save((err) => {
        if (err) {
            res.json({ message: 'Impossible d\'ajouter un utilisateur' });
        }
        res.json({ message: 'Utilisateur ajouté' });
    });
});

/*

Commande pour tester l'API en POST :

curl http://localhost:3000/user/create -X POST -d "username=patrick&password=test&playername=patrick23&level=122&premium=false"

*/

// Créer un nouvel utilisateur
app.post('/user/create', async (req, res) => {
    // Vérifier si le nom d'utilisateur est déjà utilisé
    const userExists = await Player.exists({ username: req.body.username });

    // Si un utilisateur avec le même nom existe déjà
    if (userExists) {
        res.json({ message: 'Ce username est déjà utilisé' });
    }
    else {
        //Créer un nouvel objet Player
        let user = new Player();

        // Faire correspondre les champs de l'objet avec les données de la requête
        user.username = req.body.username;
        user.password = req.body.password;
        user.playername = req.body.playername;
        user.dateCreation = Date();
        user.level = req.body.level;
        user.premium = req.body.premium;

        // Enregistrer le nouvel utilisateur
        user.save((err) => {
            if (err) {
                res.json({ message: 'Impossible d\'ajouter un utilisateur' });
            }
            res.json({ message: 'Utilisateur ajouté' });
        });
    }
});

// Mettre à jour un utilisateur
app.get('/user/update/:id/:username/:password/:playername/:level/:premium', (req, res) => {
    // Trouver l'utilisateur dans la base à partir de son id
    Player.findById(req.params.id, function (err, user) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        // Faire correspondre les champs de l'objet avec les données de la requête
        user.username = req.params.username;
        user.password = req.params.password;
        user.playername = req.params.playername;
        user.level = req.params.level;
        user.premium = req.params.premium;

        // Ré-enregistrer l'utilisateur
        user.save(function (err) {
            if (err) {
                res.json({ message: 'Impossible de mettre à jour l\'utilisateur' });
            }
            res.json({ message: 'Utilisateur mis à jour' });
        });
    });
});

// Supprimer un utilisateur
app.get('/user/delete/:id', (req, res) => {
    // Vérifier que l'id est au bon format pour MongoDB
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        // Supprimer l'utilisateur en question
        Player.deleteOne({ _id: req.params.id }, function (err, user) {
            if (err) {
                res.json({ message: 'Impossible de supprimer l\'utilisateur' });
            }
            res.json({ message: 'Utilisateur supprimé' });
        });
    }
    else {
        res.json({ message: 'Utilisateur invalide' });
    }
});

// Lancer le serveur
app.listen(SERVER_PORT, () => {
    console.log(('Serveur lancé sur le port ' + SERVER_PORT).blue);
});