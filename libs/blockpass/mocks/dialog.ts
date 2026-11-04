//
// A plain-DOM stand-in for the Blockpass KYC widget, used by the
// development and devlive builds of this package. It mimics the
// real widget's overlay so we can exercise the client status flow
// without React or the actual Blockpass script.
//

export type MockKycFields = {
  givenName: string;
  familyName: string;
  dob: string;
  street: string;
  city: string;
  country: string;
  outcome: "approved" | "rejected";
};

export type MockKycResult = MockKycFields | null;

const field = (name: string, label: string, type = "text", value = "") =>
  `<label style="display:block;margin-bottom:8px;font-size:14px">
     ${label}
     <input name="${name}" type="${type}" value="${value}"
       style="display:block;width:100%;box-sizing:border-box;padding:6px;margin-top:2px" />
   </label>`;

export function openMockKycDialog(onSubmit: (fields: MockKycFields) => void, onCancel: () => void) {
  // Prevent duplicates if the button is clicked repeatedly
  if (document.getElementById("mock-kyc-dialog")) return;

  const dialog = document.createElement("dialog");
  dialog.id = "mock-kyc-dialog";
  dialog.style.cssText = "border:1px solid #ccc;border-radius:8px;padding:20px;min-width:320px";
  dialog.innerHTML = `
    <form id="mock-kyc-form">
      <h3 style="margin-top:0">Mock KYC (development)</h3>
      ${field("givenName", "Given Name")}
      ${field("familyName", "Family Name")}
      ${field("dob", "Date of Birth (MM/DD/YYYY)", "text", "01/01/1990")}
      ${field("street", "Street Address")}
      ${field("city", "City")}
      ${field("country", "Country")}
      <label style="display:block;margin-bottom:12px;font-size:14px">
        Review Outcome
        <select name="outcome" style="display:block;width:100%;padding:6px;margin-top:2px">
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button type="button" id="mock-kyc-cancel">Cancel</button>
        <button type="submit">Complete</button>
      </div>
    </form>`;

  dialog.addEventListener("close", () => dialog.remove());
  dialog.addEventListener("cancel", () => onCancel()); // Esc key

  const form = dialog.querySelector<HTMLFormElement>("#mock-kyc-form")!;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const fields = {
      givenName: String(data.get("givenName")),
      familyName: String(data.get("familyName")),
      dob: String(data.get("dob")),
      street: String(data.get("street")),
      city: String(data.get("city")),
      country: String(data.get("country")),
      outcome: data.get("outcome") as MockKycFields["outcome"],
    };
    dialog.close();
    onSubmit(fields);
  });

  dialog.querySelector("#mock-kyc-cancel")!.addEventListener("click", () => {
    dialog.close();
    onCancel();
  });

  document.body.appendChild(dialog);
  dialog.showModal();
}
