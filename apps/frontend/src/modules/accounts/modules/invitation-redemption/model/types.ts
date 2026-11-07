export type InvitationRedemptionProps = {
  code: string;
  onAuthenticationRequired(): void;
  onRedeemed(): void;
};
