// Node modules
import React, { Component } from "react";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// CSS
import "./Registration.css";

// Contract
import getWeb3 from "../../getWeb3";
import Election from "../../contracts/Election.json";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      isElStarted: false,
      isElEnded: false,
      voterCount: undefined,
      voterName: "",
      voterPhone: "",
      voters: [],
      currentVoter: {
        address: undefined,
        name: null,
        phone: null,
        hasVoted: false,
        isVerified: false,
        isRegistered: false,
      },
    };
  }

  // refreshing once
  componentDidMount = async () => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Election.networks[networkId];
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3: web3,
        ElectionInstance: instance,
        account: accounts[0],
      });

      // Admin account and verification
      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Get start and end values
      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      // Total number of voters
      const voterCount = await this.state.ElectionInstance.methods
        .getTotalVoter()
        .call();
      this.setState({ voterCount: voterCount });

      // Loading all the voters
      for (let i = 0; i < this.state.voterCount; i++) {
        const voterAddress = await this.state.ElectionInstance.methods
          .voters(i)
          .call();
        const voter = await this.state.ElectionInstance.methods
          .voterDetails(voterAddress)
          .call();
        this.state.voters.push({
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        });
      }
      this.setState({ voters: this.state.voters });

      // Loading current voters
      const voter = await this.state.ElectionInstance.methods
        .voterDetails(this.state.account)
        .call();
      this.setState({
        currentVoter: {
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        },
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Échec du chargement de Web3, des comptes ou du contrat. Vérifiez la console pour plus de détails (f12).`
      );
    }
  };
  updateVoterName = (event) => {
    this.setState({ voterName: event.target.value });
  };
  updateVoterPhone = (event) => {
    this.setState({ voterPhone: event.target.value });
  };
  registerAsVoter = async () => {
    await this.state.ElectionInstance.methods
      .registerAsVoter(this.state.voterName, this.state.voterPhone)
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };
  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>Chargement de Web3, des comptes et du contrat...</center>
        </>
      );
    }
    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        {!this.state.isElStarted && !this.state.isElEnded ? (
          <NotInit />
        ) : (
          <>
            <div className="container-item info">
              <p>Nombre total d'électeurs inscrits: {this.state.voters.length}</p>
            </div>
            <div className="container-main">
              <h3>Inscription</h3>
              <small>Inscrivez-vous pour voter.</small>
              <div className="container-item">
                <form>
                  <div className="div-li">
                    <label className={"label-r"}>
                    Adresse du compte
                      <input
                        className={"input-r"}
                        type="text"
                        value={this.state.account}
                        style={{ width: "400px" }}
                      />{" "}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={"label-r"}>
                      Nom
                      <input
                        className={"input-r"}
                        type="text"
                        placeholder="exemple : John"
                        value={this.state.voterName}
                        onChange={this.updateVoterName}
                      />{" "}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={"label-r"}>
                      Téléphone <span style={{ color: "tomato" }}>*</span>
                      <input
                        className={"input-r"}
                        type="number"
                        placeholder="exemple : 0767549865"
                        value={this.state.voterPhone}
                        onChange={this.updateVoterPhone}
                      />
                    </label>
                  </div>
                  <p className="note">
                    <span style={{ color: "tomato" }}> Note: </span>
                    <br />Assurez-vous que l'adresse de votre compte et votre numéro de téléphone sont corrects. <br /> L'administrateur peut ne pas approuver votre compte si le numéro de téléphone fourni ne correspond pas à l'adresse du compte enregistré dans le catalogue des administrateurs.
                  </p>
                  <button
                    className="btn-add"
                    disabled={
                      this.state.voterPhone.length !== 10 ||
                      this.state.currentVoter.isVerified
                    }
                    onClick={this.registerAsVoter}
                  >
                    {this.state.currentVoter.isRegistered
                      ? "Mise à jour"
                      : "S'inscrire"}
                  </button>
                </form>
              </div>
            </div>
            <div
              className="container-main"
              style={{
                borderTop: this.state.currentVoter.isRegistered
                  ? null
                  : "1px solid",
              }}
            >
              {loadCurrentVoter(
                this.state.currentVoter,
                this.state.currentVoter.isRegistered
              )}
            </div>
            {this.state.isAdmin ? (
              <div
                className="container-main"
                style={{ borderTop: "1px solid" }}
              >
                <small>Nombre total d'électeurs: {this.state.voters.length}</small>
                {loadAllVoters(this.state.voters)}
              </div>
            ) : null}
          </>
        )}
      </>
    );
  }
}
export function loadCurrentVoter(voter, isRegistered) {
  return (
    <>
      <div
        className={"container-item " + (isRegistered ? "success" : "attention")}
      >
        <center>Vos informations enregistrées</center>
      </div>
      <div
        className={"container-list " + (isRegistered ? "success" : "attention")}
      >
        <table>
          <tr>
            <th>Adresse du compte</th>
            <td>{voter.address}</td>
          </tr>
          <tr>
            <th>NOM</th>
            <td>{voter.name}</td>
          </tr>
          <tr>
            <th>Téléphone</th>
            <td>{voter.phone}</td>
          </tr>
          <tr>
            <th>Voté</th>
            <td>{voter.hasVoted ? "Vrai" : "Faux"}</td>
          </tr>
          <tr>
            <th>Vérification</th>
            <td>{voter.isVerified ? "Vrai" : "Faux"}</td>
          </tr>
          <tr>
            <th>Inscrit(e)</th>
            <td>{voter.isRegistered ? "Vrai" : "Faux"}</td>
          </tr>
        </table>
      </div>
    </>
  );
}
export function loadAllVoters(voters) {
  const renderAllVoters = (voter) => {
    return (
      <>
        <div className="container-list success">
          <table>
            <tr>
              <th>Adresse du compte</th>
              <td>{voter.address}</td>
            </tr>
            <tr>
              <th>Nom</th>
              <td>{voter.name}</td>
            </tr>
            <tr>
              <th>Téléphone</th>
              <td>{voter.phone}</td>
            </tr>
            <tr>
              <th>Voté</th>
              <td>{voter.hasVoted ? "Vrai" : "Faux"}</td>
            </tr>
            <tr>
              <th>Vérifié</th>
              <td>{voter.isVerified ? "Vrai" : "Faux"}</td>
            </tr>
            <tr>
              <th>Inscrit(e)</th>
              <td>{voter.isRegistered ? "Vrai" : "Faux"}</td>
            </tr>
          </table>
        </div>
      </>
    );
  };
  return (
    <>
      <div className="container-item success">
        <center>Liste des électeurs</center>
      </div>
      {voters.map(renderAllVoters)}
    </>
  );
}
