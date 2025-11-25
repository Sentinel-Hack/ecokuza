# Tree Records API Documentation

## Endpoints

### Create Tree Record (Plant New Tree)
**POST** `/trees/records/`

Create a new tree record with photo and metadata.

**Request (multipart/form-data):**
```json
{
  "record_type": "plant",  // or "update"
  "species": "Mango",
  "tree_type": "fruit",
  "location_description": "Near the main gate",
  "latitude": 1.2345,      // optional, captured from GPS
  "longitude": -0.5678,    // optional, captured from GPS
  "photo": <image_file>,   // required
  "notes": "Healthy sapling"  // optional
}
```

**Response:**
```json
{
  "id": 1,
  "user": 2,
  "user_email": "testuser@example.com",
  "record_type": "plant",
  "record_type_display": "Plant New Tree",
  "species": "Mango",
  "tree_type": "fruit",
  "tree_type_display": "Fruit Tree",
  "location_description": "Near the main gate",
  "latitude": 1.2345,
  "longitude": -0.5678,
  "photo": "/media/trees/2025/11/25/photo.jpg",
  "photo_datetime_original": "2025-11-25T12:30:45Z",
  "photo_datetime_digitized": "2025-11-25T12:30:45Z",
  "photo_datetime": "2025-11-25T12:30:45Z",
  "notes": "Healthy sapling",
  "created_at": "2025-11-25T12:31:00Z",
  "updated_at": "2025-11-25T12:31:00Z"
}
```

### List User's Tree Records
**GET** `/trees/records/`

Get all tree records for the authenticated user.

**Response:**
```json
[
  { ... tree record objects ... }
]
```

### Get Specific Tree Record
**GET** `/trees/records/{id}/`

Get a specific tree record by ID.

### Update Tree Record
**PATCH** `/trees/records/{id}/`

Update a tree record.

### Delete Tree Record
**DELETE** `/trees/records/{id}/`

Delete a tree record.

### Get EXIF Metadata
**GET** `/trees/records/{id}/exif_metadata/`

Get detailed EXIF metadata (DateTimeOriginal, DateTimeDigitized, DateTime) for a specific tree record.

**Response:**
```json
{
  "id": 1,
  "photo": "/media/trees/2025/11/25/photo.jpg",
  "exif_data": {
    "DateTimeOriginal": "2025-11-25T12:30:45Z",
    "DateTimeDigitized": "2025-11-25T12:30:45Z",
    "DateTime": "2025-11-25T12:30:45Z"
  },
  "record_created_at": "2025-11-25T12:31:00Z"
}
```

### Get User Statistics
**GET** `/trees/records/statistics/`

Get statistics about user's tree records.

**Response:**
```json
{
  "total_records": 25,
  "plant_records": 20,
  "update_records": 5,
  "species_count": 12,
  "tree_types": {
    "fruit": 10,
    "timber": 8,
    "medicinal": 7
  }
}
```

## Authentication
All endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Tree Types
- `fruit` - Fruit Tree
- `timber` - Timber Tree
- `medicinal` - Medicinal Tree
- `ornamental` - Ornamental Tree
- `windbreak` - Windbreak
- `shade` - Shade Tree
- `nitrogen_fixer` - Nitrogen Fixer
- `other` - Other

## Record Types
- `plant` - Plant New Tree
- `update` - Update Tree Progress

## EXIF Data
The backend automatically extracts three datetime fields from the phone camera EXIF data:
- **DateTimeOriginal** - Original photo capture time
- **DateTimeDigitized** - When image was digitized
- **DateTime** - File modification time
