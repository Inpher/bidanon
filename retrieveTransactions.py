# -*- coding: utf-8 -*-
from requests_oauthlib import OAuth1Session
import json
from pprint import pprint

# oauth flow in simple words: http://pyoauth.readthedocs.org/en/latest/guides/oauth1.html

client_key = "0ljnr3kep31wr003ytmtaf5feu5nkck3jbsn52vq"
client_secret = "p4lcjmnfyzp25z2dzo3yhtpl01evyjzpszh52uzi"

base_url = "https://apisandbox.openbankproject.com"
request_token_url = base_url + "/oauth/initiate"
authorization_base_url = base_url + "/oauth/authorize"
access_token_url = base_url + "/oauth/token"

openbank = OAuth1Session(client_key, client_secret=client_secret, callback_uri='http://127.0.0.1/cb')
openbank.fetch_request_token(request_token_url)

authorization_url = openbank.authorization_url(authorization_base_url)
print 'Please go here and authorize:', authorization_url

redirect_response = raw_input('Paste the full redirect URL here:')
openbank.parse_authorization_response(redirect_response)
openbank.fetch_access_token(access_token_url)

#get accounts for a specific bank
our_bank = 'obp-bankx-n'
print "Available accounts"
r = openbank.get(u"{}/obp/v1.2.1/banks/{}/accounts/public".format(base_url, our_bank))

accounts = r.json()['accounts']
for a in accounts:
	print a['id']

	#just picking first account
	our_account = accounts[0]['id']

	print "Get owner transactions"
	r = openbank.get(u"{}/obp/v1.2.1/banks/{}/accounts/{}/public/transactions".format(base_url,
	    our_bank,
	    our_account), headers= {'obp_limit': '1000'})
	transactions = r.json()['transactions']
	print "Got {} transactions".format(len(transactions))
	with open(a['id']+'data.json', 'w') as outfile:
	    json.dump(transactions, outfile)
