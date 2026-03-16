const SwitchAccountRequest = {
  "type": "object",
  "required": [
    "accountId"
  ],
  "properties": {
    "accountId": {
      "type": "integer",
      "minimum": 1
    }
  },
  "additionalProperties": false
} as const;

export default SwitchAccountRequest;