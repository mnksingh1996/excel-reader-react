import React from "react";

function popup(props) {
  return (
    <form className="popup" onSubmit={props.onSubmit}>
      <div>
        <h1>Please state the reason for rejection</h1>

        <textarea rows="3"></textarea>

        <div className="cta">
          <button className="btn danger" type="submit">
            Confirm Reject
          </button>

          <button
            type="button"
            className="btn cancel"
            onClick={props.closePopup}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default popup;
