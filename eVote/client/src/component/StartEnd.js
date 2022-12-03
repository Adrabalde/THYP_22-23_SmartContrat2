import React from "react";
import { Link } from "react-router-dom";

const StartEnd = (props) => {
  const btn = {
    display: "block",
    padding: "21px",
    margin: "7px",
    minWidth: "max-content",
    textAlign: "center",
    width: "333px",
    alignSelf: "center",
  };
  return (
    <div
      className="container-main"
      style={{ borderTop: "1px solid", marginTop: "0px" }}
    >
      {!props.elStarted ? (
        <>
          {/* edit here to display start election Again button */}
          {!props.elEnded ? (
            <>
              <div
                className="container-item attention"
                style={{ display: "block" }}
              >
                <h2>N'oubliez pas d'ajouter des candidats.</h2>
                <p>
                Aller à{" "}
                  <Link
                    title="Add a new "
                    to="/addCandidate"
                    style={{
                      color: "black",
                      textDecoration: "underline",
                    }}
                  >
                    Ajouter des candidats
                  </Link>{" "}
                  page.
                </p>
              </div>
              <div className="container-item">
                <button type="submit" style={btn}>
                Commencer l'élection {props.elEnded ? "Again" : null}
                </button>
              </div>
            </>
          ) : (
            <div className="container-item">
              <center>
                <p>Redéployer le contrat pour recommencer l'élection.</p>
              </center>
            </div>
          )}
          {props.elEnded ? (
            <div className="container-item">
              <center>
                <p>L'élection s'est terminée.</p>
              </center>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="container-item">
            <center>
              <p>L'élection a commencé.</p>
            </center>
          </div>
          <div className="container-item">
            <button
              type="button"
              // onClick={this.endElection}
              onClick={props.endElFn}
              style={btn}
            >
             Fin
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StartEnd;
