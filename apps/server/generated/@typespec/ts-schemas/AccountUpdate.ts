const AccountUpdate = {
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    }
  },
  "additionalProperties": false
} as const;

export default AccountUpdate;