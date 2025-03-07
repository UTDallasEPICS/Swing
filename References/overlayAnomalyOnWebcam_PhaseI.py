import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest

# User selects which arm(s) to track
arm_selection = input("Select arm tracking mode ('left', 'right', 'both'): ").strip().lower()
anomaly_method = input("Select anomaly detection method ('StdDev' or 'IsoFor'): ").strip().lower()

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Start capturing webcam video
cap = cv2.VideoCapture(0)  # 0 for webcam

# Store movement data
angle_data = {"right": [], "left": []}
timestamp_data = {"right": [], "left": []}
anomaly_flags = {"right": [], "left": []}

# Initialize Isolation Forest
iso_forest = IsolationForest(n_estimators=100, contamination=0.02, random_state=42)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Convert frame to RGB for MediaPipe processing
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(image)

    # Convert back to BGR for OpenCV rendering
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark
        h, w, _ = image.shape

        # Function to extract coordinates and calculate angle
        def get_arm_angle(side):
            shoulder = landmarks[getattr(mp_pose.PoseLandmark, f"{side.upper()}_SHOULDER").value]
            elbow = landmarks[getattr(mp_pose.PoseLandmark, f"{side.upper()}_ELBOW").value]
            wrist = landmarks[getattr(mp_pose.PoseLandmark, f"{side.upper()}_WRIST").value]

            shoulder_px = (int(shoulder.x * w), int(shoulder.y * h))
            elbow_px = (int(elbow.x * w), int(elbow.y * h))
            wrist_px = (int(wrist.x * w), int(wrist.y * h))

            # Compute the arm angle
            angle = np.arctan2(wrist.y - elbow.y, wrist.x - elbow.x) * (180 / np.pi)
            return angle, shoulder_px, elbow_px, wrist_px

        # Get angles based on user selection
        angles = {}
        if arm_selection in ["right", "both"]:
            angles["right"] = get_arm_angle("right")
        if arm_selection in ["left", "both"]:
            angles["left"] = get_arm_angle("left")

        # Store angles for anomaly detection
        for arm, (angle, shoulder_px, elbow_px, wrist_px) in angles.items():
            angle_data[arm].append(angle)
            timestamp_data[arm].append(len(angle_data[arm]))  # Use frame index as timestamp

            # Determine anomaly using selected method
            anomaly = False
            if len(angle_data[arm]) > 30:  # Start detecting anomalies after 30 frames
                X = np.array(angle_data[arm]).reshape(-1, 1)

                if anomaly_method.lower() == "isofor":
                    iso_forest.fit(X)
                    anomaly = iso_forest.predict([[angle]])[0] == -1  # -1 means anomaly

                elif anomaly_method.lower() == "stddev":
                    mean_angle = np.mean(angle_data[arm])
                    std_angle = np.std(angle_data[arm])
                    lower_threshold = mean_angle - (2 * std_angle)
                    upper_threshold = mean_angle + (2 * std_angle)
                    anomaly = angle < lower_threshold or angle > upper_threshold

            # Store anomaly flag
            anomaly_flags[arm].append(1 if anomaly else 0)

            # Define color based on anomaly detection
            color = (0, 255, 0) if not anomaly else (0, 0, 255)  # Green for normal, Red for anomaly

            # Overlay the information on the video
            cv2.putText(image, f"{arm.capitalize()} Angle: {int(angle)}°", 
                        (elbow_px[0] - 50, elbow_px[1] - 20), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            # Draw detected joints and connections
            cv2.line(image, shoulder_px, elbow_px, (255, 0, 0), 2)
            cv2.line(image, elbow_px, wrist_px, (255, 0, 0), 2)
            cv2.circle(image, elbow_px, 5, color, -1)  # Mark anomaly in red

    # Show the real-time feed
    cv2.imshow('Arm Swing Detection with Anomalies', image)

    # Exit on 'q' key
    if cv2.waitKey(10) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

# ✅ Plot the anomaly graph separately after webcam feed ends
plt.figure(figsize=(10, 5))
for arm in ["right", "left"]:
    if arm_selection in [arm, "both"]:
        # Assign different colors for right and left arm
        line_color = "blue" if arm == "right" else "green"
        anomaly_color = "red" if arm == "right" else "orange"

        # Plot normal movement
        plt.plot(timestamp_data[arm], angle_data[arm], 
                 label=f"{arm.capitalize()} Arm Angle", 
                 color=line_color)

        # Plot anomalies
        plt.scatter(
            [timestamp_data[arm][i] for i in range(len(anomaly_flags[arm])) if anomaly_flags[arm][i] == 1],
            [angle_data[arm][i] for i in range(len(anomaly_flags[arm])) if anomaly_flags[arm][i] == 1],
            color=anomaly_color, label=f"{arm.capitalize()} Anomalies", marker='x'
        )

plt.xlabel("Frame Number")
plt.ylabel("Arm Angle (degrees)")
plt.title("Arm Swing Anomaly Detection")
plt.legend()
plt.show()

