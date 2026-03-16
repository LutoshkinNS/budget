const AccountInvitation = {
  "type": "object",
  "required": [
    "id",
    "code",
    "accountId",
    "expiresAt"
  ],
  "properties": {
    "id": {
      "type": "integer",
      "minimum": 1
    },
    "code": {
      "type": "string"
    },
    "accountId": {
      "type": "integer",
      "minimum": 1
    },
    "expiresAt": {
      "type": "string",
      "format": "date-time"
    },
    "usedAt": {
      "type": "string",
      "format": "date-time"
    },
    "usedBy": {
      "type": "integer",
      "minimum": 1
    }
  },
  "additionalProperties": false
} as const;

export default AccountInvitation;