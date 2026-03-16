const RedeemInvitationRequest = {
  "type": "object",
  "required": [
    "code"
  ],
  "properties": {
    "code": {
      "type": "string"
    }
  },
  "additionalProperties": false
} as const;

export default RedeemInvitationRequest;