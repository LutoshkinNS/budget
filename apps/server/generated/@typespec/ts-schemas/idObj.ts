const idObj = {
  "type": "object",
  "required": [
    "id"
  ],
  "properties": {
    "id": {
      "type": "integer"
    }
  },
  "additionalProperties": false
} as const;

export default idObj;