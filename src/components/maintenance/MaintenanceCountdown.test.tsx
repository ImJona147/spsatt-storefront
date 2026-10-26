import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

import { MaintenanceCountdown } from "./MaintenanceCountdown";

const units = { days: "d", hours: "h", minutes: "m", seconds: "s" };

function renderCountdown(endsAt: string | null) {
  return render(
    <MaintenanceCountdown endsAt={endsAt} label="Volvemos en" units={units} />,
  );
}

describe("MaintenanceCountdown", () => {
  beforeEach(() => {
    mocks.refresh.mockReset();
    vi.useRealTimers();
  });

  it("stays hidden without a date or when the date already passed", () => {
    const { rerender, unmount } = renderCountdown(null);
    expect(screen.queryByRole("timer")).toBeNull();

    rerender(
      <MaintenanceCountdown
        endsAt={new Date(Date.now() - 60_000).toISOString()}
        label="Volvemos en"
        units={units}
      />,
    );
    expect(screen.queryByRole("timer")).toBeNull();
    expect(mocks.refresh).not.toHaveBeenCalled();
    unmount();
  });

  it("ticks down and hides itself once the moment passes", () => {
    vi.useFakeTimers({
      toFake: ["Date", "setInterval", "clearInterval"],
    });
    vi.setSystemTime(new Date("2026-10-25T12:00:00Z"));

    renderCountdown(new Date("2026-10-25T12:01:05Z").toISOString());

    // 65s left: 00d 00h 01m 05s
    expect(screen.getByRole("timer").textContent).toBe("00d00h01m05s");

    act(() => vi.advanceTimersByTime(5_000));
    expect(screen.getByRole("timer").textContent).toBe("00d00h01m00s");

    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.queryByRole("timer")).toBeNull();
    expect(mocks.refresh).toHaveBeenCalledTimes(1);

    // Any later tick must not refresh again.
    act(() => vi.advanceTimersByTime(5_000));
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });
});
