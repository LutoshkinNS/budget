const InvitationNotFoundError = {
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
        "INVITATION_NOT_FOUND"
      ]
    },
    "message": {
      "type": "string",
      "default": "Приглашение не найдено или уже использовано."
    },
    "statusCode": {
      "type": "number",
      "enum": [
        404
      ]
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

export default InvitationNotFoundError;