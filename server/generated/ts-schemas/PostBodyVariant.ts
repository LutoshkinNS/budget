const PostBodyVariant = {
  "type": "object",
  "oneOf": [
    {
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
    },
    {
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
    },
    {
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
    }
  ],
  "discriminator": {
    "propertyName": "kind"
  }
} as const;

export default PostBodyVariant;