document.addEventListener("DOMContentLoaded", function () {
  const ns = "urn:iso:std:iso:20022:tech:xsd:pain.001.001.03";
  const now = new Date().toISOString();
  const paymentsContainer = document.getElementById("paymentsContainer");
  const addPaymentBtn = document.getElementById("addPaymentBtn");

  let paymentCount = 0;

  function createPaymentBlock(cloneFrom = null) {
    paymentCount++;
    const div = document.createElement("div");
    div.className = "box payment-block mb-4";
    div.innerHTML = `
      <div class="is-flex is-justify-content-space-between mb-2">
        <span class="tag is-info is-large">Payment ${paymentCount}</span>
        <button type="button" class="button is-danger remove-payment-btn">X Remove</button>
      </div>

      <div class="field">
        <label class="label">Creditor Name</label>
        <div class="control">
          <input class="input" name="creditorName" required>
        </div>
      </div>

      <div class="field">
        <label class="label">Creditor IBAN</label>
        <div class="control">
          <input class="input" name="creditorIban" required>
        </div>
      </div>

      <div class="field">
        <label class="label">Creditor Country</label>
        <div class="control">
          <input class="input" name="creditorCountry" value="SI" required>
        </div>
      </div>

      <div class="field">
        <label class="label">Creditor Address Line 1</label>
        <div class="control">
          <input class="input" name="creditorAdrLine1" required>
        </div>
      </div>

      <div class="field">
        <label class="label">Creditor Address Line 2</label>
        <div class="control">
          <input class="input" name="creditorAdrLine2" required>
        </div>
      </div>

      <div class="field">
        <label class="label">Amount (EUR)</label>
        <div class="control">
          <input class="input" type="number" step="0.01" name="amount" required>
        </div>
      </div>

      <div class="field">
        <label class="label">Payment Reference</label>
        <div class="control">
          <input class="input" name="paymentRef" required>
        </div>
      </div>

      <div class="field">
        <label class="label">Remittance Info</label>
        <div class="control">
          <input class="input" name="remittanceInfo" required>
        </div>
      </div>
    `;
    paymentsContainer.appendChild(div);

    // Clone values if requested
    if (cloneFrom) {
      const inputs = div.querySelectorAll('input');
      const sourceInputs = cloneFrom.querySelectorAll('input');
      inputs.forEach((input, i) => {
        if (sourceInputs[i]) input.value = sourceInputs[i].value;
      });
    }

    // Add remove functionality
    const removeBtn = div.querySelector('.remove-payment-btn');
    removeBtn.addEventListener('click', () => {
      if (paymentsContainer.querySelectorAll('.payment-block').length > 1) {
        paymentsContainer.removeChild(div);
      } else {
        alert("At least one payment is required.");
      }
    });
  }

  // Add first payment block on load
  createPaymentBlock();

  // Clone last block on button click
  addPaymentBtn.addEventListener("click", () => {
    const blocks = paymentsContainer.querySelectorAll('.payment-block');
    const lastBlock = blocks[blocks.length - 1];
    createPaymentBlock(lastBlock);
  });

  // Handle submission
  document.getElementById("sepaForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const msgId = document.getElementById("msgId").value;
    const debtorName = document.getElementById("debtorName").value;
    const debtorIban = document.getElementById("debtorIban").value;

    const payments = Array.from(document.querySelectorAll(".payment-block")).map(block => {
      return {
        CreditorName: block.querySelector('[name="creditorName"]').value,
        CreditorIBAN: block.querySelector('[name="creditorIban"]').value,
        CreditorCountry: block.querySelector('[name="creditorCountry"]').value,
        CreditorAdrLine1: block.querySelector('[name="creditorAdrLine1"]').value,
        CreditorAdrLine2: block.querySelector('[name="creditorAdrLine2"]').value,
        Amount: block.querySelector('[name="amount"]').value,
        Reference: block.querySelector('[name="paymentRef"]').value,
        RemittanceInfo: block.querySelector('[name="remittanceInfo"]').value
      };
    });

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
      `      <InitgPty><Nm>${debtorName}</Nm></InitgPty>`,
      `    </GrpHdr>`,
      `    <PmtInf>`,
      `      <PmtInfId>GeneratedBatch</PmtInfId>`,
      `      <PmtMtd>TRF</PmtMtd>`,
      `      <ReqdExctnDt>${now.split('T')[0]}</ReqdExctnDt>`,
      `      <Dbtr><Nm>${debtorName}</Nm></Dbtr>`,
      `      <DbtrAcct><Id><IBAN>${debtorIban}</IBAN></Id><Ccy>EUR</Ccy></DbtrAcct>`,
    ];

    payments.forEach((tx, i) => {
      xmlParts.push(
        `      <CdtTrfTxInf>`,
        `        <PmtId><EndToEndId>SEPA-${i + 1}</EndToEndId></PmtId>`,
        `        <Amt><InstdAmt Ccy="EUR">${tx.Amount}</InstdAmt></Amt>`,
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

// generate default Message Id
function generateDefaultMsgId() {
  const now = new Date();
  const iso = now.toISOString(); // e.g., 2024-02-27T14:43:11.433Z
  const cleaned = iso.replace('Z', '').replace(/[:.]/g, ''); // Remove Z, colons, dots
  const sequence = "0001"; // Can be static or later made dynamic
  return `${iso.slice(0, -1)}/${sequence}`; // Keep ISO format but append /0001
}

document.getElementById('msgId').value = generateDefaultMsgId();

