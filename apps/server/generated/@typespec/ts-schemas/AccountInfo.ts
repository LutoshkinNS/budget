const AccountInfo = {
  "type": "object",
  "required": [
    "id",
    "name",
    "isOwner"
  ],
  "properties": {
    "id": {
      "type": "integer",
      "minimum": 1
    },
    "name": {
      "type": "string"
    },
    "isOwner": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
} as const;

export default AccountInfo;