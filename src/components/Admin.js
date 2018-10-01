import React from 'react';
import AjouterRecette from "./AjouterRecette";
import base from "../base";

class Admin extends React.Component {

    state = {
        uid: null,
        owner: null
    };

    componentDidMount() {
        base.onAuth(user => {
            if (user) {
                this.traitementConnexion(null, {user});
            }
        })
    };

    traiterChangement = (event, key) => {
        const recette = this.props.recettes[key];
        const majRecette = {
            ...recette,
            [event.target.name]: event.target.value
        };
        this.props.majRecette(key, majRecette);
    };

    connexion = provider => {
        base.authWithOAuthPopup(provider, this.traitementConnexion);
    };

    deconnexion = () => {
        base.unauth();
        this.setState({ uid: null });
    };

    traitementConnexion = (err, authData) => {
        if (err) {
            console.log(err);
            return;
        }

        // Récupérer le nom de la boite
        const boxRef = base.database().ref(this.props.pseudo);

        // Vérifier les données
        boxRef.once('value', snapshot => {
            const data = snapshot.val() || {};

            // Créé si personne
           if (!data.owner) {
               boxRef.set({
                   owner: authData.user.uid
               })
           }

           this.setState({
               uid: authData.user.uid,
               owner: data.owner || authData.user.uid
           })
        });
    };

    renderLogin = () => {
        return (
            <div className="login">
                <h2>Connecte toi pour créer tes recettes !</h2>
                <button className="facebook-button" onClick={() => this.connexion('facebook')} >Me connecter avec Facebook</button>
                <button className="google-button" onClick={() => this.connexion('google')} >Me connecter avec Google</button>
            </div>
        )
    };

    renderAdmin = key => {
        const recette = this.props.recettes[key];
        return (
            <div className="card" key={key} >
                <form className="admin-form">

                    <input type="text" name="nom" placeholder="Nom de la recette" value={recette.nom} onChange={(e) => this.traiterChangement(e, key)} />

                    <input type="text" name="image" placeholder="Adresse de l'image" value={recette.image} onChange={(e) => this.traiterChangement(e, key)} />

                    <textarea name="ingredients" rows="3" placeholder="Liste des ingrédients" value={recette.ingredients} onChange={(e) => this.traiterChangement(e, key)} ></textarea>

                    <textarea name="instructions" rows="15" placeholder="Liste des instructions" value={recette.instructions} onChange={(e) => this.traiterChangement(e, key)} ></textarea>

                </form>
                <button onClick={() => this.props.supprimerRecette(key)}>Supprimer</button>
            </div>
        )
    };

    render() {

        const deconnexion = <button onClick={this.deconnexion}>Déconnexion</button>;

        // Si il existe un propriétaire
        if (!this.state.uid) {
            return <div>{this.renderLogin()}</div>
        }

        // Est ce le propriétaire
        if (this.state.uid !== this.state.owner) {
            return (
                <div className="login">
                    {this.renderLogin()}
                    <p>Tu n'es pas le propriétaire de cette page.</p>
                </div>
            )
        }

        const adminCards = Object.keys(this.props.recettes).map(this.renderAdmin);

        return (
            <div className="cards">
                <AjouterRecette ajouterRecette={this.props.ajouterRecette}/>
                {adminCards}
                <footer>
                    <button onClick={this.props.chargerExemple}>Remplir</button>
                    {deconnexion}
                </footer>
            </div>
        )
    }

    static propTypes = {
        chargerExemple: React.PropTypes.func.isRequired,
        ajouterRecette: React.PropTypes.func.isRequired,
        majRecette: React.PropTypes.func.isRequired,
        supprimerRecette: React.PropTypes.func.isRequired,
        recettes: React.PropTypes.object.isRequired,
        pseudo: React.PropTypes.string.isRequired
    }
}

export default Admin;