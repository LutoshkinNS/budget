const PostBody = {
  "type": "object",
  "required": [
    "url",
    "title",
    "content",
    "categoryId",
    "variant"
  ],
  "properties": {
    "url": {
      "type": "string",
      "minLength": 5,
      "maxLength": 16,
      "pattern": "^[a-zA-Z0-9-]*$"
    },
    "title": {
      "type": "string",
      "minLength": 5,
      "maxLength": 32
    },
    "content": {
      "type": "string",
      "minLength": 10,
      "maxLength": 8192
    },
    "categoryId": {
      "type": "integer"
    },
    "variant": {
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
    }
  },
  "additionalProperties": false
} as const;

export default PostBody;