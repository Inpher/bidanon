import json
import os
from pprint import pprint

# REST API from the openbankproject
# Data taken from:
path = 'client-data/findata/'
for filename in map(lambda x: path + x, os.listdir(path)):
	with open(filename) as json_file:
		data = json.load(json_file)
		print data[0]['details']['amount']
		#pprint(data)
