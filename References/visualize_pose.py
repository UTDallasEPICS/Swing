import pandas as pd
import matplotlib.pyplot as plt

# Load pose data
df = pd.read_csv("pose_data.csv")

# Extract coordinate columns
frames = range(len(df))
shoulder_x, shoulder_y = df["shoulder_x"], df["shoulder_y"]
elbow_x, elbow_y = df["elbow_x"], df["elbow_y"]
wrist_x, wrist_y = df["wrist_x"], df["wrist_y"]

# Plot movements over frames
plt.figure(figsize=(10, 5))

plt.plot(frames, shoulder_y, label="Shoulder Y", linestyle="dashed")
plt.plot(frames, elbow_y, label="Elbow Y", linestyle="solid")
plt.plot(frames, wrist_y, label="Wrist Y", linestyle="dotted")

plt.xlabel("Frame Number")
plt.ylabel("Y-Coordinate")
plt.title("Arm Movement Over Time")
plt.legend()
plt.show()
