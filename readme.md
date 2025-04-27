SEPA PAIN XML Viewer and Generator je preprosta spletna aplikacija, ki omogoča podjetjem pregledovanje, izvoz in ustvarjanje SEPA plačilnih nalogov v standardu ISO 20022 (pain.001.001.03). Uporabniki lahko naložijo obstoječe SEPA XML datoteke, pregledajo posamezna plačila, jih izvozijo v CSV ali ustvarijo nove SEPA plačilne naloge prek enostavnega spletnega obrazca. Vse se obdeluje lokalno v brskalniku, brez pošiljanja podatkov na strežnike.

Online demo: 

## 📄 About SEPA XML

**SEPA PAIN XML Viewer and Generator** is a lightweight, browser-based application designed for **corporate users** and **finance teams** who need to work with SEPA payment files based on the **ISO 20022** standard.

The app supports two main workflows:
- **Viewing and Parsing**: Upload and preview SEPA **payment initiation messages** (`pain.001.001.03` format) containing any number of transactions transactions. Each payment can be individually selected, exported to CSV, or downloaded as a single, standalone SEPA XML file.
- **Generating New Payments**: Fill out a **web form** to manually create new SEPA XML files and generate compliant `pain.001.001.03` messages ready for submission to banks.

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
Ideal for payment preparation, as well as inspecting of prepared payments before uploading them to your bank.

---

## 📥 Technologies Used

- **Bulma CSS** for responsive UI
- **Vanilla JavaScript** (no frameworks)
- **ISO 20022 pain.001.001.03** XML schema compliance
- **Blob & FileReader API** for downloads and file handling

## Info

[SEPA messages: what they are and how they work](https://www.numeral.io/blog/sepa-messages)


