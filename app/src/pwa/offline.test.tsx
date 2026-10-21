// @vitest-environment jsdom
import { it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { DeviceError } from "../components/DeviceError";
import { en } from "../localization/strings";
it("a missing offline model has an actionable failure state", () => {
  const old = Object.getOwnPropertyDescriptor(navigator, "onLine");
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    value: false,
  });
  try {
    render(<DeviceError issue="model" t={en} />);
    expect(
      screen.getByText(/This AI model is unavailable offline/),
    ).toBeTruthy();
  } finally {
    cleanup();
    if (old) Object.defineProperty(navigator, "onLine", old);
    else Reflect.deleteProperty(navigator, "onLine");
  }
});
