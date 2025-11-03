const PostBodyVariantREPLY = {
  "type": "object",
  "required": [
    "kind",
    "value"
  ],
  "properties": {
    "kind": {
      "type": "string",
      "enum": [
        "REPLY"
      ]
    },
    "value": {
      "type": "object",
      "required": [
        "replyId"
      ],
      "properties": {
        "replyId": {
          "type": "integer"
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
} as const;

export default PostBodyVariantREPLY;