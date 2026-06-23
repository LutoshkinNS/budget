const AccountUpdate = {
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "initialBalance": {
      "type": "number",
      "format": "double"
    }
  },
  "additionalProperties": false
} as const;

export default AccountUpdate;