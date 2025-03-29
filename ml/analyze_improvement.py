import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
import json
import os

def calculate_range_of_motion(pose_data):
    """Calculate the range of motion for upper arm and forearm segments."""
    ranges = {}
    
    # Calculate upper arm movement (shoulder to elbow)
    shoulder_x = np.array(pose_data['Shoulder_X'])
    shoulder_y = np.array(pose_data['Shoulder_Y'])
    shoulder_z = np.array(pose_data['Shoulder_Z'])
    elbow_x = np.array(pose_data['Elbow_X'])
    elbow_y = np.array(pose_data['Elbow_Y'])
    elbow_z = np.array(pose_data['Elbow_Z'])
    
    # Calculate upper arm vector (from shoulder to elbow)
    upper_arm_x = elbow_x - shoulder_x
    upper_arm_y = elbow_y - shoulder_y
    upper_arm_z = elbow_z - shoulder_z
    
    # Calculate range of motion for upper arm
    upper_arm_x_range = np.max(upper_arm_x) - np.min(upper_arm_x)
    upper_arm_y_range = np.max(upper_arm_y) - np.min(upper_arm_y)
    upper_arm_z_range = np.max(upper_arm_z) - np.min(upper_arm_z)
    ranges['UpperArm'] = float(np.sqrt(upper_arm_x_range**2 + upper_arm_y_range**2 + upper_arm_z_range**2))
    
    # Calculate forearm movement (elbow to wrist)
    wrist_x = np.array(pose_data['Wrist_X'])
    wrist_y = np.array(pose_data['Wrist_Y'])
    wrist_z = np.array(pose_data['Wrist_Z'])
    
    # Calculate forearm vector (from elbow to wrist)
    forearm_x = wrist_x - elbow_x
    forearm_y = wrist_y - elbow_y
    forearm_z = wrist_z - elbow_z
    
    # Calculate range of motion for forearm
    forearm_x_range = np.max(forearm_x) - np.min(forearm_x)
    forearm_y_range = np.max(forearm_y) - np.min(forearm_y)
    forearm_z_range = np.max(forearm_z) - np.min(forearm_z)
    ranges['Forearm'] = float(np.sqrt(forearm_x_range**2 + forearm_y_range**2 + forearm_z_range**2))
    
    return ranges

def calculate_smoothness(pose_data):
    """Calculate the smoothness of movement using jerk (rate of change of acceleration) for arm segments.
    Higher jerk means less smooth movement, so we invert the calculation."""
    smoothness = {}
    
    # Calculate upper arm smoothness (shoulder to elbow)
    shoulder_x = np.array(pose_data['Shoulder_X'])
    shoulder_y = np.array(pose_data['Shoulder_Y'])
    shoulder_z = np.array(pose_data['Shoulder_Z'])
    elbow_x = np.array(pose_data['Elbow_X'])
    elbow_y = np.array(pose_data['Elbow_Y'])
    elbow_z = np.array(pose_data['Elbow_Z'])
    time = np.array(pose_data['Timestamp'])
    
    # Calculate upper arm vector (from shoulder to elbow)
    upper_arm_x = elbow_x - shoulder_x
    upper_arm_y = elbow_y - shoulder_y
    upper_arm_z = elbow_z - shoulder_z
    
    # Calculate acceleration for upper arm
    acc_x = np.gradient(np.gradient(upper_arm_x, time), time)
    acc_y = np.gradient(np.gradient(upper_arm_y, time), time)
    acc_z = np.gradient(np.gradient(upper_arm_z, time), time)
    
    # Calculate jerk for upper arm
    jerk_x = np.gradient(acc_x, time)
    jerk_y = np.gradient(acc_y, time)
    jerk_z = np.gradient(acc_z, time)
    
    # Calculate total jerk magnitude for upper arm
    jerk_magnitude = np.sqrt(jerk_x**2 + jerk_y**2 + jerk_z**2)
    # Higher jerk means less smooth movement, so we use negative jerk
    smoothness['UpperArm'] = float(-np.mean(jerk_magnitude))
    
    # Calculate forearm smoothness (elbow to wrist)
    wrist_x = np.array(pose_data['Wrist_X'])
    wrist_y = np.array(pose_data['Wrist_Y'])
    wrist_z = np.array(pose_data['Wrist_Z'])
    
    # Calculate forearm vector (from elbow to wrist)
    forearm_x = wrist_x - elbow_x
    forearm_y = wrist_y - elbow_y
    forearm_z = wrist_z - elbow_z
    
    # Calculate acceleration for forearm
    acc_x = np.gradient(np.gradient(forearm_x, time), time)
    acc_y = np.gradient(np.gradient(forearm_y, time), time)
    acc_z = np.gradient(np.gradient(forearm_z, time), time)
    
    # Calculate jerk for forearm
    jerk_x = np.gradient(acc_x, time)
    jerk_y = np.gradient(acc_y, time)
    jerk_z = np.gradient(acc_z, time)
    
    # Calculate total jerk magnitude for forearm
    jerk_magnitude = np.sqrt(jerk_x**2 + jerk_y**2 + jerk_z**2)
    # Higher jerk means less smooth movement, so we use negative jerk
    smoothness['Forearm'] = float(-np.mean(jerk_magnitude))
    
    return smoothness

def extract_features(pose_data):
    """Extract all relevant features for improvement analysis."""
    ranges = calculate_range_of_motion(pose_data)
    smoothness = calculate_smoothness(pose_data)
    
    features = [
        ranges['UpperArm'],
        ranges['Forearm'],
        smoothness['UpperArm'],
        smoothness['Forearm']
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
    """Analyze improvement between before and after videos."""
    # Extract features for both videos
    before_features = extract_features(before_data)
    after_features = extract_features(after_data)
    
    # Calculate improvement scores for each criterion
    improvement_scores = {
        'range_of_motion': {
            'score': calculate_improvement_score(
                (before_features[0] + before_features[1]) / 2,  # Average of upper arm and forearm
                (after_features[0] + after_features[1]) / 2
            ),
            'details': {
                'upper_arm': calculate_improvement_score(before_features[0], after_features[0]),
                'forearm': calculate_improvement_score(before_features[1], after_features[1])
            }
        },
        'smoothness': {
            'score': calculate_improvement_score(
                (before_features[2] + before_features[3]) / 2,  # Average of upper arm and forearm smoothness
                (after_features[2] + after_features[3]) / 2
            ),
            'details': {
                'upper_arm': calculate_improvement_score(before_features[2], after_features[2]),
                'forearm': calculate_improvement_score(before_features[3], after_features[3])
            }
        }
    }
    
    return {
        'criteria': {
            'range_of_motion': improvement_scores['range_of_motion']['score'] > 1.0,
            'smoothness': improvement_scores['smoothness']['score'] > 1.0
        },
        'details': improvement_scores
    }

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