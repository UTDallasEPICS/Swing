import cv2
import pandas as pd
import numpy as np

# Load both arms pose data
df = pd.read_csv("both_arms_pose.csv")

# Open the original video
video_path = "armswing1.mp4"
cap = cv2.VideoCapture(video_path)

# Get video properties
frame_width = int(cap.get(3))
frame_height = int(cap.get(4))
fps = int(cap.get(cv2.CAP_PROP_FPS))

# Define output video writer
output_path = "both_arms_pose_overlay.mp4"
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

# Frame counter
frame_idx = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret or frame_idx >= len(df):
        break  # Exit loop when video ends or no more pose data

    # Extract right arm pose data
    right_shoulder = (int(df.iloc[frame_idx]["right_shoulder_x"] * frame_width), int(df.iloc[frame_idx]["right_shoulder_y"] * frame_height))
    right_elbow = (int(df.iloc[frame_idx]["right_elbow_x"] * frame_width), int(df.iloc[frame_idx]["right_elbow_y"] * frame_height))
    right_wrist = (int(df.iloc[frame_idx]["right_wrist_x"] * frame_width), int(df.iloc[frame_idx]["right_wrist_y"] * frame_height))

    # Extract left arm pose data
    left_shoulder = (int(df.iloc[frame_idx]["left_shoulder_x"] * frame_width), int(df.iloc[frame_idx]["left_shoulder_y"] * frame_height))
    left_elbow = (int(df.iloc[frame_idx]["left_elbow_x"] * frame_width), int(df.iloc[frame_idx]["left_elbow_y"] * frame_height))
    left_wrist = (int(df.iloc[frame_idx]["left_wrist_x"] * frame_width), int(df.iloc[frame_idx]["left_wrist_y"] * frame_height))

    # Draw circles for right arm joints
    cv2.circle(frame, right_shoulder, 5, (0, 255, 0), -1)  # Green for shoulder
    cv2.circle(frame, right_elbow, 5, (0, 0, 255), -1)  # Red for elbow
    cv2.circle(frame, right_wrist, 5, (255, 0, 0), -1)  # Blue for wrist

    # Draw circles for left arm joints
    cv2.circle(frame, left_shoulder, 5, (0, 255, 0), -1)  # Green for shoulder
    cv2.circle(frame, left_elbow, 5, (0, 0, 255), -1)  # Red for elbow
    cv2.circle(frame, left_wrist, 5, (255, 0, 0), -1)  # Blue for wrist

    # Draw lines connecting the joints
    cv2.line(frame, right_shoulder, right_elbow, (0, 255, 255), 2)
    cv2.line(frame, right_elbow, right_wrist, (255, 0, 255), 2)
    cv2.line(frame, left_shoulder, left_elbow, (0, 255, 255), 2)
    cv2.line(frame, left_elbow, left_wrist, (255, 0, 255), 2)

    # Write the modified frame to output video
    out.write(frame)

    frame_idx += 1  # Move to next frame

# Release resources
cap.release()
out.release()
cv2.destroyAllWindows()

print(f"✅ Both arms pose overlay completed. Video saved as {output_path}")
