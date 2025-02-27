import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# Load pose data
df = pd.read_csv("pose_data.csv")

fig, ax = plt.subplots()
ax.set_xlim(min(df["shoulder_x"]), max(df["wrist_x"]))
ax.set_ylim(min(df["shoulder_y"]), max(df["shoulder_y"]))

# Initialize scatter plot
point, = ax.plot([], [], 'ro', markersize=10)  # Red dots for joints

def update(frame):
    x_values = [df["shoulder_x"][frame], df["elbow_x"][frame], df["wrist_x"][frame]]
    y_values = [df["shoulder_y"][frame], df["elbow_y"][frame], df["wrist_y"][frame]]
    point.set_data(x_values, y_values)
    return point,

ani = animation.FuncAnimation(fig, update, frames=len(df), interval=50)
plt.show()
