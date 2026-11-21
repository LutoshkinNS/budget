const NotFoundError = {
  "type": "object",
  "required": [
    "message",
    "statusCode"
  ],
  "properties": {
    "message": {
      "type": "string",
      "default": "Запрошенный ресурс не найден."
    },
    "statusCode": {
      "type": "number",
      "format": "double",
      "default": 404
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

export default NotFoundError;