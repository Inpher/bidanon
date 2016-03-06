# six-hackathon
Authors: Betty, Seb, Nicolas, Alex @inpher.io

Bid Anon- A competitive bidding platform with privacy and insight.

Description: Bid Anon is a privacy preserving open bidding platform that matches borrowers and lenders
with rich statistical data and post transactional verification.  Existing lending marketplaces are based on
flawed models with limited data sets that either require you to publish personal information, use a ‘trusted’ third party broker, or rely on unsubstantiated user reviews. Built on advanced cryptographic technology, Bid Anon provides a zero-knowledge platform wherein anonymized data derived from financial information, social profiles, geolocation services and other public and private sources is used to rank borrower profiles through machine learning algorithms and provide a marketplace for lenders to bid on loan opportunities.  Private information is only shared directly between the parties after the borrower accepts a bid in order to validate the transaction.  Loan contracts can be traded through our backend blockchain integration for decentralized secondary market opportunities.

#### Value for the borrowers (sellers)
- Better deals through a large lender marketplace

#### Value for the lenders (buyers)
- Access to more opportunities through an online borrower marketplace
- Mitigated risk with insight into comprehensive borrower data

#### Opportunity for secondary markets (traders)
- Decentralized trading platform enables loans to be packaged and resold

# Prerequisites
- Node.js
- MongoDB
- Bower

# Getting started
#### Prepare environment
```
# Launch Mongodb in dedicated terminal
mkdir mondata
mongod --dbpath mondata
```
```
# Clone Repo
git clone https://github.com/Inpher/six-hackathon.git
```
```
# Download dependencies
cd six-hackathon/bidme
npm install && bower install

# Start node server
node server.js
```
# Start web application
[Open Browser: http://localhost:3000](http://localhost:3000)

[Register as a bank](http://localhost:3000/#/registerBank)

# Under the hood
## Basic Idea
The idea is to match borrowers with lenders anonymously based on objective criteria. Once the match has been done, the transaction is settle and identities are exchanged. This means that all sensitive information is processed on the client and only anonymized data is store on the server. The private data is dumped in an encrypted blob and only made available to the lender once the match is completed.

## Financial Score
Sample financial information is located in:
```
$PROJECT_HOME/client-data/findata/
```
The data is pulled from the [OpenBank](https://openbankproject.com/) project. The score is currently computed based on simple heuristics but with a large sample size of users we could create more detailed statistics regarding the financial capabilities of the user and match it with other census data such as average income for a country/region.

The following script shows a PoC how this data could be accessed from the app itself and not by uploading a file through the OpenBank rest api.
```
$PROJECT_HOME/retrieveTransactions.py
```

## Social Score
Using the facebook graph API. The score is again calculated based on some heuristics of the following parameters:
- Age
- Education
- Work
