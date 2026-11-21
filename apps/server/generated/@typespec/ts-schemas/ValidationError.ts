const ValidationError = {
  "type": "object",
  "required": [
    "message",
    "statusCode"
  ],
  "properties": {
    "message": {
      "type": "string",
      "default": "Некорректные параметры запроса."
    },
    "statusCode": {
      "type": "number",
      "format": "double",
      "default": 400
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

export default ValidationError;