const ForbiddenError = {
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
        "FORBIDDEN"
      ]
    },
    "message": {
      "type": "string"
    },
    "statusCode": {
      "type": "number",
      "enum": [
        403
      ]
    }
  },
  "additionalProperties": false
} as const;

export default ForbiddenError;