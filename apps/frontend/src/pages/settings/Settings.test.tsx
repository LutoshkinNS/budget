import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Settings } from "./Settings.tsx";

vi.mock("@/modules/accounts", () => ({
  AccountsSelect: () => null,
  InviteToAccount: () => null,
  RenameAccount: () => null,
}));

vi.mock("@/modules/auth", () => ({
  Logout: () => <button type="button">Выйти</button>,
}));

describe("Settings", () => {
  afterEach(cleanup);

  it("shows a logout control", () => {
    render(<Settings />);

    expect(screen.getByRole("button", { name: "Выйти" })).not.toBeNull();
  });
});
