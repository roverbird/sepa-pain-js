document.addEventListener("DOMContentLoaded", function () {
  const ns = "urn:iso:std:iso:20022:tech:xsd:pain.001.001.03";
  const paymentsContainer = document.getElementById("paymentsContainer");
  const addPaymentBtn = document.getElementById("addPaymentBtn");
  const msgIdInput = document.getElementById("msgId");

  let paymentCount = 0;

  function generateDefaultMsgId() {
    const now = new Date().toISOString();
    const sequence = "0001";
    return `${now.slice(0, -1)}/${sequence}`;
  }

  msgIdInput.value = generateDefaultMsgId();

  function createPaymentBlock(cloneFrom = null) {
    paymentCount++;
    const template = document.getElementById('payment-block-template');
    const clone = template.content.cloneNode(true);
    const div = clone.querySelector('.payment-block');
    div.querySelector('.tag').textContent = `Payment ${paymentCount}`;
    paymentsContainer.appendChild(div);

    if (cloneFrom) {
      const newInputs = div.querySelectorAll('input');
      const sourceInputs = cloneFrom.querySelectorAll('input');
      newInputs.forEach((input, i) => {
        if (sourceInputs[i]) input.value = sourceInputs[i].value;
      });
    }

    div.querySelector('.remove-payment-btn').addEventListener('click', () => {
      if (paymentsContainer.querySelectorAll('.payment-block').length > 1) {
        div.remove();
      } else {
        alert("At least one payment is required.");
      }
    });
  }

  // Initial payment block
  createPaymentBlock();

  // Add new block on button click
  addPaymentBtn.addEventListener("click", () => {
    const blocks = paymentsContainer.querySelectorAll('.payment-block');
    const lastBlock = blocks[blocks.length - 1];
    createPaymentBlock(lastBlock);
  });

  document.getElementById("sepaForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const now = new Date().toISOString();
    const msgId = msgIdInput.value;

    // Debtor fields (also postal address and BIC)
    const debtorName = document.getElementById("debtorName").value;
    const debtorIban = document.getElementById("debtorIban").value;
    const debtorCountry = document.getElementById("debtorCountry").value;
    const debtorAdrLine1 = document.getElementById("debtorAdrLine1").value;
    const debtorAdrLine2 = document.getElementById("debtorAdrLine2").value;
    const debtorBic = document.getElementById("debtorBic").value;
    const debtorOrgId = document.getElementById("debtorOrgId").value;

    const serviceLevelCode = "SEPA";
    const localInstrumentProprietary = "SEPA";
    const chargeBearer = "SLEV";


    const payments = Array.from(document.querySelectorAll(".payment-block")).map(block => ({
      CreditorName: block.querySelector('[name="creditorName"]').value,
      CreditorIBAN: block.querySelector('[name="creditorIban"]').value,
      CreditorBIC: block.querySelector('[name="creditorBic"]').value,
      CreditorCountry: block.querySelector('[name="creditorCountry"]').value,
      CreditorAdrLine1: block.querySelector('[name="creditorAdrLine1"]').value,
      CreditorAdrLine2: block.querySelector('[name="creditorAdrLine2"]').value,
      Amount: block.querySelector('[name="amount"]').value,
      Reference: block.querySelector('[name="paymentRef"]').value,
      RemittanceInfo: block.querySelector('[name="remittanceInfo"]').value,
      InstructionPriority: block.querySelector('[name="instructionPriority"]').value || "NORM",
      PurposeCode: block.querySelector('[name="purposeCode"]').value || "INTX"
    }));

    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.Amount), 0).toFixed(2);

    const xmlParts = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<Document xmlns="${ns}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${ns} ./pain.001.001.03.xsd">`,
      `  <CstmrCdtTrfInitn>`,
      `    <GrpHdr>`,
      `      <MsgId>${msgId}</MsgId>`,
      `      <CreDtTm>${now}</CreDtTm>`,
      `      <NbOfTxs>${payments.length}</NbOfTxs>`,
      `      <CtrlSum>${totalAmount}</CtrlSum>`,
      `      <InitgPty>`,
      `        <Nm>${debtorName}</Nm>`,
      `        <Id>`,
      `          <OrgId>`,
      `            <Othr>`,
      `              <Id>${debtorOrgId}</Id>`,
      `              <SchmeNm><Cd>TXID</Cd></SchmeNm>`,
      `            </Othr>`,
      `          </OrgId>`,
      `        </Id>`,
      `      </InitgPty>`,
      `    </GrpHdr>`,
      `    <PmtInf>`,
      `      <PmtInfId>GeneratedBatch</PmtInfId>`,
      `      <PmtMtd>TRF</PmtMtd>`,
      `      <ReqdExctnDt>${now.split('T')[0]}</ReqdExctnDt>`,
      `      <Dbtr>`,
      `        <Nm>${debtorName}</Nm>`,
      `        <PstlAdr>`,
      `          <Ctry>${debtorCountry}</Ctry>`,
      `          <AdrLine>${debtorAdrLine1}</AdrLine>`,
      `          <AdrLine>${debtorAdrLine2}</AdrLine>`,
      `        </PstlAdr>`,
      `      </Dbtr>`,
      `      <DbtrAcct>`,
      `        <Id><IBAN>${debtorIban}</IBAN></Id>`,
      `        <Ccy>EUR</Ccy>`,
      `      </DbtrAcct>`,
      `      <DbtrAgt>`,
      `        <FinInstnId><BIC>${debtorBic}</BIC></FinInstnId>`,
      `      </DbtrAgt>`
    ];

    payments.forEach((tx, i) => {
      xmlParts.push(
        `      <CdtTrfTxInf>`,
        `        <PmtId><EndToEndId>SEPA-${i + 1}</EndToEndId></PmtId>`,
        `        <PmtTpInf>`,
        `          <InstrPrty>${tx.InstructionPriority}</InstrPrty>`,
        `          <SvcLvl><Cd>${tx.ServiceLevelCode}</Cd></SvcLvl>`,
        `          <LclInstrm><Prtry>${tx.LocalInstrumentProprietary}</Prtry></LclInstrm>`,
        `        </PmtTpInf>`,
        `        <Amt><InstdAmt Ccy="EUR">${tx.Amount}</InstdAmt></Amt>`,
        `        <ChrgBr>${tx.ChargeBearer}</ChrgBr>`,
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
        `        <Purp><Cd>${tx.PurposeCode}</Cd></Purp>`,
        `        <RmtInf>`,
        `          <Strd>`,
        `            <CdtrRefInf>`,
        `              <Tp><CdOrPrtry><Cd>SCOR</Cd></CdOrPrtry></Tp>`,
        `              <Ref>${tx.Reference}</Ref>`,
        `            </CdtrRefInf>`,
        `            <AddtlRmtInf>${tx.RemittanceInfo}</AddtlRmtInf>`,
        `          </Strd>`,
        `        </RmtInf>`,
        `      </CdtTrfTxInf>`
      );
    });

    xmlParts.push(
      `    </PmtInf>`,
      `  </CstmrCdtTrfInitn>`,
      `</Document>`
    );

    const xml = xmlParts.join("\n");
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sepa-batch-payment.xml';
    a.click();
    URL.revokeObjectURL(url);
  });
});


