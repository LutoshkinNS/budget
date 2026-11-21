const UnauthorizedError = {
  "type": "object",
  "required": [
    "message",
    "statusCode"
  ],
  "properties": {
    "message": {
      "type": "string",
      "default": "Требуется действительная авторизация."
    },
    "statusCode": {
      "type": "number",
      "format": "double",
      "default": 401
    }
  },
  "allOf": [
    {
      "type": "object",
      "required": [
        "statusCode",
        "message"
      ],
      "properties": {
        "statusCode": {
          "type": "number",
          "format": "double"
        },
        "message": {
          "type": "string"
        },
        "code": {
          "type": "string",
          "enum": [
            "INVITATION_NOT_FOUND",
            "CATEGORY_ALREADY_EXISTS"
          ]
        }
      }
    }
  ],
  "additionalProperties": false
} as const;

export default UnauthorizedError;