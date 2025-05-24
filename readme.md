SEPA PAIN XML Viewer and Generator je preprosta spletna aplikacija, ki omogoča podjetjem pregledovanje, izvoz in ustvarjanje SEPA plačilnih nalogov v standardu ISO 20022 (pain.001.001.03). Uporabniki lahko naložijo obstoječe SEPA XML datoteke, pregledajo posamezna plačila, jih izvozijo v CSV ali ustvarijo nove SEPA plačilne naloge prek enostavnega spletnega obrazca. Vse se obdeluje lokalno v brskalniku, brez pošiljanja podatkov na strežnike.

Online demo: 

## 📄 About SEPA XML

**SEPA PAIN XML Viewer and Generator** is a lightweight, browser-based application designed for **corporate users** and **finance teams** who need to work with SEPA PAIN XML payment files based on the **ISO 20022** standard.

The app supports two main workflows:
- **Viewing and Parsing**: Upload and preview SEPA **payment initiation messages** (`pain.001.001.03` format) containing any number of transactions transactions. Each payment can be individually selected, exported to CSV, or downloaded as a single, standalone SEPA XML file.
- **Generating New Payments**: Fill out a **web form** to manually create new SEPA XML files and generate compliant `pain.001.001.03` messages ready for submission to banks.  You can also generate a batch SEPA XML file, containing multiple payments. Details of the first payment are copied to the next one, make sure to edit them correctly. If needed, remove a payment during your edits.

---

## 📚 Background: What Are PAIN Messages?

SEPA (Single Euro Payments Area) payments rely on the **ISO 20022** XML messaging standard to structure and exchange payment data between banks and payment service providers.  
The **PAIN (Payment Initiation)** message category is used by **corporate customers** to instruct their banks to process credit transfers and direct debits.

Specifically, this app supports:

| Message | Use Case                                | Description |
|:--------|:----------------------------------------|:------------|
| `pain.001.001.03` | SEPA Credit Transfer Initiation | Corporate customers send payment instructions to banks |
| `pain.002.001.03` | (viewed separately) | Payment status reports (PSRs) from banks |

Each payment file must correctly structure payment details like:
- Debtor and Creditor names
- IBANs and BICs
- Execution dates
- Amounts and currencies
- Payment references and remittance information

---

## 🛠️ Key Features

- Parse and display multiple transactions from uploaded `pain.001.001.03` files
- Export full transaction lists to CSV
- Select a single transaction to generate a minimal SEPA XML file
- Create new SEPA Credit Transfer files manually via a simple form
- 100% client-side: no server, no upload of sensitive data
- Styled with **Bulma CSS** for a clean, responsive UI

---

## 🔒 Privacy and Security

Everything happens in your browser — no data is ever sent over the internet.  
Ideal for testing, finance operations, training, and confidential payment preparation.

---

## 📥 Technologies Used

- **Bulma CSS** for responsive UI
- **Vanilla JavaScript** (no frameworks)
- **ISO 20022 pain.001.001.03** XML schema compliance
- **Blob & FileReader API** for downloads and file handling

## Info and Legal

[SEPA messages: what they are and how they work](https://www.numeral.io/blog/sepa-messages)

This application generates SEPA Credit Transfer messages in the ISO 20022 pain.001.001.03 XML format, used by businesses to initiate euro payments through their bank.
You're welcome — and great question!
Yes, you're right to call it a **SEPA payment** — but here’s a precise breakdown so you can be both correct **and confident** in your terminology when talking to banks, accountants, or developers:

### ✅ What You're getting is a SEPA Payment

You're generating `pain.001.001.03` messages using the **ISO 20022** standard. These messages are:

* Specifically defined by the **European Payments Council (EPC)**,
* Used for **SEPA Credit Transfers** (SCT),
* Meant to be sent by **corporate customers** to **banks** to initiate payments.

In EPC documentation and online banking, this is sometimes described as:

* "SEPA batch file"
* "SEPA SCT XML file"
* "SEPA payment initiation message"
* or simply “SEPA payment file”

### ❗ Important Distinction

You're **not** generating:

* SEPA **Direct Debit** messages (`pain.008`),
* Interbank **settlement messages** (`pacs.008`),
* Payment **status reports** (`pain.002`).

