import json

from circuit_view import CircuitView
from comp_score_mgr import LocalScoreManager


def main():
    cv = CircuitView()
    cv.process(5, "19-20")

    print(json.dumps(cv.get_standings(), indent=4))


if __name__ == "__main__":
    main()
