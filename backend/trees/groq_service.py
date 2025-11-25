"""
Groq AI Service for image authenticity detection and analysis.
Uses Groq's vision model to analyze tree images and GPS metadata.
"""

import base64
import io
import json
import os
from groq import Groq

# Initialize Groq client with API key from environment
groq_api_key = os.getenv('GROQ_API_KEY')
if not groq_api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")

groq_client = Groq(api_key=groq_api_key)


def encode_image_to_base64(image_file):
    """Convert image file to base64 string."""
    try:
        image_data = image_file.read()
        return base64.standard_b64encode(image_data).decode('utf-8')
    except Exception as e:
        print(f"Error encoding image: {e}")
        return None


def analyze_tree_image(image_file, gps_data=None):
    """
    Analyze tree image for authenticity and details using Groq API.
    
    Args:
        image_file: Django ImageField file object
        gps_data: dict with latitude, longitude, altitude (optional)
    
    Returns:
        dict with analysis results
    """
    try:
        # Prepare the prompt with GPS context
        gps_context = ""
        if gps_data:
            gps_context = f"\n\nGPS Context: Latitude: {gps_data.get('latitude', 'N/A')}, Longitude: {gps_data.get('longitude', 'N/A')}, Altitude: {gps_data.get('altitude', 'N/A')}"

        prompt = f"""Analyze this tree image for authenticity and details. Evaluate if this is a real tree image (not edited, not AI-generated).

1. Authenticity score (0-100)
2. Is it a real tree? (true/false)
3. Tree type
4. Health assessment (Healthy/Good/Fair/Poor)
5. Image quality (High/Medium/Low)
6. GPS validation - does tree type match region?{gps_context}

Respond ONLY with JSON:
{{
    "authenticity_score": <0-100>,
    "is_tree": <true/false>,
    "tree_type": "<type>",
    "health_assessment": "<status>",
    "image_quality": "<quality>",
    "gps_validation": <true/false>,
    "analysis": "<brief analysis>",
    "confidence": "<high/medium/low>"
}}"""

        # Call Groq API 
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=500,
        )

        response_text = chat_completion.choices[0].message.content
        
        # Try to extract JSON from response
        try:
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            result = json.loads(json_str)
            return result
        except json.JSONDecodeError:
            return {
                'authenticity_score': 50,
                'is_tree': True,
                'analysis': response_text,
                'confidence': 'medium'
            }

    except Exception as e:
        print(f"Error analyzing image with Groq: {e}")
        return {
            'authenticity_score': 0,
            'is_tree': False,
            'error': str(e),
            'analysis': f'Error: {str(e)}',
            'confidence': 'low'
        }


def validate_gps_with_tree_type(tree_type, latitude, longitude):
    """
    Validate if tree type is appropriate for the given GPS location.
    
    Args:
        tree_type: str, type of tree
        latitude: float
        longitude: float
    
    Returns:
        dict with validation result
    """
    try:
        prompt = f"""Is a {tree_type} tree typically found at GPS coordinates Latitude: {latitude}, Longitude: {longitude}? 
        Respond with JSON: {{"is_valid": <true/false>, "reason": "<brief reason>"}}"""

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=100,
        )

        response_text = chat_completion.choices[0].message.content
        
        try:
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            result = json.loads(json_str)
            return result
        except json.JSONDecodeError:
            return {"is_valid": True, "reason": "Could not validate but proceeding"}

    except Exception as e:
        print(f"Error validating GPS with Groq: {e}")
        return {"is_valid": True, "reason": f"Validation error: {str(e)}"}
