import cv2
import mediapipe as mp
import matplotlib.pyplot as plt
import numpy as np
import sys
import os
import json

def analyze_video(video_path, output_path):
    # Initialize Mediapipe and drawing utilities
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils

    # Initialize lists for storing data
    pose_data = {
        'Timestamp': [],
        'Shoulder_X': [],
        'Shoulder_Y': [],
        'Shoulder_Z': [],
        'Elbow_X': [],
        'Elbow_Y': [],
        'Elbow_Z': [],
        'Wrist_X': [],
        'Wrist_Y': [],
        'Wrist_Z': []
    }

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"Error: Could not open video: {video_path}")
        sys.exit(1)

    # Process the video
    with mp_pose.Pose(
        model_complexity=2,  # 2 represents the heavy model
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Convert BGR to RGB
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False

            # Perform pose estimation
            results = pose.process(image)

            # Extract landmarks if detected
            if results.pose_landmarks:
                timestamp = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000  # Convert to seconds
                landmarks = results.pose_landmarks.landmark

                # Append data to the dictionary
                pose_data['Timestamp'].append(timestamp)
                pose_data['Shoulder_X'].append(landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].x)
                pose_data['Shoulder_Y'].append(landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].y)
                pose_data['Shoulder_Z'].append(landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].z)
                pose_data['Elbow_X'].append(landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW].x)
                pose_data['Elbow_Y'].append(landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW].y)
                pose_data['Elbow_Z'].append(landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW].z)
                pose_data['Wrist_X'].append(landmarks[mp_pose.PoseLandmark.RIGHT_WRIST].x)
                pose_data['Wrist_Y'].append(landmarks[mp_pose.PoseLandmark.RIGHT_WRIST].y)
                pose_data['Wrist_Z'].append(landmarks[mp_pose.PoseLandmark.RIGHT_WRIST].z)

    cap.release()

    # Convert pose data to numpy arrays
    pose_data = {key: np.array(value).tolist() for key, value in pose_data.items()}

    # Save pose data as JSON
    json_path = output_path.replace('.png', '.json')
    with open(json_path, 'w') as f:
        json.dump(pose_data, f)

    # Convert pose data back to numpy arrays for plotting
    pose_data = {key: np.array(value) for key, value in pose_data.items()}

    # Extract time and validate
    time = pose_data['Timestamp']
    if len(time) < 2:
        raise ValueError("Insufficient data points for processing after cleaning.")

    # Function to compute velocity and acceleration
    def compute_derivatives(position, time):
        if len(position) < 2 or len(time) < 2:
            raise ValueError("Insufficient data points for derivative computation.")
        velocity = np.gradient(position, time)
        acceleration = np.gradient(velocity, time)
        return velocity, acceleration

    # Calculate derivatives for each coordinate
    derivatives = {}
    for joint in ['Shoulder', 'Elbow', 'Wrist']:
        for axis in ['X', 'Y', 'Z']:
            pos = pose_data[f'{joint}_{axis}']
            v, a = compute_derivatives(pos, time)
            derivatives[f'{joint}_{axis}_Velocity'] = v
            derivatives[f'{joint}_{axis}_Acceleration'] = a

    # Create the analysis plot
    fig = plt.figure(figsize=(15, 15))

    # Plot positions for all joints
    plt.subplot(3, 3, 1)
    plt.plot(time, pose_data['Shoulder_X'], label='X')
    plt.plot(time, pose_data['Shoulder_Y'], label='Y')
    plt.plot(time, pose_data['Shoulder_Z'], label='Z')
    plt.title('Shoulder Position')
    plt.xlabel('Time (s)')
    plt.ylabel('Position')
    plt.legend()
    plt.grid(True)

    plt.subplot(3, 3, 2)
    plt.plot(time, pose_data['Elbow_X'], label='X')
    plt.plot(time, pose_data['Elbow_Y'], label='Y')
    plt.plot(time, pose_data['Elbow_Z'], label='Z')
    plt.title('Elbow Position')
    plt.xlabel('Time (s)')
    plt.ylabel('Position')
    plt.legend()
    plt.grid(True)

    plt.subplot(3, 3, 3)
    plt.plot(time, pose_data['Wrist_X'], label='X')
    plt.plot(time, pose_data['Wrist_Y'], label='Y')
    plt.plot(time, pose_data['Wrist_Z'], label='Z')
    plt.title('Wrist Position')
    plt.xlabel('Time (s)')
    plt.ylabel('Position')
    plt.legend()
    plt.grid(True)

    # Plot velocities for all joints
    plt.subplot(3, 3, 4)
    plt.plot(time, derivatives['Shoulder_X_Velocity'], label='X')
    plt.plot(time, derivatives['Shoulder_Y_Velocity'], label='Y')
    plt.plot(time, derivatives['Shoulder_Z_Velocity'], label='Z')
    plt.title('Shoulder Velocity')
    plt.xlabel('Time (s)')
    plt.ylabel('Velocity')
    plt.legend()
    plt.grid(True)

    plt.subplot(3, 3, 5)
    plt.plot(time, derivatives['Elbow_X_Velocity'], label='X')
    plt.plot(time, derivatives['Elbow_Y_Velocity'], label='Y')
    plt.plot(time, derivatives['Elbow_Z_Velocity'], label='Z')
    plt.title('Elbow Velocity')
    plt.xlabel('Time (s)')
    plt.ylabel('Velocity')
    plt.legend()
    plt.grid(True)

    plt.subplot(3, 3, 6)
    plt.plot(time, derivatives['Wrist_X_Velocity'], label='X')
    plt.plot(time, derivatives['Wrist_Y_Velocity'], label='Y')
    plt.plot(time, derivatives['Wrist_Z_Velocity'], label='Z')
    plt.title('Wrist Velocity')
    plt.xlabel('Time (s)')
    plt.ylabel('Velocity')
    plt.legend()
    plt.grid(True)

    # Plot accelerations for all joints
    plt.subplot(3, 3, 7)
    plt.plot(time, derivatives['Shoulder_X_Acceleration'], label='X')
    plt.plot(time, derivatives['Shoulder_Y_Acceleration'], label='Y')
    plt.plot(time, derivatives['Shoulder_Z_Acceleration'], label='Z')
    plt.title('Shoulder Acceleration')
    plt.xlabel('Time (s)')
    plt.ylabel('Acceleration')
    plt.legend()
    plt.grid(True)

    plt.subplot(3, 3, 8)
    plt.plot(time, derivatives['Elbow_X_Acceleration'], label='X')
    plt.plot(time, derivatives['Elbow_Y_Acceleration'], label='Y')
    plt.plot(time, derivatives['Elbow_Z_Acceleration'], label='Z')
    plt.title('Elbow Acceleration')
    plt.xlabel('Time (s)')
    plt.ylabel('Acceleration')
    plt.legend()
    plt.grid(True)

    plt.subplot(3, 3, 9)
    plt.plot(time, derivatives['Wrist_X_Acceleration'], label='X')
    plt.plot(time, derivatives['Wrist_Y_Acceleration'], label='Y')
    plt.plot(time, derivatives['Wrist_Z_Acceleration'], label='Z')
    plt.title('Wrist Acceleration')
    plt.xlabel('Time (s)')
    plt.ylabel('Acceleration')
    plt.legend()
    plt.grid(True)

    # Save the plot
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

    # Verify the output files exist
    if not os.path.exists(output_path):
        print(f"Error: Analysis results not found at {output_path}")
        return
    if not os.path.exists(json_path):
        print(f"Error: Pose data not found at {json_path}")
        return

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python analyze_video.py <video_path> <output_path>")
        sys.exit(1)
    
    video_path = sys.argv[1]
    output_path = sys.argv[2]
    analyze_video(video_path, output_path) 