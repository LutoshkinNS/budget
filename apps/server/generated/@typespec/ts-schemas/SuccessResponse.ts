const SuccessResponse = {
  "type": "object",
  "required": [
    "success"
  ],
  "properties": {
    "success": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
} as const;

export default SuccessResponse;