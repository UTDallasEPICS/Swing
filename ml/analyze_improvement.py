import numpy as np
import json
from scipy import stats

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
    # Handle NaN values
    if np.isnan(before_value) or np.isnan(after_value):
        return 1.0  # Return neutral score for invalid values
    
    if before_value == 0:
        return 1.0  # No improvement if baseline is 0
    
    # Calculate relative change
    relative_change = (after_value - before_value) / before_value
    
    # Convert to improvement score (0 to 2)
    # 1.0 means no change
    # >1.0 means improvement
    # <1.0 means degradation
    return 1.0 + relative_change

def perform_wilcoxon_test(before_values, after_values):
    """Perform Wilcoxon signed-rank test on paired values."""
    # Ensure values are numpy arrays
    before_values = np.array(before_values)
    after_values = np.array(after_values)
    
    # If we have different numbers of swings, we need to handle this differently
    if len(before_values) != len(after_values):
        # Calculate mean values for each set
        before_mean = np.mean(before_values)
        after_mean = np.mean(after_values)
        
        # Calculate improvement score
        improvement = calculate_improvement_score(before_mean, after_mean)
        
        # For statistical significance, we'll use a simple t-test
        # This is a reasonable approximation when we have different sample sizes
        t_stat, p_value = stats.ttest_ind(before_values, after_values)
        
        return {
            'statistic': float(t_stat),
            'p_value': float(p_value),
            'significant': p_value < 0.05,
            'improvement': improvement
        }
    
    # If we have the same number of swings, use Wilcoxon test
    statistic, p_value = stats.wilcoxon(before_values, after_values)
    
    return {
        'statistic': float(statistic),
        'p_value': float(p_value),
        'significant': p_value < 0.05,
        'improvement': calculate_improvement_score(np.mean(before_values), np.mean(after_values))
    }

def detect_swings(pose_data):
    """Detect individual arm swings in the video."""
    # Calculate elbow position in 3D
    elbow_x = np.array(pose_data['Elbow_X'])
    elbow_y = np.array(pose_data['Elbow_Y'])
    elbow_z = np.array(pose_data['Elbow_Z'])
    
    # Calculate elbow velocity
    time = np.array(pose_data['Timestamp'])
    elbow_velocity = np.sqrt(
        np.gradient(elbow_x, time)**2 +
        np.gradient(elbow_y, time)**2 +
        np.gradient(elbow_z, time)**2
    )
    
    # Find peaks in velocity (swing starts)
    from scipy.signal import find_peaks
    
    # Use a lower threshold to detect more movements
    velocity_threshold = np.mean(elbow_velocity) + 0.2 * np.std(elbow_velocity)  # Reduced from 0.5 to 0.2
    peaks, peak_heights = find_peaks(elbow_velocity, height=velocity_threshold, distance=15)  # Reduced from 30 to 15
    
    # Group frames into swings
    swings = []
    for i in range(len(peaks) - 1):
        start_frame = peaks[i]
        end_frame = peaks[i + 1]
        
        # Only include swings that have enough frames
        if end_frame - start_frame >= 10:  # Minimum 10 frames per swing
            swing_data = {
                'start_frame': start_frame,
                'end_frame': end_frame,
                'frames': range(start_frame, end_frame),
                'peak_velocity': float(peak_heights['peak_heights'][i])
            }
            swings.append(swing_data)
    
    # If no swings detected, try with an even lower threshold
    if not swings:
        velocity_threshold = np.mean(elbow_velocity)  # Use mean as threshold
        peaks, peak_heights = find_peaks(elbow_velocity, height=velocity_threshold, distance=10)
        
        for i in range(len(peaks) - 1):
            start_frame = peaks[i]
            end_frame = peaks[i + 1]
            
            if end_frame - start_frame >= 10:
                swing_data = {
                    'start_frame': start_frame,
                    'end_frame': end_frame,
                    'frames': range(start_frame, end_frame),
                    'peak_velocity': float(peak_heights['peak_heights'][i])
                }
                swings.append(swing_data)
    
    return swings

def analyze_swing(pose_data, swing):
    """Analyze a single arm swing."""
    frames = swing['frames']
    
    # Extract joint positions for this swing
    shoulder_x = np.array([pose_data['Shoulder_X'][i] for i in frames])
    shoulder_y = np.array([pose_data['Shoulder_Y'][i] for i in frames])
    shoulder_z = np.array([pose_data['Shoulder_Z'][i] for i in frames])
    elbow_x = np.array([pose_data['Elbow_X'][i] for i in frames])
    elbow_y = np.array([pose_data['Elbow_Y'][i] for i in frames])
    elbow_z = np.array([pose_data['Elbow_Z'][i] for i in frames])
    wrist_x = np.array([pose_data['Wrist_X'][i] for i in frames])
    wrist_y = np.array([pose_data['Wrist_Y'][i] for i in frames])
    wrist_z = np.array([pose_data['Wrist_Z'][i] for i in frames])
    time = np.array([pose_data['Timestamp'][i] for i in frames])
    
    # Calculate range of motion for this swing
    rom = {
        'shoulder': np.sqrt(np.sum(np.square([
            shoulder_x,
            shoulder_y,
            shoulder_z
        ]), axis=0)),
        'elbow': np.sqrt(np.sum(np.square([
            elbow_x,
            elbow_y,
            elbow_z
        ]), axis=0)),
        'wrist': np.sqrt(np.sum(np.square([
            wrist_x,
            wrist_y,
            wrist_z
        ]), axis=0))
    }
    
    # Calculate smoothness (jerk) for this swing
    jerk = {
        'shoulder': np.abs(np.gradient(np.gradient(np.gradient(shoulder_x, time), time), time)),
        'elbow': np.abs(np.gradient(np.gradient(np.gradient(elbow_x, time), time), time)),
        'wrist': np.abs(np.gradient(np.gradient(np.gradient(wrist_x, time), time), time))
    }
    
    # Calculate arm rotation for this swing
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
    
    cross_product = np.cross(shoulder_to_elbow, elbow_to_wrist)
    vertical = np.array([0, 1, 0])
    angles = np.arccos(np.clip(np.dot(cross_product, vertical) / 
                              (np.linalg.norm(cross_product, axis=1) * np.linalg.norm(vertical)), -1.0, 1.0))
    rotation = np.degrees(angles)
    
    # Handle NaN values in calculations
    def safe_float(value):
        return float(0.0) if np.isnan(value) else float(value)
    
    def safe_mean(values):
        mean_val = np.mean(values)
        return safe_float(mean_val)
    
    def safe_ptp(values):
        ptp_val = np.ptp(values)
        return safe_float(ptp_val)
    
    return {
        'range_of_motion': {
            'shoulder': safe_ptp(rom['shoulder']),
            'elbow': safe_ptp(rom['elbow']),
            'wrist': safe_ptp(rom['wrist'])
        },
        'smoothness': {
            'shoulder': safe_float(1 / (safe_mean(jerk['shoulder']) + 1e-6)),
            'elbow': safe_float(1 / (safe_mean(jerk['elbow']) + 1e-6)),
            'wrist': safe_float(1 / (safe_mean(jerk['wrist']) + 1e-6))
        },
        'arm_rotation': safe_float(np.mean(1 - np.abs(rotation - 90) / 90))
    }

def analyze_improvement(before_data, after_data):
    """Analyze improvement between before and after videos using swing-based analysis."""
    # Detect swings in both videos
    before_swings = detect_swings(before_data)
    after_swings = detect_swings(after_data)
    
    # Print debugging information
    print(f"Detected {len(before_swings)} swings in 'before' video")
    print(f"Detected {len(after_swings)} swings in 'after' video")
    
    if before_swings:
        print(f"Before video swing velocities: {[s['peak_velocity'] for s in before_swings]}")
    if after_swings:
        print(f"After video swing velocities: {[s['peak_velocity'] for s in after_swings]}")
    
    # Analyze each swing
    before_analysis = [analyze_swing(before_data, swing) for swing in before_swings]
    after_analysis = [analyze_swing(after_data, swing) for swing in after_swings]
    
    # Print more debugging information
    if before_analysis:
        print("\nBefore video analysis:")
        print(f"Range of motion: {[s['range_of_motion']['shoulder'] for s in before_analysis]}")
        print(f"Smoothness: {[s['smoothness']['shoulder'] for s in before_analysis]}")
        print(f"Arm rotation: {[s['arm_rotation'] for s in before_analysis]}")
    
    if after_analysis:
        print("\nAfter video analysis:")
        print(f"Range of motion: {[s['range_of_motion']['shoulder'] for s in after_analysis]}")
        print(f"Smoothness: {[s['smoothness']['shoulder'] for s in after_analysis]}")
        print(f"Arm rotation: {[s['arm_rotation'] for s in after_analysis]}")
    
    # Handle empty swing lists
    if not before_swings or not after_swings:
        print("\nWarning: No swings detected in one or both videos")
        return {
            'overall_score': 1.0,
            'improved': False,
            'criteria': {
                'range_of_motion': False,
                'smoothness': False,
                'arm_rotation': False
            },
            'details': {
                'range_of_motion': {'score': 1.0, 'details': {'shoulder': 1.0, 'elbow': 1.0, 'wrist': 1.0}},
                'smoothness': {'score': 1.0, 'details': {'shoulder': 1.0, 'elbow': 1.0, 'wrist': 1.0}},
                'arm_rotation': {'score': 1.0, 'details': {'before': 0.0, 'after': 0.0}}
            },
            'statistics': {
                'range_of_motion': {'shoulder': {'statistic': 0.0, 'p_value': 1.0, 'significant': False},
                                  'elbow': {'statistic': 0.0, 'p_value': 1.0, 'significant': False},
                                  'wrist': {'statistic': 0.0, 'p_value': 1.0, 'significant': False}},
                'smoothness': {'shoulder': {'statistic': 0.0, 'p_value': 1.0, 'significant': False},
                             'elbow': {'statistic': 0.0, 'p_value': 1.0, 'significant': False},
                             'wrist': {'statistic': 0.0, 'p_value': 1.0, 'significant': False}},
                'arm_rotation': {'statistic': 0.0, 'p_value': 1.0, 'significant': False}
            },
            'swing_count': {'before': 0, 'after': 0}
        }
    
    # Calculate improvement scores for each criterion
    improvement_scores = {
        'range_of_motion': {
            'score': calculate_improvement_score(
                np.nanmean([s['range_of_motion']['shoulder'] for s in before_analysis]),
                np.nanmean([s['range_of_motion']['shoulder'] for s in after_analysis])
            ),
            'details': {
                'shoulder': calculate_improvement_score(
                    np.nanmean([s['range_of_motion']['shoulder'] for s in before_analysis]),
                    np.nanmean([s['range_of_motion']['shoulder'] for s in after_analysis])
                ),
                'elbow': calculate_improvement_score(
                    np.nanmean([s['range_of_motion']['elbow'] for s in before_analysis]),
                    np.nanmean([s['range_of_motion']['elbow'] for s in after_analysis])
                ),
                'wrist': calculate_improvement_score(
                    np.nanmean([s['range_of_motion']['wrist'] for s in before_analysis]),
                    np.nanmean([s['range_of_motion']['wrist'] for s in after_analysis])
                )
            }
        },
        'smoothness': {
            'score': calculate_improvement_score(
                np.nanmean([s['smoothness']['shoulder'] for s in before_analysis]),
                np.nanmean([s['smoothness']['shoulder'] for s in after_analysis])
            ),
            'details': {
                'shoulder': calculate_improvement_score(
                    np.nanmean([s['smoothness']['shoulder'] for s in before_analysis]),
                    np.nanmean([s['smoothness']['shoulder'] for s in after_analysis])
                ),
                'elbow': calculate_improvement_score(
                    np.nanmean([s['smoothness']['elbow'] for s in before_analysis]),
                    np.nanmean([s['smoothness']['elbow'] for s in after_analysis])
                ),
                'wrist': calculate_improvement_score(
                    np.nanmean([s['smoothness']['wrist'] for s in after_analysis]),
                    np.nanmean([s['smoothness']['wrist'] for s in after_analysis])
                )
            }
        },
        'arm_rotation': {
            'score': calculate_improvement_score(
                np.nanmean([s['arm_rotation'] for s in before_analysis]),
                np.nanmean([s['arm_rotation'] for s in after_analysis])
            ),
            'details': {
                'before': float(np.nanmean([s['arm_rotation'] for s in before_analysis])),
                'after': float(np.nanmean([s['arm_rotation'] for s in after_analysis]))
            }
        }
    }
    
    # Print improvement scores
    print("\nImprovement scores:")
    print(f"Range of motion: {improvement_scores['range_of_motion']['score']}")
    print(f"Smoothness: {improvement_scores['smoothness']['score']}")
    print(f"Arm rotation: {improvement_scores['arm_rotation']['score']}")
    
    # Calculate overall improvement score
    overall_score = (
        improvement_scores['range_of_motion']['score'] +
        improvement_scores['smoothness']['score'] +
        improvement_scores['arm_rotation']['score']
    ) / 3
    
    # Handle NaN in overall score
    if np.isnan(overall_score):
        overall_score = 1.0
    
    print(f"Overall score: {overall_score}")
    
    # Perform Wilcoxon tests for each metric using swing-based data
    wilcoxon_results = {
        'range_of_motion': {
            'shoulder': perform_wilcoxon_test(
                [s['range_of_motion']['shoulder'] for s in before_analysis],
                [s['range_of_motion']['shoulder'] for s in after_analysis]
            ),
            'elbow': perform_wilcoxon_test(
                [s['range_of_motion']['elbow'] for s in before_analysis],
                [s['range_of_motion']['elbow'] for s in after_analysis]
            ),
            'wrist': perform_wilcoxon_test(
                [s['range_of_motion']['wrist'] for s in before_analysis],
                [s['range_of_motion']['wrist'] for s in after_analysis]
            )
        },
        'smoothness': {
            'shoulder': perform_wilcoxon_test(
                [s['smoothness']['shoulder'] for s in before_analysis],
                [s['smoothness']['shoulder'] for s in after_analysis]
            ),
            'elbow': perform_wilcoxon_test(
                [s['smoothness']['elbow'] for s in before_analysis],
                [s['smoothness']['elbow'] for s in after_analysis]
            ),
            'wrist': perform_wilcoxon_test(
                [s['smoothness']['wrist'] for s in before_analysis],
                [s['smoothness']['wrist'] for s in after_analysis]
            )
        },
        'arm_rotation': {
            'overall': perform_wilcoxon_test(
                [s['arm_rotation'] for s in before_analysis],
                [s['arm_rotation'] for s in after_analysis]
            )
        }
    }
    
    # Print Wilcoxon test results
    print("\nWilcoxon test results:")
    for metric, results in wilcoxon_results.items():
        for joint, result in results.items():
            print(f"{metric} - {joint}: p={result['p_value']:.4f}, significant={result['significant']}, improvement={result['improvement']:.2f}")
    
    # Determine improvement status
    improvement_status = {
        'overall_score': float(overall_score),
        'improved': overall_score > 1.0,
        'criteria': {
            'range_of_motion': improvement_scores['range_of_motion']['score'] > 1.0,
            'smoothness': improvement_scores['smoothness']['score'] > 1.0,
            'arm_rotation': improvement_scores['arm_rotation']['score'] > 1.0
        },
        'details': improvement_scores,
        'statistics': wilcoxon_results,
        'swing_count': {
            'before': len(before_swings),
            'after': len(after_swings)
        }
    }
    
    return improvement_status

def convert_to_serializable(obj):
    """Convert NumPy types to Python native types for JSON serialization."""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    return obj

def save_analysis_results(improvement_status, output_path):
    """Save the analysis results to a JSON file."""
    # Convert NumPy types to Python native types
    serializable_status = convert_to_serializable(improvement_status)
    with open(output_path, 'w') as f:
        json.dump(serializable_status, f, indent=2)

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