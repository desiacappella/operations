from circuit_view import CircuitView


def main():
    for i in range(0, 8):
        cv = CircuitView("18-19", i)
        cv.save_standings_json(f"thresholds-{i}.json")


if __name__ == "__main__":
    main()
