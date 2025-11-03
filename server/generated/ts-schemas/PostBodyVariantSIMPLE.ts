const PostBodyVariantSIMPLE = {
  "type": "object",
  "required": [
    "kind",
    "value"
  ],
  "properties": {
    "kind": {
      "type": "string",
      "enum": [
        "SIMPLE"
      ]
    },
    "value": {
      "type": "object",
      "additionalProperties": false
    }
  },
  "additionalProperties": false
} as const;

export default PostBodyVariantSIMPLE;