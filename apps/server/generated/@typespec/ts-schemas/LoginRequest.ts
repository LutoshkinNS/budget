const LoginRequest = {
  "type": "object",
  "required": [
    "id",
    "first_name",
    "auth_date",
    "hash"
  ],
  "properties": {
    "id": {
      "type": "integer",
      "minimum": 1
    },
    "first_name": {
      "type": "string"
    },
    "last_name": {
      "type": "string"
    },
    "username": {
      "type": "string"
    },
    "photo_url": {
      "type": "string"
    },
    "auth_date": {
      "type": "integer",
      "minimum": 1
    },
    "hash": {
      "type": "string"
    }
  },
  "additionalProperties": false
} as const;

export default LoginRequest;