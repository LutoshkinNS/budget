const ValidationError = {
  "type": "object",
  "required": [
    "code",
    "message",
    "statusCode"
  ],
  "properties": {
    "code": {
      "type": "string",
      "enum": [
        "VALIDATION_ERROR"
      ]
    },
    "message": {
      "type": "string"
    },
    "statusCode": {
      "type": "number",
      "enum": [
        400
      ]
    }
  },
  "additionalProperties": false
} as const;

export default ValidationError;