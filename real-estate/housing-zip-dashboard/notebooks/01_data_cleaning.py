# 01_data_cleaning.py
import pandas as pd
import os

# ===== Absolute path to raw dataset =====
RAW_FILE = r"C:\Users\citys\Documents\Python Projects\zip code clean\data\raw\zip_code_market_tracker.tsv000.gz"  # <-- change this to your actual location
PROCESSED_DIR = r"C:\Users\citys\Documents\Python Projects\zip code clean\data\processed"
OUTPUT_FILE = os.path.join(PROCESSED_DIR, "columbus_oh_zipcodes.csv")

import pandas as pd
from pathlib import Path

# --- Paths ---
INPUT_FILE = Path("../data/raw/zip_code_market_tracker.tsv000.gz")
OUTPUT_FILE = Path("../data/processed/columbus_oh.zipcodes.csv")

print("Loading data...")
df = pd.read_csv(INPUT_FILE, sep="\t", compression="gzip")

# normalize column names
df.columns = df.columns.str.strip().str.lower()

# --- Keep only rows where property_type_id == -1 ---
df["property_type_id"] = pd.to_numeric(df["property_type_id"], errors="coerce")
df = df[df["property_type_id"] == -1]

# --- Remove fake / placeholder prices ---
df["median_sale_price"] = pd.to_numeric(df["median_sale_price"], errors="coerce")

# Drop rows where price is 999999999 (invalid)
df = df[df["median_sale_price"] != 999999999]


# ---- DEBUG (helps us understand data) ----
print("\nUnique state codes (first 20):")
print(df["state_code"].unique()[:20])

print("\nExample parent metro region values (first 20):")
print(df["parent_metro_region"].dropna().unique()[:20])

# --- Filter for Columbus, OH ZIPs (flexible match) ---
df_columbus = df[
    (df["state_code"].str.upper() == "OH") &
    (df["parent_metro_region"].str.contains("columbus", case=False, na=False))
]

print(f"\nRows after filtering: {len(df_columbus)}")

# --- Convert key numeric fields ---
for col in ["inventory", "homes_sold", "period_duration", "months_of_supply"]:
    if col in df_columbus.columns:
        df_columbus[col] = pd.to_numeric(df_columbus[col], errors="coerce")

# --- Calculate months of supply when missing ---
if "months_of_supply" not in df_columbus.columns:
    df_columbus["months_of_supply"] = None

df_columbus["months_of_supply"] = df_columbus["months_of_supply"].fillna(
    df_columbus["inventory"] /
    (df_columbus["homes_sold"] / (df_columbus["period_duration"] / 30))
)

# --- Keep useful fields ---
keep_cols = [
    "period_begin", "period_end",
    "region", "state_code",
    "median_sale_price", "homes_sold",
    "inventory", "median_dom",
    "months_of_supply"
]

df_columbus = df_columbus[[c for c in keep_cols if c in df_columbus.columns]]

# --- Save result ---
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
df_columbus.to_csv(OUTPUT_FILE, index=False)

print(f"\nSaved cleaned file to: {OUTPUT_FILE}")
