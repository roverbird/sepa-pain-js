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
  if (transactions.length === 0) return alert("No transactions to download.");
  const csv = generateCSV(transactions);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sepa-transactions.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function getText(parent, tag) {
  return parent?.getElementsByTagNameNS(ns, tag)[0]?.textContent || " ";
}

function buildXmlForTransaction(index) {
  const tx = transactions[index];
  const xmlParts = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<Document xmlns="${ns}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${ns} ./pain.001.001.03.xsd">`,
    `  <CstmrCdtTrfInitn>`,
    `    <GrpHdr>`,
    `      <MsgId>${tx.MsgId}</MsgId>`,
    `      <CreDtTm>${tx.CreationDate}</CreDtTm>`,
    `      <NbOfTxs>1</NbOfTxs>`,
    `      <CtrlSum>${tx.Amount}</CtrlSum>`,
    `      <InitgPty><Nm>${tx.DebtorName}</Nm></InitgPty>`,
    `    </GrpHdr>`,
    `    <PmtInf>`,
    `      <PmtInfId>SingleTx</PmtInfId>`,
    `      <PmtMtd>TRF</PmtMtd>`,
    `      <ReqdExctnDt>${tx.ExecutionDate}</ReqdExctnDt>`,
    `      <Dbtr><Nm>${tx.DebtorName}</Nm></Dbtr>`,
    `      <DbtrAcct><Id><IBAN>${tx.DebtorIBAN}</IBAN></Id><Ccy>${tx.Currency}</Ccy></DbtrAcct>`,
    `      <PmtTpInf>`,
    `        <SvcLvl><Cd>${tx.ServiceLevelCode}</Cd></SvcLvl>`,
    `        <LclInstrm><Prtry>${tx.LocalInstrumentProprietary}</Prtry></LclInstrm>`,
    `        <CtgyPurp><Cd>${tx.CategoryPurpose}</Cd></CtgyPurp>`,
    `      </PmtTpInf>`,
    `      <CdtTrfTxInf>`,
    `        <PmtId><EndToEndId>SEPA-SINGLE</EndToEndId></PmtId>`,
    `        <Amt><InstdAmt Ccy="${tx.Currency}">${tx.Amount}</InstdAmt></Amt>`,
    `        <CdtrAgt><FinInstnId><BIC>${tx.CreditorBIC}</BIC></FinInstnId></CdtrAgt>`,
    `        <Cdtr>`,
    `          <Nm>${tx.CreditorName}</Nm>`,
    `          <PstlAdr>`,
    `            <Ctry>${tx.CreditorCountry}</Ctry>`,
    `            <AdrLine>${tx.CreditorAdrLine1}</AdrLine>`,
    `            <AdrLine>${tx.CreditorAdrLine2}</AdrLine>`,
    `          </PstlAdr>`,
    `        </Cdtr>`,
    `        <CdtrAcct><Id><IBAN>${tx.CreditorIBAN}</IBAN></Id></CdtrAcct>`,
    `        <ChrgBr>${tx.ChargeBearer}</ChrgBr>`,
    `        <RmtInf>`,
    `          <Strd>`,
    `            <CdtrRefInf>`,
    `              <Tp><CdOrPrtry><Cd>SCOR</Cd></CdOrPrtry></Tp>`,
    `              <Ref>${tx.Reference}</Ref>`,
    `            </CdtrRefInf>`,
    `            <AddtlRmtInf>${tx.RemittanceInfo}</AddtlRmtInf>`,
    `          </Strd>`,
    `        </RmtInf>`,
    `      </CdtTrfTxInf>`,
    `    </PmtInf>`,
    `  </CstmrCdtTrfInitn>`,
    `</Document>`
  ];
  return xmlParts.join("\n");
}

function downloadXml() {
  const selectedIndex = document.querySelector('input[name="txSelect"]:checked')?.value;
  if (selectedIndex === undefined) return alert("Select one transaction first.");
  const xml = buildXmlForTransaction(Number(selectedIndex));
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sepa-transaction.xml';
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

      const pmtTpInf = pmtInf.getElementsByTagNameNS(ns, "PmtTpInf")[0];
      const serviceLevelCode = getText(pmtTpInf?.getElementsByTagNameNS(ns, "SvcLvl")[0], "Cd");
      const localInstrumentProprietary = getText(pmtTpInf?.getElementsByTagNameNS(ns, "LclInstrm")[0], "Prtry");
      const categoryPurpose = getText(pmtTpInf?.getElementsByTagNameNS(ns, "CtgyPurp")[0], "Cd");

      const txs = pmtInf.getElementsByTagNameNS(ns, "CdtTrfTxInf");

      Array.from(txs).forEach(tx => {
        const cdtr = tx.getElementsByTagNameNS(ns, "Cdtr")[0];
        const cdtrAddr = cdtr?.getElementsByTagNameNS(ns, "PstlAdr")[0];
        const addrLines = cdtrAddr
          ? Array.from(cdtrAddr.getElementsByTagNameNS(ns, "AdrLine")).map(n => n.textContent)
          : [];

        const cdtrAgt = tx.getElementsByTagNameNS(ns, "CdtrAgt")[0];
        const bic = getText(cdtrAgt?.getElementsByTagNameNS(ns, "FinInstnId")[0], "BIC");

        transactions.push({
          MsgId: msgId,
          CreationDate: creDtTm,
          ExecutionDate: executionDate,
          DebtorName: debtorName,
          DebtorIBAN: debtorIBAN,
          ServiceLevelCode: serviceLevelCode,
          LocalInstrumentProprietary: localInstrumentProprietary,
          CategoryPurpose: categoryPurpose,
          CreditorName: getText(cdtr, "Nm"),
          CreditorIBAN: getText(tx.getElementsByTagNameNS(ns, "CdtrAcct")[0], "IBAN"),
          Amount: getText(tx.getElementsByTagNameNS(ns, "Amt")[0], "InstdAmt"),
          Currency: tx.getElementsByTagNameNS(ns, "InstdAmt")[0]?.getAttribute("Ccy") || "EUR",
          Reference: getText(tx.getElementsByTagNameNS(ns, "CdtrRefInf")[0], "Ref"),
          RemittanceInfo: getText(tx.getElementsByTagNameNS(ns, "RmtInf")[0], "AddtlRmtInf"),
          CreditorCountry: cdtrAddr?.getElementsByTagNameNS(ns, "Ctry")[0]?.textContent || " ",
          CreditorAdrLine1: addrLines[0] || "",
          CreditorAdrLine2: addrLines[1] || "",
          CreditorBIC: bic,
          ChargeBearer: getText(tx, "ChrgBr")
        });
      });
    });

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

