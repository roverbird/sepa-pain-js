let transactions = [];
let fullXmlDoc = null;
const ns = "urn:iso:std:iso:20022:tech:xsd:pain.001.001.03";

function escapeCSV(value) {
  if (typeof value !== 'string') value = String(value);
  return `"${value.replace(/"/g, '""')}"`;
}

function generateCSV(data) {
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row => headers.map(field => escapeCSV(row[field])).join(","))
  ];
  return csvRows.join("\n");
}

function downloadCSV() {
  const csv = generateCSV(transactions);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sepa-transactions.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function getText(node, tag) {
  return node?.getElementsByTagNameNS(ns, tag)?.[0]?.textContent || "";
}

function downloadXml() {
  const selectedIndex = document.querySelector('input[name="txSelect"]:checked')?.value;
  if (selectedIndex === undefined) return alert("Select one transaction first.");

  const txIndex = Number(selectedIndex);
  const originalDoc = fullXmlDoc.cloneNode(true);
  const pmtInfs = originalDoc.getElementsByTagNameNS(ns, "PmtInf");

  // Remove all PmtInf elements
  Array.from(pmtInfs).forEach(el => el.parentNode.removeChild(el));

  // Append selected transaction's PmtInf
  const originalPmtInf = fullXmlDoc.getElementsByTagNameNS(ns, "PmtInf")[txIndex];
  const cleanedPmtInf = originalPmtInf.cloneNode(true);

  // Filter out all but the selected CdtTrfTxInf
  const txs = cleanedPmtInf.getElementsByTagNameNS(ns, "CdtTrfTxInf");
  Array.from(txs).forEach((el, i) => {
    if (i !== 0) el.parentNode.removeChild(el); // Keep only first transaction in that block
  });

  // Update counts in GrpHdr
  const grpHdr = originalDoc.getElementsByTagNameNS(ns, "GrpHdr")[0];
  const ctrlSum = cleanedPmtInf.getElementsByTagNameNS(ns, "InstdAmt")[0]?.textContent || "0.00";
  grpHdr.getElementsByTagNameNS(ns, "NbOfTxs")[0].textContent = "1";
  grpHdr.getElementsByTagNameNS(ns, "CtrlSum")[0].textContent = ctrlSum;

  originalDoc.getElementsByTagNameNS(ns, "CstmrCdtTrfInitn")[0].appendChild(cleanedPmtInf);

  const serializer = new XMLSerializer();
  const xmlStr = serializer.serializeToString(originalDoc);
  const blob = new Blob([xmlStr], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sepa-single-transaction.xml';
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('xmlFile').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const xml = e.target.result;
    const parser = new DOMParser();
    fullXmlDoc = parser.parseFromString(xml, "application/xml");

    const hdr = fullXmlDoc.getElementsByTagNameNS(ns, "GrpHdr")[0];
    const msgId = getText(hdr, "MsgId");
    const creDtTm = getText(hdr, "CreDtTm");

    transactions = [];
    const pmtInfs = fullXmlDoc.getElementsByTagNameNS(ns, "PmtInf");

    Array.from(pmtInfs).forEach(pmtInf => {
      const executionDate = getText(pmtInf, "ReqdExctnDt");
      const debtorName = getText(pmtInf.getElementsByTagNameNS(ns, "Dbtr")[0], "Nm");
      const debtorIBAN = getText(pmtInf.getElementsByTagNameNS(ns, "DbtrAcct")[0], "IBAN");

      const txs = pmtInf.getElementsByTagNameNS(ns, "CdtTrfTxInf");

      Array.from(txs).forEach(tx => {
        const cdtr = tx.getElementsByTagNameNS(ns, "Cdtr")[0];
        const cdtrAddr = cdtr?.getElementsByTagNameNS(ns, "PstlAdr")[0];
        const addrLines = cdtrAddr ? Array.from(cdtrAddr.getElementsByTagNameNS(ns, "AdrLine")).map(n => n.textContent) : [];

        transactions.push({
          MsgId: msgId,
          CreationDate: creDtTm,
          ExecutionDate: executionDate,
          DebtorName: debtorName,
          DebtorIBAN: debtorIBAN,
          CreditorName: getText(cdtr, "Nm"),
          CreditorIBAN: getText(tx.getElementsByTagNameNS(ns, "CdtrAcct")[0], "IBAN"),
          Amount: getText(tx.getElementsByTagNameNS(ns, "Amt")[0], "InstdAmt"),
          Currency: tx.getElementsByTagNameNS(ns, "InstdAmt")[0]?.getAttribute("Ccy") || "EUR",
          Reference: getText(tx.getElementsByTagNameNS(ns, "CdtrRefInf")[0], "Ref"),
          RemittanceInfo: getText(tx.getElementsByTagNameNS(ns, "RmtInf")[0], "AddtlRmtInf"),
          CreditorCountry: cdtrAddr?.getElementsByTagNameNS(ns, "Ctry")[0]?.textContent || "",
          CreditorAdrLine1: addrLines[0] || "",
          CreditorAdrLine2: addrLines[1] || ""
        });
      });
    });

    // Display table
    let html = `<table><thead><tr><th></th>`;
    for (const key in transactions[0]) html += `<th>${key}</th>`;
    html += `</tr></thead><tbody>`;
    transactions.forEach((tx, i) => {
      html += `<tr><td><input type="radio" name="txSelect" value="${i}"></td>`;
      html += Object.values(tx).map(val => `<td>${val}</td>`).join('');
      html += `</tr>`;
    });
    html += `</tbody></table>`;

    document.getElementById('output').innerHTML = html;
    document.getElementById('downloadBtn').style.display = "inline-block";
    document.getElementById('downloadXmlBtn').style.display = "inline-block";
  };

  reader.readAsText(file);
});

document.getElementById('downloadBtn').addEventListener('click', downloadCSV);
document.getElementById('downloadXmlBtn').addEventListener('click', downloadXml);
