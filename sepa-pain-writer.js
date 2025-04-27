document.getElementById('sepaForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const ns = "urn:iso:std:iso:20022:tech:xsd:pain.001.001.03";
  const now = new Date().toISOString();

  const tx = {
    MsgId: document.getElementById('msgId').value,
    CreationDate: now,
    ExecutionDate: now.split('T')[0],
    DebtorName: document.getElementById('debtorName').value,
    DebtorIBAN: document.getElementById('debtorIban').value,
    CreditorName: document.getElementById('creditorName').value,
    CreditorIBAN: document.getElementById('creditorIban').value,
    CreditorCountry: document.getElementById('creditorCountry').value,
    CreditorAdrLine1: document.getElementById('creditorAdrLine1').value,
    CreditorAdrLine2: document.getElementById('creditorAdrLine2').value,
    Amount: document.getElementById('amount').value,
    Currency: "EUR",
    Reference: document.getElementById('paymentRef').value,
    RemittanceInfo: document.getElementById('remittanceInfo').value
  };

  const xml = [
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
    `      <PmtInfId>GeneratedTx</PmtInfId>`,
    `      <PmtMtd>TRF</PmtMtd>`,
    `      <ReqdExctnDt>${tx.ExecutionDate}</ReqdExctnDt>`,
    `      <Dbtr><Nm>${tx.DebtorName}</Nm></Dbtr>`,
    `      <DbtrAcct><Id><IBAN>${tx.DebtorIBAN}</IBAN></Id><Ccy>${tx.Currency}</Ccy></DbtrAcct>`,
    `      <CdtTrfTxInf>`,
    `        <PmtId><EndToEndId>SEPA-FORM</EndToEndId></PmtId>`,
    `        <Amt><InstdAmt Ccy="${tx.Currency}">${tx.Amount}</InstdAmt></Amt>`,
    `        <CdtrAgt><FinInstnId><BIC>BSLJSI2X</BIC></FinInstnId></CdtrAgt>`,
    `        <Cdtr>`,
    `          <Nm>${tx.CreditorName}</Nm>`,
    `          <PstlAdr>`,
    `            <Ctry>${tx.CreditorCountry}</Ctry>`,
    `            <AdrLine>${tx.CreditorAdrLine1}</AdrLine>`,
    `            <AdrLine>${tx.CreditorAdrLine2}</AdrLine>`,
    `          </PstlAdr>`,
    `        </Cdtr>`,
    `        <CdtrAcct><Id><IBAN>${tx.CreditorIBAN}</IBAN></Id></CdtrAcct>`,
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
  ].join("\n");

  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'generated-sepa-payment.xml';
  a.click();
  URL.revokeObjectURL(url);
});

