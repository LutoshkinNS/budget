const PostTravelBody = {
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
} as const;

export default PostTravelBody;