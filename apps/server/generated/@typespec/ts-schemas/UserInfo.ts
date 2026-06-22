const UserInfo = {
  "type": "object",
  "required": [
    "userId",
    "currentAccountId",
    "accounts"
  ],
  "properties": {
    "userId": {
      "type": "integer",
      "minimum": 1
    },
    "currentAccountId": {
      "type": "integer",
      "minimum": 1
    },
    "accounts": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "id",
          "name",
          "initialBalance",
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
          "initialBalance": {
            "type": "number",
            "format": "double"
          },
          "isOwner": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
} as const;

export default UserInfo;