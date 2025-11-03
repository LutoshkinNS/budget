const PostReplyBody = {
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
} as const;

export default PostReplyBody;