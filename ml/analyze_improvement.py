import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
import json
import os
from scipy.stats import wilcoxon

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
    
    # Calculate range of motion for upper arm in each direction
    upper_arm_x_range = np.max(upper_arm_x) - np.min(upper_arm_x)
    upper_arm_y_range = np.max(upper_arm_y) - np.min(upper_arm_y)
    upper_arm_z_range = np.max(upper_arm_z) - np.min(upper_arm_z)
    
    # Calculate the magnitude of movement in each direction
    # Use a weighted sum instead of direct magnitude to reduce sensitivity
    upper_arm_range = (upper_arm_x_range + upper_arm_y_range + upper_arm_z_range) / 3
    ranges['UpperArm'] = float(upper_arm_range)
    
    # Calculate forearm movement (elbow to wrist)
    wrist_x = np.array(pose_data['Wrist_X'])
    wrist_y = np.array(pose_data['Wrist_Y'])
    wrist_z = np.array(pose_data['Wrist_Z'])
    
    # Calculate forearm vector (from elbow to wrist)
    forearm_x = wrist_x - elbow_x
    forearm_y = wrist_y - elbow_y
    forearm_z = wrist_z - elbow_z
    
    # Calculate range of motion for forearm in each direction
    forearm_x_range = np.max(forearm_x) - np.min(forearm_x)
    forearm_y_range = np.max(forearm_y) - np.min(forearm_y)
    forearm_z_range = np.max(forearm_z) - np.min(forearm_z)
    
    # Calculate the magnitude of movement in each direction
    # Use a weighted sum instead of direct magnitude to reduce sensitivity
    forearm_range = (forearm_x_range + forearm_y_range + forearm_z_range) / 3
    ranges['Forearm'] = float(forearm_range)
    
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
    # Calculate summary statistics for improvement scores
    ranges = calculate_range_of_motion(pose_data)
    smoothness = calculate_smoothness(pose_data)
    
    # Extract raw measurements for Wilcoxon test
    # Upper arm vectors
    upper_arm_x = np.array(pose_data['Elbow_X']) - np.array(pose_data['Shoulder_X'])
    upper_arm_y = np.array(pose_data['Elbow_Y']) - np.array(pose_data['Shoulder_Y'])
    upper_arm_z = np.array(pose_data['Elbow_Z']) - np.array(pose_data['Shoulder_Z'])
    
    # Calculate the magnitude of movement at each time point
    # Use a weighted sum instead of direct magnitude
    upper_arm_magnitude = (np.abs(upper_arm_x) + np.abs(upper_arm_y) + np.abs(upper_arm_z)) / 3
    
    # Forearm vectors
    forearm_x = np.array(pose_data['Wrist_X']) - np.array(pose_data['Elbow_X'])
    forearm_y = np.array(pose_data['Wrist_Y']) - np.array(pose_data['Elbow_Y'])
    forearm_z = np.array(pose_data['Wrist_Z']) - np.array(pose_data['Elbow_Z'])
    
    # Calculate the magnitude of movement at each time point
    # Use a weighted sum instead of direct magnitude
    forearm_magnitude = (np.abs(forearm_x) + np.abs(forearm_y) + np.abs(forearm_z)) / 3
    
    # Calculate jerk for smoothness
    time = np.array(pose_data['Timestamp'])
    
    print("\nDebug: Movement magnitudes:")
    print("Upper arm magnitude range:", np.min(upper_arm_magnitude), "to", np.max(upper_arm_magnitude))
    print("Forearm magnitude range:", np.min(forearm_magnitude), "to", np.max(forearm_magnitude))
    
    # Ensure we have enough data points for gradient calculation
    if len(time) < 4:  # Need at least 4 points for jerk calculation
        print("Warning: Not enough time points for jerk calculation")
        upper_arm_jerk = np.zeros_like(upper_arm_magnitude)
        forearm_jerk = np.zeros_like(forearm_magnitude)
    else:
        upper_arm_jerk = np.gradient(np.gradient(np.gradient(upper_arm_magnitude, time), time), time)
        forearm_jerk = np.gradient(np.gradient(np.gradient(forearm_magnitude, time), time), time)
    
    return {
        'summary': {
            'ranges': ranges,
            'smoothness': smoothness
        },
        'raw': {
            'upper_arm_magnitude': upper_arm_magnitude,
            'forearm_magnitude': forearm_magnitude,
            'upper_arm_jerk': upper_arm_jerk,
            'forearm_jerk': forearm_jerk
        }
    }

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
    
    print("\nBefore video data:")
    print("Number of time points:", len(before_data['Timestamp']))
    print("Sample of timestamps:", before_data['Timestamp'][:5])
    
    print("\nAfter video data:")
    print("Number of time points:", len(after_data['Timestamp']))
    print("Sample of timestamps:", after_data['Timestamp'][:5])
    
    # Calculate improvement scores using summary statistics
    improvement_scores = {
        'range_of_motion': {
            'score': calculate_improvement_score(
                (before_features['summary']['ranges']['UpperArm'] + before_features['summary']['ranges']['Forearm']) / 2,
                (after_features['summary']['ranges']['UpperArm'] + after_features['summary']['ranges']['Forearm']) / 2
            ),
            'details': {
                'upper_arm': calculate_improvement_score(before_features['summary']['ranges']['UpperArm'], after_features['summary']['ranges']['UpperArm']),
                'forearm': calculate_improvement_score(before_features['summary']['ranges']['Forearm'], after_features['summary']['ranges']['Forearm'])
            }
        },
        'smoothness': {
            'score': calculate_improvement_score(
                (before_features['summary']['smoothness']['UpperArm'] + before_features['summary']['smoothness']['Forearm']) / 2,
                (after_features['summary']['smoothness']['UpperArm'] + after_features['summary']['smoothness']['Forearm']) / 2
            ),
            'details': {
                'upper_arm': calculate_improvement_score(before_features['summary']['smoothness']['UpperArm'], after_features['summary']['smoothness']['UpperArm']),
                'forearm': calculate_improvement_score(before_features['summary']['smoothness']['Forearm'], after_features['summary']['smoothness']['Forearm'])
            }
        }
    }
    
    # Perform Wilcoxon tests on the raw data
    print("\nPerforming Wilcoxon tests...")
    
    # Ensure arrays are the same length by resampling to the shorter length
    min_length = min(len(before_features['raw']['upper_arm_magnitude']), 
                    len(after_features['raw']['upper_arm_magnitude']))
    
    # Resample arrays to the same length
    before_upper_arm = before_features['raw']['upper_arm_magnitude'][:min_length]
    after_upper_arm = after_features['raw']['upper_arm_magnitude'][:min_length]
    before_forearm = before_features['raw']['forearm_magnitude'][:min_length]
    after_forearm = after_features['raw']['forearm_magnitude'][:min_length]
    
    # Remove any NaN or infinite values
    mask = ~(np.isnan(before_upper_arm) | np.isnan(after_upper_arm) | 
             np.isinf(before_upper_arm) | np.isinf(after_upper_arm))
    before_upper_arm = before_upper_arm[mask]
    after_upper_arm = after_upper_arm[mask]
    
    mask = ~(np.isnan(before_forearm) | np.isnan(after_forearm) | 
             np.isinf(before_forearm) | np.isinf(after_forearm))
    before_forearm = before_forearm[mask]
    after_forearm = after_forearm[mask]
    
    # Perform Wilcoxon tests
    try:
        print("\nDebug: Data shapes for Wilcoxon tests:")
        print("Before upper arm magnitude:", before_upper_arm.shape, "Sample:", before_upper_arm[:5])
        print("After upper arm magnitude:", after_upper_arm.shape, "Sample:", after_upper_arm[:5])
        print("Before forearm magnitude:", before_forearm.shape, "Sample:", before_forearm[:5])
        print("After forearm magnitude:", after_forearm.shape, "Sample:", after_forearm[:5])
        
        # Ensure we have enough data points for the test
        if len(before_upper_arm) < 2 or len(after_upper_arm) < 2:
            raise ValueError("Insufficient data points for upper arm test")
        if len(before_forearm) < 2 or len(after_forearm) < 2:
            raise ValueError("Insufficient data points for forearm test")
            
        # Calculate differences for debugging
        upper_arm_diff = after_upper_arm - before_upper_arm
        forearm_diff = after_forearm - before_forearm
        print("\nDebug: Mean differences:")
        print("Upper arm mean difference:", np.mean(upper_arm_diff))
        print("Forearm mean difference:", np.mean(forearm_diff))
        
        # Perform Wilcoxon tests with two-sided alternative
        # This will detect any significant difference, not just improvement
        upper_arm_test = wilcoxon(before_upper_arm, after_upper_arm, zero_method='wilcox')
        forearm_test = wilcoxon(before_forearm, after_forearm, zero_method='wilcox')
        
        print("\nDebug: Wilcoxon test results:")
        print("Upper arm test:", upper_arm_test)
        print("Forearm test:", forearm_test)
        
        # Add smoothness tests
        print("\nDebug: Smoothness data shapes:")
        print("Before upper arm jerk:", before_features['raw']['upper_arm_jerk'].shape)
        print("After upper arm jerk:", after_features['raw']['upper_arm_jerk'].shape)
        print("Before forearm jerk:", before_features['raw']['forearm_jerk'].shape)
        print("After forearm jerk:", after_features['raw']['forearm_jerk'].shape)
        
        # Ensure arrays are the same length for smoothness tests
        min_length = min(len(before_features['raw']['upper_arm_jerk']), 
                        len(after_features['raw']['upper_arm_jerk']))
        
        before_upper_jerk = before_features['raw']['upper_arm_jerk'][:min_length]
        after_upper_jerk = after_features['raw']['upper_arm_jerk'][:min_length]
        before_fore_jerk = before_features['raw']['forearm_jerk'][:min_length]
        after_fore_jerk = after_features['raw']['forearm_jerk'][:min_length]
        
        # Remove any NaN or infinite values from jerk data
        mask = ~(np.isnan(before_upper_jerk) | np.isnan(after_upper_jerk) | 
                 np.isinf(before_upper_jerk) | np.isinf(after_upper_jerk))
        before_upper_jerk = before_upper_jerk[mask]
        after_upper_jerk = after_upper_jerk[mask]
        
        mask = ~(np.isnan(before_fore_jerk) | np.isnan(after_fore_jerk) | 
                 np.isinf(before_fore_jerk) | np.isinf(after_fore_jerk))
        before_fore_jerk = before_fore_jerk[mask]
        after_fore_jerk = after_fore_jerk[mask]
        
        print("\nDebug: Cleaned jerk data shapes:")
        print("Upper arm jerk:", before_upper_jerk.shape, after_upper_jerk.shape)
        print("Forearm jerk:", before_fore_jerk.shape, after_fore_jerk.shape)
        
        # For smoothness, we want to test if after < before (less jerk means more smooth)
        upper_arm_smoothness_test = wilcoxon(before_upper_jerk, after_upper_jerk, zero_method='wilcox', alternative='greater')
        forearm_smoothness_test = wilcoxon(before_fore_jerk, after_fore_jerk, zero_method='wilcox', alternative='greater')
        
        print("\nDebug: Smoothness test results:")
        print("Upper arm smoothness test:", upper_arm_smoothness_test)
        print("Forearm smoothness test:", forearm_smoothness_test)
        
        wilcoxon_results = {
            'range_of_motion': {
                'upper_arm': {
                    'statistic': float(upper_arm_test.statistic),
                    'p_value': float(upper_arm_test.pvalue),
                    'significant': bool(upper_arm_test.pvalue < 0.05)
                },
                'forearm': {
                    'statistic': float(forearm_test.statistic),
                    'p_value': float(forearm_test.pvalue),
                    'significant': bool(forearm_test.pvalue < 0.05)
                }
            },
            'smoothness': {
                'upper_arm': {
                    'statistic': float(upper_arm_smoothness_test.statistic),
                    'p_value': float(upper_arm_smoothness_test.pvalue),
                    'significant': bool(upper_arm_smoothness_test.pvalue < 0.05)
                },
                'forearm': {
                    'statistic': float(forearm_smoothness_test.statistic),
                    'p_value': float(forearm_smoothness_test.pvalue),
                    'significant': bool(forearm_smoothness_test.pvalue < 0.05)
                }
            }
        }
    except Exception as e:
        print(f"Error in Wilcoxon test: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        wilcoxon_results = {
            'range_of_motion': {
                'upper_arm': {
                    'statistic': 0.0,
                    'p_value': 1.0,
                    'significant': False
                },
                'forearm': {
                    'statistic': 0.0,
                    'p_value': 1.0,
                    'significant': False
                }
            },
            'smoothness': {
                'upper_arm': {
                    'statistic': 0.0,
                    'p_value': 1.0,
                    'significant': False
                },
                'forearm': {
                    'statistic': 0.0,
                    'p_value': 1.0,
                    'significant': False
                }
            }
        }

    # Determine overall improvement status
    overall_score = (improvement_scores['range_of_motion']['score'] + improvement_scores['smoothness']['score']) / 2
    improved = overall_score > 1.0

    # Create the final improvement status with explicit type conversion
    improvement_status = {
        'overall_score': float(overall_score),
        'improved': bool(improved),
        'criteria': {
            'range_of_motion': bool(improvement_scores['range_of_motion']['score'] > 1.0),
            'smoothness': bool(improvement_scores['smoothness']['score'] > 1.0)
        },
        'details': {
            'range_of_motion': {
                'score': float(improvement_scores['range_of_motion']['score']),
                'details': {
                    'upper_arm': float(improvement_scores['range_of_motion']['details']['upper_arm']),
                    'forearm': float(improvement_scores['range_of_motion']['details']['forearm'])
                }
            },
            'smoothness': {
                'score': float(improvement_scores['smoothness']['score']),
                'details': {
                    'upper_arm': float(improvement_scores['smoothness']['details']['upper_arm']),
                    'forearm': float(improvement_scores['smoothness']['details']['forearm'])
                }
            }
        },
        'statistics': wilcoxon_results,
        'before_summary': before_features['summary'], #per video summary
        'after_summary': after_features['summary']
    }

    return improvement_status

def save_analysis_results(improvement_status, output_path):
    """Save the analysis results to a JSON file."""
    # Convert any remaining NumPy types to Python native types
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

    # Convert all NumPy types to Python native types
    improvement_status = convert_numpy_types(improvement_status)
    
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