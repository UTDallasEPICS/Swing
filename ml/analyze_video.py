#changed
import cv2
import mediapipe as mp
import matplotlib.pyplot as plt
import numpy as np
import sys
import os
import json
import time

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
        return 1

    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps

    print(f"Video properties: {fps} FPS, {frame_count} frames, {duration:.2f} seconds")

    # Adjust frame skip based on video duration
    frame_skip = 5 if duration > 30 else 3
    print(f"Using frame skip of {frame_skip}")

    with mp_pose.Pose(
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        enable_segmentation=False
    ) as pose:

        frame_idx = 0
        processed_frames = 0
        start_time = time.time()

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % frame_skip != 0:
                frame_idx += 1
                continue

            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False

            results = pose.process(image)

            if results.pose_landmarks:
                timestamp = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000
                landmarks = results.pose_landmarks.landmark

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

                processed_frames += 1

            frame_idx += 1

            if frame_idx % 100 == 0:
                elapsed = time.time() - start_time
                print(f"Processed {frame_idx}/{frame_count} frames ({frame_idx/frame_count*100:.1f}%) in {elapsed:.1f}s")

    cap.release()
    total_time = time.time() - start_time
    print(f"Video processing completed in {total_time:.1f}s. Processed {processed_frames} frames.")

    # Convert pose data to numpy arrays
    pose_data = {key: np.array(value) for key, value in pose_data.items()}

    # Save JSON
    json_path = output_path.replace(".png", ".json")

    with open(json_path, "w") as f:
        json.dump({k: v.tolist() for k, v in pose_data.items()}, f)

    # Validate minimum timestamps
    timestamps = pose_data['Timestamp']
    if len(timestamps) < 2:
        raise ValueError("Insufficient data points for processing.")

    # Derivative helper
    def compute_derivatives(position, timestamps):
        velocity = np.gradient(position, timestamps)
        acceleration = np.gradient(velocity, timestamps)
        return velocity, acceleration

    derivatives = {}
    for joint in ['Shoulder', 'Elbow', 'Wrist']:
        pos = pose_data[f'{joint}_Y']
        v, a = compute_derivatives(pos, timestamps)
        derivatives[f'{joint}_Y_Velocity'] = v
        derivatives[f'{joint}_Y_Acceleration'] = a

    # -------------------------------------------------------
    # Scale limits (dynamic between before/after)
    # -------------------------------------------------------
    scale_path = "scale_limits.json"

    if os.path.exists(scale_path):
        with open(scale_path, "r") as f:
            scale_limits = json.load(f)

        y_min, y_max = scale_limits["y"]
        v_min, v_max = scale_limits["v"]
        a_min, a_max = scale_limits["a"]
        t_min, t_max = scale_limits["t"]
        print("Loaded dynamic limits")
    else:
        print("Computing dynamic scale limits...")

        y_min = min(
            pose_data['Shoulder_Y'].min(),
            pose_data['Elbow_Y'].min(),
            pose_data['Wrist_Y'].min()
        )
        y_max = max(
            pose_data['Shoulder_Y'].max(),
            pose_data['Elbow_Y'].max(),
            pose_data['Wrist_Y'].max()
        )

        v_min = min(d.min() for d in [
            derivatives['Shoulder_Y_Velocity'],
            derivatives['Elbow_Y_Velocity'],
            derivatives['Wrist_Y_Velocity']
        ])
        v_max = max(d.max() for d in [
            derivatives['Shoulder_Y_Velocity'],
            derivatives['Elbow_Y_Velocity'],
            derivatives['Wrist_Y_Velocity']
        ])

        a_min = min(d.min() for d in [
            derivatives['Shoulder_Y_Acceleration'],
            derivatives['Elbow_Y_Acceleration'],
            derivatives['Wrist_Y_Acceleration']
        ])
        a_max = max(d.max() for d in [
            derivatives['Shoulder_Y_Acceleration'],
            derivatives['Elbow_Y_Acceleration'],
            derivatives['Wrist_Y_Acceleration']
        ])

        t_min = 0
        t_max = timestamps.max()

        # Padding
        pad = 0.05
        y_min -= pad
        y_max += pad
        v_min -= pad
        v_max += pad
        a_min -= pad
        a_max += pad

        scale_limits = {
            "y": [float(y_min), float(y_max)],
            "v": [float(v_min), float(v_max)],
            "a": [float(a_min), float(a_max)],
            "t": [float(t_min), float(t_max)]
        }

        with open(scale_path, "w") as f:
            json.dump(scale_limits, f, indent=4)

        print("Saved dynamic scale limits.")

    # -------------------------------------------------------
    # PLOTTING - IMPROVED LAYOUT
    # -------------------------------------------------------
    # Increased figure width for better spacing
    fig = plt.figure(figsize=(12, 12))
    
    # Use GridSpec for better control over subplot spacing
    from matplotlib.gridspec import GridSpec
    gs = GridSpec(2, 2, figure=fig, hspace=0.3, wspace=0.3)

    # Plot Y position
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.plot(timestamps, pose_data['Shoulder_Y'], label="Shoulder", linewidth=1.5)
    ax1.plot(timestamps, pose_data['Elbow_Y'], label="Elbow", linewidth=1.5)
    ax1.plot(timestamps, pose_data['Wrist_Y'], label="Wrist", linewidth=1.5)
    ax1.set_title("Vertical Position", fontsize=11, pad=10)
    ax1.set_xlabel("Time (s)", fontsize=9)
    ax1.set_ylabel("Position", fontsize=9)
    ax1.legend(fontsize=8)
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim(y_min, y_max)
    ax1.set_xlim(t_min, t_max)

    # Velocities
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.plot(timestamps, derivatives['Shoulder_Y_Velocity'], label="Shoulder", linewidth=1.5)
    ax2.plot(timestamps, derivatives['Elbow_Y_Velocity'], label="Elbow", linewidth=1.5)
    ax2.plot(timestamps, derivatives['Wrist_Y_Velocity'], label="Wrist", linewidth=1.5)
    ax2.set_title("Vertical Velocity", fontsize=11, pad=10)
    ax2.set_xlabel("Time (s)", fontsize=9)
    ax2.set_ylabel("Velocity", fontsize=9)
    ax2.legend(fontsize=8)
    ax2.grid(True, alpha=0.3)
    ax2.set_ylim(v_min, v_max)
    ax2.set_xlim(t_min, t_max)

    # Accelerations
    ax3 = fig.add_subplot(gs[1, 0])
    ax3.plot(timestamps, derivatives['Shoulder_Y_Acceleration'], label="Shoulder", linewidth=1.5)
    ax3.plot(timestamps, derivatives['Elbow_Y_Acceleration'], label="Elbow", linewidth=1.5)
    ax3.plot(timestamps, derivatives['Wrist_Y_Acceleration'], label="Wrist", linewidth=1.5)
    ax3.set_title("Vertical Acceleration", fontsize=11, pad=10)
    ax3.set_xlabel("Time (s)", fontsize=9)
    ax3.set_ylabel("Acceleration", fontsize=9)
    ax3.legend(fontsize=8)
    ax3.grid(True, alpha=0.3)
    ax3.set_ylim(a_min, a_max)
    ax3.set_xlim(t_min, t_max)

    # 3D trajectory
    ax4 = fig.add_subplot(gs[1, 1], projection="3d")
    ax4.plot(pose_data['Shoulder_X'], pose_data['Shoulder_Y'], pose_data['Shoulder_Z'], 
             label="Shoulder", linewidth=1.5)
    ax4.plot(pose_data['Elbow_X'], pose_data['Elbow_Y'], pose_data['Elbow_Z'], 
             label="Elbow", linewidth=1.5)
    ax4.plot(pose_data['Wrist_X'], pose_data['Wrist_Y'], pose_data['Wrist_Z'], 
             label="Wrist", linewidth=1.5)
    ax4.set_title("3D Trajectory", fontsize=11, pad=10)
    ax4.set_xlabel("X", fontsize=9)
    ax4.set_ylabel("Y", fontsize=9)
    ax4.set_zlabel("Z", fontsize=9)
    ax4.legend(fontsize=8)

    # Save with better DPI and bbox to prevent clipping
    plt.savefig(output_path, dpi=100, bbox_inches='tight')
    plt.close()

    print(f"Saved analysis to: {output_path}")
    print(f"Saved JSON to: {json_path}")
    return 0


if __name__ == "__main__":
    # ALWAYS succeed unless real error
    try:
        video = sys.argv[1]
        output = sys.argv[2]
    except Exception:
        print("Error: Missing arguments. Expected <video_path> <output_path>")
        sys.exit(1)

    exit(analyze_video(video, output))
