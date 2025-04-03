import cv2
import mediapipe as mp
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import numpy as np

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

video_path = "\Users\admin\Pictures\Camera Roll"  # VIDEO SOURCE (CHANGE THIS)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

# Process the video
with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break  # Exit if no frame is read

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

            # Render the pose annotations
            mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        cv2.imshow('Mediapipe Feed', frame)

        # Break on 'q' key press
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()

# Convert pose data to numpy arrays
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

# Function to create 4D plots
def plot_4d(x, y, z, time, title, ax, color_label='Time'):
    scatter = ax.scatter(x, y, z, c=time, cmap='viridis', s=20, alpha=0.8)
    ax.plot(x, y, z, color='gray', linewidth=0.5, alpha=0.5)
    ax.set_title(title)
    ax.set_xlabel('X Coordinate')
    ax.set_ylabel('Y Coordinate')
    ax.set_zlabel('Z Coordinate')
    cbar = plt.colorbar(scatter, ax=ax, pad=0.1)
    cbar.set_label(color_label)

# Plot positions, velocities, and accelerations
fig = plt.figure(figsize=(18, 18))

for i, joint in enumerate(['Shoulder', 'Elbow', 'Wrist'], start=1):
    ax_pos = fig.add_subplot(3, 3, i, projection='3d')
    plot_4d(pose_data[f'{joint}_X'], pose_data[f'{joint}_Y'], pose_data[f'{joint}_Z'], time,
            f'{joint} Position', ax_pos)

    ax_vel = fig.add_subplot(3, 3, i + 3, projection='3d')
    plot_4d(derivatives[f'{joint}_X_Velocity'], derivatives[f'{joint}_Y_Velocity'], derivatives[f'{joint}_Z_Velocity'], time,
            f'{joint} Velocity', ax_vel, color_label='Velocity Magnitude')

    ax_acc = fig.add_subplot(3, 3, i + 6, projection='3d')
    plot_4d(derivatives[f'{joint}_X_Acceleration'], derivatives[f'{joint}_Y_Acceleration'], derivatives[f'{joint}_Z_Acceleration'], time,
            f'{joint} Acceleration', ax_acc, color_label='Acceleration Magnitude')

# Final adjustments and display
plt.tight_layout()
fig.savefig('C:\Users\admin\Pictures\Camera Roll', dpi=300) # GRAPH SAVE LOCATION (CHANGE THIS)
plt.pause(0.1)  # Brief pause for GUI event loop stabilization
plt.show(block=True)
