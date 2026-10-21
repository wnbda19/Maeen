import { useSyncExternalStore } from "react";
export type DevicePhase =
  "idle" | "loading" | "active" | "error" | "unsupported";
type Devices = { camera: DevicePhase; microphone: DevicePhase };
let snapshot: Devices = { camera: "idle", microphone: "idle" };
const listeners = new Set<() => void>();
export function reportDevice(device: keyof Devices, phase: DevicePhase) {
  if (snapshot[device] === phase) return;
  snapshot = { ...snapshot, [device]: phase };
  listeners.forEach((fn) => fn());
}
export function useDeviceStatus() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => snapshot,
    () => snapshot,
  );
}
