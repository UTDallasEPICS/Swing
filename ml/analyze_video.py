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
        sys.exit(1)

    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps
    
    print(f"Video properties: {fps} FPS, {frame_count} frames, {duration:.2f} seconds")
    
    # Adjust frame skip based on video duration
    if duration > 30:  # For videos longer than 30 seconds
        frame_skip = 5
    else:
        frame_skip = 3
    
    print(f"Using frame skip of {frame_skip}")
    
    # Process the video
    with mp_pose.Pose(
        model_complexity=1,  # Use lighter model
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        enable_segmentation=False  # Disable segmentation for speed
    ) as pose:
        frame_idx = 0
        processed_frames = 0
        start_time = time.time()
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Skip frames
            if frame_idx % frame_skip != 0:
                frame_idx += 1
                continue

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
                processed_frames += 1
            
            frame_idx += 1
            
            # Log progress every 100 frames
            if frame_idx % 100 == 0:
                elapsed = time.time() - start_time
                print(f"Processed {frame_idx}/{frame_count} frames ({frame_idx/frame_count*100:.1f}%) in {elapsed:.1f}s")

    cap.release()
    total_time = time.time() - start_time
    print(f"Video processing completed in {total_time:.1f}s. Processed {processed_frames} frames.")

    # Convert pose data to numpy arrays
    pose_data = {key: np.array(value).tolist() for key, value in pose_data.items()}

    # Save pose data as JSON with proper type conversion
    json_path = output_path.replace('.png', '.json')
    with open(json_path, 'w') as f:
        # Convert all numpy types to Python native types
        def convert_numpy_types(obj):
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.bool_):
                return bool(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, dict):
                return {key: convert_numpy_types(value) for key, value in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(item) for item in obj]
            return obj

        # Convert all values to native Python types
        pose_data = convert_numpy_types(pose_data)
        json.dump(pose_data, f)

    # Convert pose data back to numpy arrays for plotting
    pose_data = {key: np.array(value) for key, value in pose_data.items()}

    # Extract time and validate
    timestamps = pose_data['Timestamp']
    if len(timestamps) < 2:
        raise ValueError("Insufficient data points for processing after cleaning.")

    # Function to compute velocity and acceleration
    def compute_derivatives(position, timestamps):
        if len(position) < 2 or len(timestamps) < 2:
            raise ValueError("Insufficient data points for derivative computation.")
        velocity = np.gradient(position, timestamps)
        acceleration = np.gradient(velocity, timestamps)
        return velocity, acceleration

    # Calculate derivatives only for essential coordinates (Y-axis for vertical movement)
    derivatives = {}
    for joint in ['Shoulder', 'Elbow', 'Wrist']:
        pos = pose_data[f'{joint}_Y']
        v, a = compute_derivatives(pos, timestamps)
        derivatives[f'{joint}_Y_Velocity'] = v
        derivatives[f'{joint}_Y_Acceleration'] = a

    # Create a simplified analysis plot with only essential data
    fig = plt.figure(figsize=(8, 8))  # Reduced from 10x10

    # Plot vertical positions
    plt.subplot(2, 2, 1)
    plt.plot(timestamps[::2], pose_data['Shoulder_Y'][::2], label='Shoulder', linewidth=1)
    plt.plot(timestamps[::2], pose_data['Elbow_Y'][::2], label='Elbow', linewidth=1)
    plt.plot(timestamps[::2], pose_data['Wrist_Y'][::2], label='Wrist', linewidth=1)
    plt.title('Vertical Position')
    plt.xlabel('Time (s)')
    plt.ylabel('Position')
    plt.legend()
    plt.grid(True, alpha=0.3)  # Reduced grid opacity

    # Plot vertical velocities
    plt.subplot(2, 2, 2)
    plt.plot(timestamps[::2], derivatives['Shoulder_Y_Velocity'][::2], label='Shoulder', linewidth=1)
    plt.plot(timestamps[::2], derivatives['Elbow_Y_Velocity'][::2], label='Elbow', linewidth=1)
    plt.plot(timestamps[::2], derivatives['Wrist_Y_Velocity'][::2], label='Wrist', linewidth=1)
    plt.title('Vertical Velocity')
    plt.xlabel('Time (s)')
    plt.ylabel('Velocity')
    plt.legend()
    plt.grid(True, alpha=0.3)

    # Plot vertical accelerations
    plt.subplot(2, 2, 3)
    plt.plot(timestamps[::2], derivatives['Shoulder_Y_Acceleration'][::2], label='Shoulder', linewidth=1)
    plt.plot(timestamps[::2], derivatives['Elbow_Y_Acceleration'][::2], label='Elbow', linewidth=1)
    plt.plot(timestamps[::2], derivatives['Wrist_Y_Acceleration'][::2], label='Wrist', linewidth=1)
    plt.title('Vertical Acceleration')
    plt.xlabel('Time (s)')
    plt.ylabel('Acceleration')
    plt.legend()
    plt.grid(True, alpha=0.3)

    # Plot 3D trajectory with reduced points
    ax = fig.add_subplot(2, 2, 4, projection='3d')
    ax.plot(pose_data['Shoulder_X'][::4], pose_data['Shoulder_Y'][::4], pose_data['Shoulder_Z'][::4], 
            label='Shoulder', linewidth=1)
    ax.plot(pose_data['Elbow_X'][::4], pose_data['Elbow_Y'][::4], pose_data['Elbow_Z'][::4], 
            label='Elbow', linewidth=1)
    ax.plot(pose_data['Wrist_X'][::4], pose_data['Wrist_Y'][::4], pose_data['Wrist_Z'][::4], 
            label='Wrist', linewidth=1)
    ax.set_title('3D Trajectory')
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    ax.legend()

    # Save the plot with reduced DPI and simplified style
    plt.tight_layout()
    plt.savefig(output_path, dpi=80, bbox_inches='tight')  # Reduced DPI from 100 to 80
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