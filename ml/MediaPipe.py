#TODO Actually call KNN, Kreg, and Kmeans in program. I have not actually called the algorithms in the program.
#TODO check on mediapipe's own analysis code that can do the ML itself.
#TODO look at the diagram to see what needs to be implemented.


import cv2 as cv 
import mediapipe as mp
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neighbors import KNeighborsRegressor
from sklearn.cluster import KMeans

# User selects which arm(s) to track
arm_selection = input("Select arm tracking mode ('left', 'right', 'both'): ").strip().lower()
anomaly_method = input("Select anomaly detection method ('StdDev, 'IsoFor', 'KNN', 'KReg, Kmeans'): ").strip().lower()

# Initialize Mediapipe and drawing utilities
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

arm_data = {
    'Timestamp': [],
    'Shoulder': [],
    'Elbow': [],
    'Wrist': []
}
angle_data = {"right": [], "left": []}
timestamp_data = {"right": [], "left": []}
anomaly_flags = {"right": [], "left": []}

#video_path = "/Users/rubenvipin/Downloads/IMG_1145.MOV"  # VIDEO SOURCE (CHANGE THIS)
cap = cv.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

# Initialize Types of ML Algorithms
iso_forest = IsolationForest(n_estimators=100, contamination=0.02, random_state=42)
knn = KNeighborsClassifier(n_neighbors=2, weights='distance', metric ='euclidean')
kreg = KNeighborsRegressor()
kmeans = KMeans(n_clusters=2, random_state=42)

##########################################################################################################################################################################

# Process the video
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break  # Exit if no frame is read

    # Convert BGR to RGB
    image = cv.cvtColor(frame, cv.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = pose.process(image)

    image = cv.cvtColor(image, cv.COLOR_RGB2BGR)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark
        h, w, _ = image.shape

        # Function to extract coordinates and calculate angle
        def get_arm_angle(side):
            timestamp = cap.get(cv.CAP_PROP_POS_MSEC) / 1000  # Convert to seconds
            shoulder = landmarks[getattr(mp_pose.PoseLandmark, f"{side.upper()}_SHOULDER").value]
            elbow = landmarks[getattr(mp_pose.PoseLandmark, f"{side.upper()}_ELBOW").value]
            wrist = landmarks[getattr(mp_pose.PoseLandmark, f"{side.upper()}_WRIST").value]

            print("Shoulder: ", shoulder)
            print("Elbow: ", elbow)
            print("Wrist: ", wrist)    

            # Append data to the dictionary
            arm_data['Timestamp'].append(timestamp)
            arm_data['Shoulder'].append((shoulder.x, shoulder.y, shoulder.z))
            arm_data['Elbow'].append((elbow.x, elbow.y, elbow.z))
            arm_data['Wrist'].append((wrist.x, wrist.y, wrist.z))

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

                #TODO: Does not recognize anamolies
                elif anomaly_method.lower() == "KNN":
                    # Fit KNN on the data
                    #knn.fit(X, np.zeros(len(X)))  # Use dummy labels (e.g., all zeros)
                    knn.fit(X, np.zeros(len(X)))  # Use dummy labels (e.g., all zeros)
        
                    # Calculate distances to the nearest neighbors
                    distances = knn.kneighbors([[angle]])
                    max_distance = np.max(distances)  # Maximum distance to the nearest neighbors
        
                    # Define a threshold for anomalies (e.g., based on the 95th percentile of distances)
                    threshold = np.percentile(distances, 95) or np.percentile(distances, 15)
                    anomaly = knn.predict([[angle]])[0] > threshold
                
                #TODO: Does not recognize anamolies
                elif anomaly_method.lower() == "KReg":
                    kreg.fit(X, X)
                    anomaly = kreg.predict([[angle]])[0] != angle

                elif anomaly_method.lower() == "KMeans":
                    kmeans.fit(X)
                    anomaly = kmeans.predict([[angle]])[0] == -1
                    

        # Store anomaly flag
        anomaly_flags[arm].append(1 if anomaly else 0)

        # Define color based on anomaly detection
        color = (0, 255, 0) if not anomaly else (0, 0, 255)  # Green for normal, Red for anomaly

        # Overlay the information on the video
        cv.putText(image, f"{arm.capitalize()} Angle: {int(angle)}°", 
                (elbow_px[0] - 50, elbow_px[1] - 20), 
                cv.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # Draw detected joints and connections
        cv.line(image, shoulder_px, elbow_px, (255, 0, 0), 2)
        cv.line(image, elbow_px, wrist_px, (255, 0, 0), 2)
        cv.circle(image, elbow_px, 5, color, -1)  # Mark anomaly in red

    # Show the real-time feed
    cv.imshow('Arm Swing Detection with Anomalies', image)

    # Break on 'q' key press
    if cv.waitKey(10) & 0xFF == ord('q'):
        break

cap.release()
cv.destroyAllWindows()

###############################################################################################################################################################################################

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