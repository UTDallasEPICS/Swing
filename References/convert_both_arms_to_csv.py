import numpy as np
import pandas as pd

# Load the extracted pose data
pose_data = np.load("both_arms_pose.npy")

# Convert to Pandas DataFrame
df = pd.DataFrame(
    pose_data.reshape(pose_data.shape[0], -1),
    columns=["right_shoulder_x", "right_shoulder_y", "right_shoulder_z",
             "right_elbow_x", "right_elbow_y", "right_elbow_z",
             "right_wrist_x", "right_wrist_y", "right_wrist_z",
             "left_shoulder_x", "left_shoulder_y", "left_shoulder_z",
             "left_elbow_x", "left_elbow_y", "left_elbow_z",
             "left_wrist_x", "left_wrist_y", "left_wrist_z"]
)

# Save to CSV
df.to_csv("both_arms_pose.csv", index=False)
print("✅ Both arms pose data saved as 'both_arms_pose.csv'")
