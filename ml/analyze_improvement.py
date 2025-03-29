import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
import json
import os

def calculate_range_of_motion(pose_data):
    """Calculate the range of motion for shoulder, elbow, and wrist joints."""
    ranges = {}
    
    for joint in ['Shoulder', 'Elbow', 'Wrist']:
        # Convert lists to numpy arrays
        x = np.array(pose_data[f'{joint}_X'])
        y = np.array(pose_data[f'{joint}_Y'])
        z = np.array(pose_data[f'{joint}_Z'])
        
        # Calculate 3D range of motion
        x_range = np.max(x) - np.min(x)
        y_range = np.max(y) - np.min(y)
        z_range = np.max(z) - np.min(z)
        
        # Calculate total range of motion (Euclidean distance)
        ranges[joint] = float(np.sqrt(x_range**2 + y_range**2 + z_range**2))
    
    return ranges

def calculate_smoothness(pose_data):
    """Calculate the smoothness of movement using jerk (rate of change of acceleration)."""
    smoothness = {}
    
    for joint in ['Shoulder', 'Elbow', 'Wrist']:
        # Convert lists to numpy arrays
        x = np.array(pose_data[f'{joint}_X'])
        y = np.array(pose_data[f'{joint}_Y'])
        z = np.array(pose_data[f'{joint}_Z'])
        time = np.array(pose_data['Timestamp'])
        
        # Calculate acceleration
        acc_x = np.gradient(np.gradient(x, time), time)
        acc_y = np.gradient(np.gradient(y, time), time)
        acc_z = np.gradient(np.gradient(z, time), time)
        
        # Calculate jerk (rate of change of acceleration)
        jerk_x = np.gradient(acc_x, time)
        jerk_y = np.gradient(acc_y, time)
        jerk_z = np.gradient(acc_z, time)
        
        # Calculate total jerk magnitude
        jerk_magnitude = np.sqrt(jerk_x**2 + jerk_y**2 + jerk_z**2)
        
        # Lower jerk means smoother movement
        smoothness[joint] = float(1 / (np.mean(jerk_magnitude) + 1e-6))
    
    return smoothness

def calculate_arm_rotation(pose_data):
    """Calculate how well the arm is rotated (inside facing body)."""
    # Convert lists to numpy arrays
    shoulder_x = np.array(pose_data['Shoulder_X'])
    shoulder_y = np.array(pose_data['Shoulder_Y'])
    shoulder_z = np.array(pose_data['Shoulder_Z'])
    elbow_x = np.array(pose_data['Elbow_X'])
    elbow_y = np.array(pose_data['Elbow_Y'])
    elbow_z = np.array(pose_data['Elbow_Z'])
    wrist_x = np.array(pose_data['Wrist_X'])
    wrist_y = np.array(pose_data['Wrist_Y'])
    wrist_z = np.array(pose_data['Wrist_Z'])
    
    # Calculate vectors for arm segments
    shoulder_to_elbow = np.column_stack([
        elbow_x - shoulder_x,
        elbow_y - shoulder_y,
        elbow_z - shoulder_z
    ])
    
    elbow_to_wrist = np.column_stack([
        wrist_x - elbow_x,
        wrist_y - elbow_y,
        wrist_z - elbow_z
    ])
    
    # Calculate cross product to determine rotation
    cross_product = np.cross(shoulder_to_elbow, elbow_to_wrist)
    
    # Calculate angle between cross product and vertical axis
    vertical = np.array([0, 1, 0])
    angles = np.arccos(np.clip(np.dot(cross_product, vertical) / 
                              (np.linalg.norm(cross_product, axis=1) * np.linalg.norm(vertical)), -1.0, 1.0))
    
    # Convert to degrees and calculate how close to ideal rotation (90 degrees)
    angles_deg = np.degrees(angles)
    rotation_score = 1 - np.abs(angles_deg - 90) / 90
    
    return float(np.mean(rotation_score))

def extract_features(pose_data):
    """Extract all relevant features for improvement analysis."""
    ranges = calculate_range_of_motion(pose_data)
    smoothness = calculate_smoothness(pose_data)
    rotation = calculate_arm_rotation(pose_data)
    
    features = [
        ranges['Shoulder'],
        ranges['Elbow'],
        ranges['Wrist'],
        smoothness['Shoulder'],
        smoothness['Elbow'],
        smoothness['Wrist'],
        rotation
    ]
    
    return features

def calculate_improvement_score(before_value, after_value):
    """Calculate improvement score with proper handling of relative changes."""
    if before_value == 0:
        return 1.0  # No improvement if baseline is 0
    
    # Calculate relative change
    relative_change = (after_value - before_value) / before_value
    
    # Convert to improvement score (0 to 2)
    # 1.0 means no change
    # >1.0 means improvement
    # <1.0 means degradation
    return 1.0 + relative_change

def analyze_improvement(before_data, after_data):
    """Analyze improvement between before and after videos using KNN."""
    # Extract features for both videos
    before_features = extract_features(before_data)
    after_features = extract_features(after_data)
    
    # Calculate improvement scores for each criterion
    improvement_scores = {
        'range_of_motion': {
            'score': calculate_improvement_score(
                (before_features[0] + before_features[1] + before_features[2]) / 3,
                (after_features[0] + after_features[1] + after_features[2]) / 3
            ),
            'details': {
                'shoulder': calculate_improvement_score(before_features[0], after_features[0]),
                'elbow': calculate_improvement_score(before_features[1], after_features[1]),
                'wrist': calculate_improvement_score(before_features[2], after_features[2])
            }
        },
        'smoothness': {
            'score': calculate_improvement_score(
                (before_features[3] + before_features[4] + before_features[5]) / 3,
                (after_features[3] + after_features[4] + after_features[5]) / 3
            ),
            'details': {
                'shoulder': calculate_improvement_score(before_features[3], after_features[3]),
                'elbow': calculate_improvement_score(before_features[4], after_features[4]),
                'wrist': calculate_improvement_score(before_features[5], after_features[5])
            }
        },
        'arm_rotation': {
            'score': calculate_improvement_score(before_features[6], after_features[6]),
            'details': {
                'before': float(before_features[6]),
                'after': float(after_features[6])
            }
        }
    }
    
    # Calculate overall improvement score
    overall_score = (
        improvement_scores['range_of_motion']['score'] +
        improvement_scores['smoothness']['score'] +
        improvement_scores['arm_rotation']['score']
    ) / 3
    
    # Determine improvement status
    improvement_status = {
        'overall_score': float(overall_score),
        'improved': overall_score > 1.0,
        'criteria': {
            'range_of_motion': improvement_scores['range_of_motion']['score'] > 1.0,
            'smoothness': improvement_scores['smoothness']['score'] > 1.0,
            'arm_rotation': improvement_scores['arm_rotation']['score'] > 1.0
        },
        'details': improvement_scores
    }
    
    return improvement_status

def save_analysis_results(improvement_status, output_path):
    """Save the analysis results to a JSON file."""
    with open(output_path, 'w') as f:
        json.dump(improvement_status, f, indent=2)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 4:
        print("Usage: python analyze_improvement.py <before_data.json> <after_data.json> <output_path.json>")
        sys.exit(1)
    
    before_data_path = sys.argv[1]
    after_data_path = sys.argv[2]
    output_path = sys.argv[3]
    
    # Load pose data
    with open(before_data_path, 'r') as f:
        before_data = json.load(f)
    with open(after_data_path, 'r') as f:
        after_data = json.load(f)
    
    # Analyze improvement
    improvement_status = analyze_improvement(before_data, after_data)
    
    # Save results
    save_analysis_results(improvement_status, output_path) 