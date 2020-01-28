import json
from flask import Flask
from flask_cors import CORS

from circuit_view import CircuitView

app = Flask(__name__)
cors = CORS(app)

N_COMPS = 7

ALL_THRESHOLDS = [
    CircuitView("18-19", num).get_standings()
    for num in range(0, N_COMPS+1)
]


@app.route('/')
def thresholds():
    return json.dumps(ALL_THRESHOLDS)
