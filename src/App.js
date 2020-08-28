import React, { Component } from "react";

import XLSX from "xlsx";

import Popup from "./components/popup";

import { make_cols } from "./utility/MakeColumns";
import { SheetJSFT } from "./utility/types";

import "./App.scss";

class App extends Component {
  state = {
    file: {},
    data: [],
    cols: [],
    headers: [],
    show_popup: false,
    current_earning_id: null,
  };

  handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0])
      this.setState({ file: files[0] }, () => this.handleFile());
  };

  handleFile = () => {
    /* Boilerplate to set up FileReader */
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onload = (e) => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, {
        type: rABS ? "binary" : "array",
        bookVBA: true,
      });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws);
      /* Update state */
      this.setState(
        {
          data: data.map((el) => ({ ...el, approved: null, selected: false })),
          headers: Object.keys(data[0]), // get column headings from excel row
          cols: make_cols(ws["!ref"]),
        },
        () => console.log(this.state.data)
      );
    };

    if (rABS) {
      reader.readAsBinaryString(this.state.file);
    } else {
      reader.readAsArrayBuffer(this.state.file);
    }
  };

  approveSelected = () => {
    const data = this.state.data.map((el) => ({
      ...el,
      approved: el.selected ? true : el.approved,
      selected: false,
    }));

    this.setState({ data }, () => console.log(this.state.data));
  };

  onConfirmReject = (e) => {
    e.preventDefault();

    const data = this.state.data.map((el) =>
      el.earning_id === this.state.current_earning_id
        ? { ...el, approved: false }
        : el
    );

    this.setState({ data, show_popup: false });
  };

  render() {
    const { headers, data, show_popup, current_earning_id } = this.state;

    return (
      <>
        <header>
          <label htmlFor="file">Upload excel to load profiles</label>
          <input
            type="file"
            className="file"
            id="file"
            accept={SheetJSFT}
            onChange={this.handleChange}
          />
        </header>
        {show_popup ? (
          <Popup
            closePopup={() => this.setState({ show_popup: false })}
            current_earning_id={current_earning_id}
            onSubmit={this.onConfirmReject}
          />
        ) : null}
        <main>
          {data.length ? (
            <table>
              <thead>
                <tr>
                  <th>
                    <button
                      onClick={this.approveSelected}
                      className="btn primary"
                    >
                      Approve selected
                    </button>
                  </th>
                  {headers.map((header) => (
                    <th key={header}>{header.split("_").join(" ")}</th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={() =>
                          this.setState({
                            data: data.map((el) =>
                              el.earning_id === row.earning_id
                                ? { ...el, selected: !el.selected }
                                : el
                            ),
                          })
                        }
                      />
                    </td>
                    {headers.map((header) => (
                      <td key={header}>{row[header]}</td>
                    ))}

                    {row.approved === null ? (
                      <td>
                        <button
                          className="btn primary"
                          onClick={() =>
                            this.setState({
                              data: data.map((el) =>
                                el.earning_id === row.earning_id
                                  ? { ...el, approved: true }
                                  : el
                              ),
                            })
                          }
                        >
                          Approve
                        </button>
                        <span>|</span>
                        <button
                          onClick={() =>
                            this.setState({
                              show_popup: true,
                              current_earning_id: row.earning_id,
                            })
                          }
                          className="btn danger"
                        >
                          Reject
                        </button>
                      </td>
                    ) : (
                      <td>
                        {row.approved ? (
                          <button className="btn primary inverted">
                            Approved
                          </button>
                        ) : (
                          <button className="btn primary inverted">
                            Rejected
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </main>
      </>
    );
  }
}

export default App;
