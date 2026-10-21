import { Component, type ReactNode } from "react";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="panel" style={{ margin: "3rem auto", maxWidth: 700 }}>
          <h1>مُعِين · MAEEN</h1>
          <p role="alert">
            تعذر فتح الأداة. تحقق من الاتصال ثم أعد التحميل.
            <br />
            <span lang="en" dir="ltr">
              The tool could not open. Check your connection and reload.
            </span>
          </p>
          <a className="button" href="./">
            إعادة التحميل / Reload
          </a>
        </main>
      );
    return this.props.children;
  }
}
