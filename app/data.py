import json
import datetime as dt
import pandas as pd
import numpy as np

print("Loading data...")


def split_sentiment(df):
    mask = df.sentiment == 1
    return [df[mask], df[~mask]]


with open('data/tags/tag_hierarchical.json', 'r') as f:
    tag_graph = json.load(f)

with open('data/tags/tag_filter.json', 'r') as f:
    tag_filter = json.load(f)

df_points = pd.read_csv('data/projections/perp_10_2500subs.csv')
df_title = pd.read_csv('data/soc-redditHyperlinks-title.tsv', sep='\t')
df_body = pd.read_csv('data/soc-redditHyperlinks-body.tsv', sep='\t')
df_all = pd.concat([df_title, df_body])

all_subs = set()
all_subs.update(df_points['sub'])

df_all = df_all[df_all.SOURCE_SUBREDDIT.map(
    lambda x: x in all_subs) & df_all.TARGET_SUBREDDIT.map(lambda x: x in all_subs)]
df_all.TIMESTAMP = pd.to_datetime(df_all.TIMESTAMP)
df_all.columns = "source target post_id timestamp sentiment props".split()

df_source = df_all.set_index('source')
df_target = df_all.set_index('target')
df_current = df_all

# Shift to 0 origin
x_shift = df_points.x.min()
y_shift = df_points.y.min()
df_points.x = df_points.x + (-x_shift)
df_points.y = df_points.y + (-y_shift)

# Scent Calculations
bins = pd.cut(df_all.timestamp, 50)
df_all['bin'] = bins
pos_rows, neg_rows = split_sentiment(df_all)

print('Finished loading.')
