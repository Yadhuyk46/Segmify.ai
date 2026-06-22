from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import AgglomerativeClustering, KMeans
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.core.config import settings


FEATURE_COLUMNS = [
    "age",
    "gender",
    "country",
    "income",
    "purchase_frequency",
    "average_order_value",
    "total_spending",
    "loyalty_score",
    "customer_lifetime_value",
    "churn_risk",
]

NUMERIC_COLUMNS = [
    "age",
    "income",
    "purchase_frequency",
    "average_order_value",
    "total_spending",
    "loyalty_score",
    "customer_lifetime_value",
    "churn_risk",
]
CAT_COLUMNS = ["gender", "country"]

SEGMENT_MAP = {
    0: "Premium Customers",
    1: "Loyal Customers",
    2: "Budget Customers",
    3: "At-Risk Customers",
    4: "Occasional Buyers",
}


class SegmentationEngine:
    def __init__(self):
        self.model_path = Path(settings.model_path)

    def path_for(self, model_key: str = "global") -> Path:
        if model_key == "global":
            return self.model_path
        return self.model_path.with_name(f"{self.model_path.stem}_{model_key}{self.model_path.suffix}")

    def preprocessing(self) -> ColumnTransformer:
        return ColumnTransformer(
            transformers=[
                ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), NUMERIC_COLUMNS),
                ("cat", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("encoder", OneHotEncoder(handle_unknown="ignore"))]), CAT_COLUMNS),
            ]
        )

    def train(self, dataframe: pd.DataFrame, model_key: str = "global") -> dict:
        features = dataframe[FEATURE_COLUMNS]
        preprocessor = self.preprocessing()
        transformed = preprocessor.fit_transform(features)

        cluster_count = min(5, len(dataframe))
        kmeans = KMeans(n_clusters=cluster_count, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(transformed)
        dataframe = dataframe.copy()
        dataframe["segment_label"] = [SEGMENT_MAP[int(label)] for label in clusters]

        if len(dataframe) == 1:
            x_train = features
            x_test = features
            y_train = dataframe["segment_label"]
            y_test = dataframe["segment_label"]
        else:
            x_train, x_test, y_train, y_test = train_test_split(features, dataframe["segment_label"], test_size=0.2, random_state=42)
        classifier = Pipeline([("preprocessor", preprocessor), ("model", KNeighborsClassifier(n_neighbors=min(7, len(x_train))))])
        classifier.fit(x_train, y_train)
        predictions = classifier.predict(x_test)
        accuracy = accuracy_score(y_test, predictions)

        if len(dataframe) > 1:
            hierarchical = AgglomerativeClustering(n_clusters=cluster_count)
            hierarchical.fit(transformed.toarray() if hasattr(transformed, "toarray") else transformed)

        bundle = {
            "classifier": classifier,
            "kmeans": kmeans,
            "segments": SEGMENT_MAP,
            "accuracy": float(accuracy),
            "confusion_matrix": confusion_matrix(y_test, predictions, labels=list(SEGMENT_MAP.values())).tolist(),
            "training_size": len(x_train),
            "test_size": len(x_test),
        }
        model_path = self.path_for(model_key)
        model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(bundle, model_path)
        return bundle

    def load(self, model_key: str = "global") -> dict | None:
        model_path = self.path_for(model_key)
        if not model_path.exists():
            return None
        return joblib.load(model_path)

    def predict(self, customer_data: dict, model_key: str = "global") -> tuple[str, float]:
        bundle = self.load(model_key)
        if not bundle:
            raise FileNotFoundError("Model not trained yet")
        frame = pd.DataFrame([customer_data])[FEATURE_COLUMNS]
        classifier = bundle["classifier"]
        probabilities = classifier.predict_proba(frame)[0]
        labels = classifier.classes_
        best_index = int(np.argmax(probabilities))
        return str(labels[best_index]), float(probabilities[best_index])
