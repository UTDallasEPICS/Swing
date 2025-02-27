import cv2
import mediapipe as mp
import numpy as np
import os

# Disable GPU (for CPU processing)
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

# Initialize MediaPipe Pose Model
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

# Load Video
video_path = "armswing1.mp4"
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error: Cannot open video.")
    exit()

coordinates = []

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break  # Exit loop when video ends

    # Convert frame to RGB (MediaPipe requires RGB input)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Run Pose Detection
    results = pose.process(frame_rgb)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark

        # Extract **Right Arm** coordinates
        right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                          landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y,
                          landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].z]
        right_elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                       landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y,
                       landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].z]
        right_wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                       landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y,
                       landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].z]

        # Extract **Left Arm** coordinates
        left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y,
                         landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].z]
        left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                      landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y,
                      landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].z]
        left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                      landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y,
                      landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].z]

        frame_coords = [right_shoulder, right_elbow, right_wrist,
                        left_shoulder, left_elbow, left_wrist]
        coordinates.append(frame_coords)

cap.release()

# Convert to NumPy array and save results
coordinates_np = np.array(coordinates)
np.save("both_arms_pose.npy", coordinates_np)

print(f"✅ Both arms pose extraction complete. Data saved as 'both_arms_pose.npy'. Shape: {coordinates_np.shape}")
