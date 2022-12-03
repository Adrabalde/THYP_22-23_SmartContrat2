import React, { Component } from "react";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";

import AdminOnly from "../../AdminOnly";

import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";

import "./Verification.css";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      voterCount: undefined,
      voters: [],
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
      this.setState({ web3, ElectionInstance: instance, account: accounts[0] });

      // Total number of candidates
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });

      // Admin account and verification
      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }
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
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Échec du chargement de Web3, des comptes ou du contrat. Vérifiez la console pour plus de détails.`
      );
      console.error(error);
    }
  };
  renderUnverifiedVoters = (voter) => {
    const verifyVoter = async (verifiedStatus, address) => {
      await this.state.ElectionInstance.methods
        .verifyVoter(verifiedStatus, address)
        .send({ from: this.state.account, gas: 1000000 });
      window.location.reload();
    };
    return (
      <>
        {voter.isVerified ? (
          <div className="container-list success">
            <p style={{ margin: "7px 0px" }}>AC: {voter.address}</p>
            <table>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Voté</th>
              </tr>
              <tr>
                <td>{voter.name}</td>
                <td>{voter.phone}</td>
                <td>{voter.hasVoted ? "Vrai" : "Faux"}</td>
              </tr>
            </table>
          </div>
        ) : null}
        <div
          className="container-list attention"
          style={{ display: voter.isVerified ? "none" : null }}
        >
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
          <div style={{}}>
            <button
              className="btn-verification approve"
              disabled={voter.isVerified}
              onClick={() => verifyVoter(true, voter.address)}
            >
             Approuver
            </button>
          </div>
        </div>
      </>
    );
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
    if (!this.state.isAdmin) {
      return (
        <>
          <Navbar />
          <AdminOnly page="Verification Page." />
        </>
      );
    }
    return (
      <>
        <NavbarAdmin />
        <div className="container-main">
          <h3>Vérification</h3>
          <small>Nombre total d'électeurs: {this.state.voters.length}</small>
          {this.state.voters.length < 1 ? (
            <div className="container-item info">Aucun n'est encore inscrit.</div>
          ) : (
            <>
              <div className="container-item info">
                <center>Liste des électeurs inscrits</center>
              </div>
              {this.state.voters.map(this.renderUnverifiedVoters)}
            </>
          )}
        </div>
      </>
    );
  }
}
