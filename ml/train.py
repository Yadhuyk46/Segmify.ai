import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT / "backend"))

from app.ml.pipeline import SegmentationEngine


def main():
    dataframe = pd.read_csv("data/customers_5000.csv")
    dataframe = dataframe.rename(columns={"segment": "segment_name"})
    engine = SegmentationEngine()
    result = engine.train(dataframe)
    print({"accuracy": result["accuracy"], "training_size": result["training_size"], "test_size": result["test_size"]})


if __name__ == "__main__":
    main()
