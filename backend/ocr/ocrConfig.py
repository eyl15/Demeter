"""
OCR Service Configuration
Modular configuration for different OCR tasks
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Firebase Configuration
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "patient67")
FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "patient67.firebasestorage.app")
FIREBASE_SERVICE_KEY_JSON = os.getenv("FIREBASE_SERVICE_KEY")

# Storage Paths Configuration
STORAGE_PATHS = {
    "root_folder": "",  # No root folder prefix - files are directly under {uid}/
    "images_subfolder": "images",
    "results_collection": "ocr_results",
    # Complete path: {uid}/images/
    # Results path: {uid}/ocr_results/
}

# OCR Processing Configuration
OCR_CONFIGS = {
    "medical_documents": {
        "name": "Medical Document OCR",
        "description": "Extract text from medical documents, prescriptions, lab reports",
        "vision_features": [
            {"type_": "DOCUMENT_TEXT_DETECTION"},
            {"type_": "TEXT_DETECTION"}
        ],
        "language_hints": ["en"],
        "batch_size": 10,  # Process 10 images at a time
        "timeout": 30,  # API call timeout in seconds
        "result_format": "full"  # full, text_only, structured
    },
}

# Result Processing Configuration
RESULT_CONFIGS = {
    "firestore": {
        "enabled": False,  # Disabled - not storing to Firestore
        "collection_path": "users/{uid}/ocr_results",
        "merge": True,  # Merge with existing documents
        "timestamp": True  # Add timestamp field
    },
    
    "json_backup": {
        "enabled": False,  # Disabled by default, enable for local testing
        "output_dir": "./ocr_results",
        "filename_pattern": "{uid}_ocr_results_{timestamp}.json"
    },
    
    "storage_backup": {
        "enabled": True,  # save results back to Firebase Storage
        "path": "{uid}/ocr_results/processed_{timestamp}.json"
    }
}

# Error Handling Configuration
ERROR_HANDLING = {
    "max_retries": 3,
    "retry_delay": 2,  # seconds
    "log_errors": True,
    "raise_on_failure": False  # Continue processing other images if one fails
}

# Logging Configuration
LOGGING_CONFIG = {
    "enabled": True,
    "level": "INFO",  # DEBUG, INFO, WARNING, ERROR
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "console_output": True,
    "file_output": False,  # Set to True to save logs to file
    "log_file": "./ocr_service.log"
}


def validate_firebase_credentials():
    """
    Validate that Firebase credentials are properly configured
    
    Returns:
        Tuple: (is_valid, message)
    """
    if not FIREBASE_SERVICE_KEY_JSON:
        return False, "FIREBASE_SERVICE_KEY not found in environment variables"
    
    try:
        key_data = json.loads(FIREBASE_SERVICE_KEY_JSON)
        required_fields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email']
        missing_fields = [field for field in required_fields if field not in key_data]
        
        if missing_fields:
            return False, f"Firebase service key is missing fields: {', '.join(missing_fields)}"
        
        return True, "Firebase credentials are valid"
    
    except json.JSONDecodeError:
        return False, "FIREBASE_SERVICE_KEY JSON is invalid"
    except Exception as e:
        return False, f"Error validating Firebase credentials: {str(e)}"


def get_firebase_credentials():
    """
    Get parsed Firebase credentials from environment
    
    Returns:
        dict: Parsed Firebase credentials
    """
    if not FIREBASE_SERVICE_KEY_JSON:
        raise ValueError("FIREBASE_SERVICE_KEY not found in environment")
    
    try:
        return json.loads(FIREBASE_SERVICE_KEY_JSON)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse FIREBASE_SERVICE_KEY: {str(e)}")


def get_ocr_config(config_type="medical_documents"):
    """
    Get OCR configuration by type
    
    Args:
        config_type (str): Type of OCR config (medical_documents, receipts, general, handwriting)
    
    Returns:
        dict: OCR configuration
    """
    config = OCR_CONFIGS.get(config_type)
    if not config:
        raise ValueError(f"Unknown OCR config type: {config_type}. Available: {list(OCR_CONFIGS.keys())}")
    return config


def get_storage_path(path_type, uid=None, subfolder=None):
    """
    Build storage paths dynamically
    
    Args:
        path_type (str): Type of path (images, results)
        uid (str): User ID
        subfolder (str): Optional subfolder
    
    Returns:
        str: Formatted storage path
    """
    root = STORAGE_PATHS["root_folder"]
    
    if path_type == "images":
        images_folder = STORAGE_PATHS["images_subfolder"]
        if uid and subfolder:
            # Handle empty root folder
            if root:
                return f"{root}/{uid}/{images_folder}/{subfolder}/"
            else:
                return f"{uid}/{images_folder}/{subfolder}/"
        elif uid:
            if root:
                return f"{root}/{uid}/{images_folder}/"
            else:
                return f"{uid}/{images_folder}/"
        return f"{root}/" if root else ""
    
    elif path_type == "results":
        results_collection = STORAGE_PATHS["results_collection"]
        if uid:
            if root:
                return f"{root}/{uid}/{results_collection}/"
            else:
                return f"{uid}/{results_collection}/"
        return results_collection
    
    else:
        raise ValueError(f"Unknown path type: {path_type}")


if __name__ == "__main__":
    print(" OCR Configuration Validation\n")
    
    # Validate credentials
    is_valid, message = validate_firebase_credentials()
    print(f"Firebase Credentials: {message}")
    
    # Show available configs
    print(f"\n Available OCR Configs:")
    for config_name, config_data in OCR_CONFIGS.items():
        print(f"  - {config_name}: {config_data['description']}")
    
    # Test path generation
    print(f"\n Example Storage Paths:")
    print(f"  Images: {get_storage_path('images', 'test_user', 'medical')}")
    print(f"  Results: {get_storage_path('results', 'test_user')}")
