const PostBodyVariantTRAVEL = {
  "type": "object",
  "required": [
    "kind",
    "value"
  ],
  "properties": {
    "kind": {
      "type": "string",
      "enum": [
        "TRAVEL"
      ]
    },
    "value": {
      "type": "object",
      "required": [
        "lat",
        "lng"
      ],
      "properties": {
        "lat": {
          "type": "number"
        },
        "lng": {
          "type": "number"
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
} as const;

export default PostBodyVariantTRAVEL;