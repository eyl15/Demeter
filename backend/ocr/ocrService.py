"""
OCR Service - Modular service for text extraction from images
"""

import io
import json
import logging
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from google.cloud import vision_v1
from google.cloud.vision_v1 import types
import firebase_admin
from firebase_admin import credentials, storage, firestore

from ocrConfig import (
    get_firebase_credentials,
    get_ocr_config,
    get_storage_path,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    RESULT_CONFIGS,
    ERROR_HANDLING,
    LOGGING_CONFIG
)


class OCRService:
    """
    Modular OCR Service class for processing images with Google Cloud Vision API
    """
    
    def __init__(self, config_type="medical_documents"):
        """
        Initialize OCR Service
        
        Args:
            config_type (str): Type of OCR configuration to use
        """
        self.config_type = config_type
        self.config = get_ocr_config(config_type)
        
        # Setup logging
        self._setup_logging()
        
        # Initialize Firebase
        self._initialize_firebase()
        
        # Initialize Vision API client
        self.vision_client = vision_v1.ImageAnnotatorClient()
        
        self.logger.info(f" OCRService initialized with config: {self.config['name']}")
    
    
    def _setup_logging(self):
        """Setup logging based on configuration"""
        log_config = LOGGING_CONFIG
        
        if not log_config['enabled']:
            self.logger = logging.getLogger('ocr_service_disabled')
            self.logger.disabled = True
            return
        
        # Create logger
        self.logger = logging.getLogger('ocr_service')
        self.logger.setLevel(getattr(logging, log_config['level']))
        
        # Clear existing handlers
        self.logger.handlers.clear()
        
        # Console handler
        if log_config['console_output']:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(logging.Formatter(log_config['format']))
            self.logger.addHandler(console_handler)
        
        # File handler
        if log_config['file_output']:
            file_handler = logging.FileHandler(log_config['log_file'])
            file_handler.setFormatter(logging.Formatter(log_config['format']))
            self.logger.addHandler(file_handler)
    
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK and set up credentials for Vision API"""
        import os
        import tempfile
        
        # Get credentials
        self.cred_dict = get_firebase_credentials()
        
        # Write credentials to temporary file for Vision API
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(self.cred_dict, f)
            self.cred_file = f.name
        
        # Set environment variable for Vision API to use
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = self.cred_file
        
        # Initialize or get Firebase app
        try:
            firebase_admin.get_app()
            self.logger.info("Using existing Firebase app")
        except ValueError:
            cred = credentials.Certificate(self.cred_dict)
            firebase_admin.initialize_app(cred, {
                'storageBucket': FIREBASE_STORAGE_BUCKET,
                'projectId': FIREBASE_PROJECT_ID
            })
            self.logger.info(f"Initialized Firebase: {FIREBASE_PROJECT_ID}")
        
        # Get Firebase services
        self.bucket = storage.bucket()
        if RESULT_CONFIGS['firestore']['enabled']:
            self.db = firestore.client()
        else:
            self.db = None
    
    
    def list_user_images(self, uid: str, subfolder: Optional[str] = None) -> List[str]:
        """
        List all images for a user
        
        Args:
            uid (str): User ID
            subfolder (str): Optional subfolder within images/
        
        Returns:
            List[str]: List of image file paths
        """
        prefix = get_storage_path('images', uid, subfolder)
        self.logger.info(f"Listing images with prefix: {prefix}")
        
        blobs = self.bucket.list_blobs(prefix=prefix)
        image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp')
        
        image_paths = [
            blob.name for blob in blobs 
            if blob.name.lower().endswith(image_extensions)
        ]
        
        self.logger.info(f"Found {len(image_paths)} images for user {uid}")
        return image_paths
    
    
    def extract_text_from_image(self, image_path: str) -> Dict:
        """
        Extract text from a single image in Firebase Storage
        
        Args:
            image_path (str): Path to image in Firebase Storage
        
        Returns:
            Dict: Extracted text and metadata
        """
        try:
            self.logger.info(f"Processing image: {image_path}")
            
            # Download image from Firebase Storage
            blob = self.bucket.blob(image_path)
            image_bytes = blob.download_as_bytes()
            
            # Prepare Vision API request
            image = types.Image(content=image_bytes)
            
            # Use config to determine features
            features = [
                types.Feature(type_=types.Feature.Type[feature['type_']])
                for feature in self.config['vision_features']
            ]
            
            # Create request with language hints
            image_context = types.ImageContext(
                language_hints=self.config.get('language_hints', ['en'])
            )
            
            request = types.AnnotateImageRequest(
                image=image,
                features=features,
                image_context=image_context
            )
            
            # Call Vision API
            response = self.vision_client.annotate_image(request)
            
            # Check for errors
            if response.error.message:
                raise Exception(f"Vision API error: {response.error.message}")
            
            # Format result based on config
            result_format = self.config.get('result_format', 'full')
            result = self._format_ocr_result(response, image_path, result_format)
            
            self.logger.info(f" Successfully processed: {image_path}")
            return result
        
        except Exception as e:
            self.logger.error(f" Error processing {image_path}: {str(e)}")
            
            if ERROR_HANDLING['raise_on_failure']:
                raise
            
            return {
                'file_path': image_path,
                'success': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    
    def _format_ocr_result(self, response, image_path: str, result_format: str) -> Dict:
        """
        Format OCR result based on configuration
        
        Args:
            response: Vision API response
            image_path (str): Original image path
            result_format (str): Format type (full, text_only, structured)
        
        Returns:
            Dict: Formatted result
        """
        base_result = {
            'file_path': image_path,
            'success': True,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if result_format == 'text_only':
            # Just return the full text
            full_text = response.full_text_annotation.text if response.full_text_annotation else ""
            base_result['text'] = full_text
            base_result['text_length'] = len(full_text)
        
        elif result_format == 'structured':
            # Return structured data with text blocks
            full_text = response.full_text_annotation.text if response.full_text_annotation else ""
            text_blocks = []
            
            for page in response.full_text_annotation.pages:
                for block in page.blocks:
                    block_text = ""
                    for paragraph in block.paragraphs:
                        for word in paragraph.words:
                            word_text = "".join([symbol.text for symbol in word.symbols])
                            block_text += word_text + " "
                    
                    text_blocks.append({
                        'text': block_text.strip(),
                        'confidence': block.confidence
                    })
            
            base_result.update({
                'full_text': full_text,
                'text_blocks': text_blocks,
                'num_blocks': len(text_blocks)
            })
        
        else:  # full format
            # Return complete OCR data
            full_text = response.full_text_annotation.text if response.full_text_annotation else ""
            text_blocks = []
            text_annotations = []
            
            # Extract text annotations
            for annotation in response.text_annotations:
                text_annotations.append({
                    'description': annotation.description,
                    'confidence': getattr(annotation, 'confidence', None)
                })
            
            # Extract detailed block structure
            if response.full_text_annotation:
                for page in response.full_text_annotation.pages:
                    for block in page.blocks:
                        block_text = ""
                        words = []
                        
                        for paragraph in block.paragraphs:
                            for word in paragraph.words:
                                word_text = "".join([symbol.text for symbol in word.symbols])
                                block_text += word_text + " "
                                words.append({
                                    'text': word_text,
                                    'confidence': word.confidence
                                })
                        
                        text_blocks.append({
                            'text': block_text.strip(),
                            'confidence': block.confidence,
                            'words': words,
                            'num_words': len(words)
                        })
            
            base_result.update({
                'full_text': full_text,
                'text_length': len(full_text),
                'text_blocks': text_blocks,
                'text_annotations': text_annotations,
                'num_blocks': len(text_blocks),
                'num_annotations': len(text_annotations)
            })
        
        return base_result
    
    
    def process_user_images(self, uid: str, subfolder: Optional[str] = None, 
                           max_images: Optional[int] = None) -> List[Dict]:
        """
        Process all images for a user
        
        Args:
            uid (str): User ID
            subfolder (str): Optional subfolder within images/
            max_images (int): Optional limit on number of images to process
        
        Returns:
            List[Dict]: List of OCR results
        """
        self.logger.info(f" Starting batch processing for user: {uid}")
        
        # Get list of images
        image_paths = self.list_user_images(uid, subfolder)
        
        if not image_paths:
            self.logger.warning(f"No images found for user {uid}")
            return []
        
        # Limit number of images if specified
        if max_images:
            image_paths = image_paths[:max_images]
        
        # Process images in batches
        batch_size = self.config.get('batch_size', 10)
        results = []
        
        for i in range(0, len(image_paths), batch_size):
            batch = image_paths[i:i + batch_size]
            self.logger.info(f"Processing batch {i//batch_size + 1}: {len(batch)} images")
            
            for image_path in batch:
                result = self.extract_text_from_image(image_path)
                results.append(result)
        
        self.logger.info(f" Completed processing {len(results)} images for user {uid}")
        return results
    
    
    def save_results_to_firestore(self, uid: str, results: List[Dict]) -> bool:
        """
        Save OCR results to Firestore
        
        Args:
            uid (str): User ID
            results (List[Dict]): OCR results to save
        
        Returns:
            bool: Success status
        """
        if not RESULT_CONFIGS['firestore']['enabled']:
            self.logger.info("Firestore saving is disabled in config")
            return False
        
        try:
            collection_path = RESULT_CONFIGS['firestore']['collection_path'].format(uid=uid)
            merge = RESULT_CONFIGS['firestore']['merge']
            add_timestamp = RESULT_CONFIGS['firestore']['timestamp']
            
            self.logger.info(f"Saving {len(results)} results to Firestore: {collection_path}")
            
            # Reference to user's OCR results collection
            collection_ref = self.db.collection('users').document(uid).collection('ocr_results')
            
            # Save each result as a separate document
            for idx, result in enumerate(results):
                doc_id = f"ocr_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{idx}"
                
                # Create a copy of the result to avoid modifying the original
                result_to_save = result.copy()
                
                if add_timestamp:
                    result_to_save['saved_at'] = firestore.SERVER_TIMESTAMP
                
                if merge:
                    collection_ref.document(doc_id).set(result_to_save, merge=True)
                else:
                    collection_ref.document(doc_id).set(result_to_save)
            
            self.logger.info(f" Successfully saved results to Firestore")
            return True
        
        except Exception as e:
            self.logger.error(f" Error saving to Firestore: {str(e)}")
            return False
    
    
    def save_results_to_json(self, uid: str, results: List[Dict]) -> Optional[str]:
        """
        Save OCR results to local JSON file (for backup/testing)
        
        Args:
            uid (str): User ID
            results (List[Dict]): OCR results to save
        
        Returns:
            Optional[str]: Path to saved JSON file, or None if disabled
        """
        if not RESULT_CONFIGS['json_backup']['enabled']:
            self.logger.info("JSON backup is disabled in config")
            return None
        
        try:
            import os
            
            output_dir = RESULT_CONFIGS['json_backup']['output_dir']
            os.makedirs(output_dir, exist_ok=True)
            
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            filename_pattern = RESULT_CONFIGS['json_backup']['filename_pattern']
            filename = filename_pattern.format(uid=uid, timestamp=timestamp)
            
            filepath = os.path.join(output_dir, filename)
            
            with open(filepath, 'w') as f:
                json.dump({
                    'uid': uid,
                    'timestamp': timestamp,
                    'num_results': len(results),
                    'config_type': self.config_type,
                    'results': results
                }, f, indent=2)
            
            self.logger.info(f" Saved JSON backup to: {filepath}")
            return filepath
        
        except Exception as e:
            self.logger.error(f" Error saving JSON backup: {str(e)}")
            return None
    
    
    def process_and_save(self, uid: str, subfolder: Optional[str] = None, 
                        max_images: Optional[int] = None) -> Tuple[List[Dict], bool]:
        """
        Complete workflow: process images and save results
        
        Args:
            uid (str): User ID
            subfolder (str): Optional subfolder within images/
            max_images (int): Optional limit on number of images
        
        Returns:
            Tuple[List[Dict], bool]: (results, success_status)
        """
        self.logger.info(f"🚀 Starting complete OCR workflow for user: {uid}")
        
        # Process images
        results = self.process_user_images(uid, subfolder, max_images)
        
        if not results:
            self.logger.warning("No results to save")
            return results, False
        
        # Save to Firestore
        firestore_success = self.save_results_to_firestore(uid, results)
        
        # Save JSON backup if enabled
        self.save_results_to_json(uid, results)
        
        self.logger.info(f" OCR workflow complete for user {uid}")
        # Return True if OCR processing succeeded, regardless of storage status
        return results, True


# Convenience function for quick processing
def process_user_ocr(uid: str, config_type: str = "medical_documents", 
                     subfolder: Optional[str] = None) -> List[Dict]:
    """
    Quick helper function to process OCR for a user
    
    Args:
        uid (str): User ID
        config_type (str): OCR configuration type
        subfolder (str): Optional subfolder
    
    Returns:
        List[Dict]: OCR results
    """
    service = OCRService(config_type=config_type)
    results, _ = service.process_and_save(uid, subfolder)
    return results


if __name__ == "__main__":
    import argparse
    import sys
    
    # CLI argument parser
    parser = argparse.ArgumentParser(description='OCR Service - Extract text from images')
    parser.add_argument('--uid', type=str, required=True, help='User ID')
    parser.add_argument('--config-type', type=str, default='medical_documents',
                       choices=['medical_documents', 'receipts', 'general', 'handwriting'],
                       help='OCR configuration type')
    parser.add_argument('--subfolder', type=str, help='Subfolder within images/')
    parser.add_argument('--max-images', type=int, help='Maximum number of images to process')
    parser.add_argument('--test', action='store_true', help='Run in test mode (just list images)')
    
    args = parser.parse_args()
    
    try:
        # Initialize service
        service = OCRService(config_type=args.config_type)
        
        if args.test:
            # Test mode: just list images
            images = service.list_user_images(args.uid, args.subfolder)
            result = {
                'success': True,
                'test_mode': True,
                'uid': args.uid,
                'num_images': len(images),
                'images': images
            }
        else:
            # Process images and save results
            results, success = service.process_and_save(
                uid=args.uid,
                subfolder=args.subfolder,
                max_images=args.max_images
            )
            
            result = {
                'success': success,
                'uid': args.uid,
                'config_type': args.config_type,
                'num_results': len(results),
                'results': results
            }
        
        # Output JSON for Node.js to parse
        print(json.dumps(result, indent=2))
        sys.exit(0)
    
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        sys.exit(1)
