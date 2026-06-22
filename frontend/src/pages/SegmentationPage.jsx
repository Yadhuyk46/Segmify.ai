import { useEffect, useState } from "react";
import { Brain, Play, Sparkles } from "lucide-react";

import api from "../lib/api";

const manualDefaults = {
  age: 32,
  gender: "Female",
  country: "India",
  preferred_category: "Electronics",
  income: 65000,
  purchase_frequency: 6,
  average_order_value: 140,
  total_spending: 2400,
  loyalty_score: 76,
  customer_lifetime_value: 5200,
  churn_risk: 0.18,
};

export default function SegmentationPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [predictionMode, setPredictionMode] = useState("saved");
  const [manualCustomer, setManualCustomer] = useState(manualDefaults);
  const [training, setTraining] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/customers", { params: { page: 1, page_size: 50 } })
      .then(({ data }) => {
        setCustomers(data.items);
        setSelectedCustomer(String(data.items[0]?.id || ""));
      })
      .catch((err) => setMessage(err.response?.data?.detail || "Unable to load customers."));
  }, []);

  async function trainModel() {
    setBusy(true);
    setMessage("");
    try {
      const payload = predictionMode === "manual"
        ? { customer: Object.fromEntries(Object.entries(manualCustomer).map(([key, value]) => [key, ["gender", "country", "preferred_category"].includes(key) ? value : Number(value)])) }
        : undefined;
      const { data } = await api.post("/segmentation/train", payload);
      setTraining(data);
      setMessage(predictionMode === "manual" ? "Model trained successfully on the manual customer input." : "Model trained successfully.");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Unable to train model. Admin or analyst access is required.");
    } finally {
      setBusy(false);
    }
  }

  async function predictSegment() {
    setBusy(true);
    setMessage("");
    try {
      const payload = predictionMode === "manual"
        ? { customer: Object.fromEntries(Object.entries(manualCustomer).map(([key, value]) => [key, ["gender", "country", "preferred_category"].includes(key) ? value : Number(value)])) }
        : { customer_id: Number(selectedCustomer) };
      const { data } = await api.post("/segmentation/predict", payload);
      setPrediction(data);
      setMessage("Prediction completed.");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Train the model before predicting.");
    } finally {
      setBusy(false);
    }
  }

  function updateManualCustomer(event) {
    const { name, value } = event.target;
    setManualCustomer((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Machine learning workspace</p>
        <h2 className="font-display text-3xl">Customer Segmentation Engine</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Auto Segmentation", "Train K-Means and KNN on the current customer database."],
            ["Prediction", "Select a customer and predict the most likely segment."],
            ["AI Recommendations", "Generate retention and growth recommendations per cohort."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800"><h3 className="font-display text-xl">{title}</h3><p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{text}</p></div>
          ))}
        </div>
      </div>

      {message && <p className="rounded-2xl bg-brand-500/10 px-4 py-3 text-sm text-brand-500">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <Brain className="text-brand-500" />
          <h3 className="mt-4 font-display text-2xl">Model Controls</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            <button disabled={busy} onClick={trainModel} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"><Play size={16} /> {predictionMode === "manual" ? "Train Manual Model" : "Train Model"}</button>
            <div className="inline-flex rounded-2xl border border-slate-200 p-1 dark:border-slate-800">
              {["saved", "manual"].map((mode) => (
                <button key={mode} type="button" onClick={() => setPredictionMode(mode)} className={`rounded-xl px-4 py-2 text-sm capitalize ${predictionMode === mode ? "bg-brand-500 text-white" : "text-slate-500 dark:text-slate-300"}`}>
                  {mode}
                </button>
              ))}
            </div>
            {predictionMode === "saved" && (
              <select value={selectedCustomer} onChange={(event) => setSelectedCustomer(event.target.value)} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800">
                {customers.map((customer) => <option className="text-slate-950" key={customer.id} value={customer.id}>{customer.full_name} - {customer.customer_code}</option>)}
              </select>
            )}
            <button disabled={busy || (predictionMode === "saved" && !selectedCustomer)} onClick={predictSegment} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 disabled:opacity-50 dark:border-slate-800"><Sparkles size={16} /> Predict Segment</button>
          </div>
          {predictionMode === "manual" && (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Object.keys(manualDefaults).map((key) => (
                <label key={key} className="text-sm capitalize text-slate-500 dark:text-slate-300">
                  {key.replaceAll("_", " ")}
                  <input name={key} value={manualCustomer[key]} onChange={updateManualCustomer} type={["gender", "country", "preferred_category"].includes(key) ? "text" : "number"} step="0.01" className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 outline-none dark:border-slate-700" />
                </label>
              ))}
            </div>
          )}
          <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Latest model snapshot</p>
            <p className="mt-3 font-display text-3xl">{training ? `${Math.round(training.accuracy * 100)}% accuracy` : "Not trained in this session"}</p>
            {training && <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Training rows: {training.training_size}, test rows: {training.test_size}</p>}
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-2xl">Prediction Result</h3>
          {prediction ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-brand-500/10 p-5"><p className="text-sm text-slate-500">Predicted segment</p><p className="font-display text-3xl text-brand-500">{prediction.segment}</p><p className="mt-1 text-sm">Confidence: {Math.round(prediction.probability_score * 100)}%</p></div>
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">Spending category</p>
                <p className="mt-2 font-display text-2xl">{prediction.spending_category}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{prediction.spending_summary}</p>
              </div>
              {prediction.recommendations.map((item) => <div key={item} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">{item}</div>)}
            </div>
          ) : (
            <p className="mt-5 text-slate-500 dark:text-slate-300">Train the model, choose a customer, then run prediction.</p>
          )}
        </div>
      </div>
    </div>
  );
}
