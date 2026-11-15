using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading;
using System.Runtime.InteropServices;

internal static class GeminiWindow {
    const int GWL_STYLE = -16, GWL_EXSTYLE = -20;
    const long WS_CHILD = 0x40000000L, WS_MINIMIZEBOX = 0x00020000L;
    const long WS_EX_APPWINDOW = 0x00040000L, WS_EX_TOOLWINDOW = 0x00000080L;
    const uint SWP_FRAMECHANGED = 0x0020, SWP_NOZORDER = 0x0004;
    const int SW_HIDE = 0, SW_SHOWNOACTIVATE = 4, SW_RESTORE = 9, SW_MAXIMIZE = 3;
    static readonly string PathName = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "GPTDaddy", "gemini-dock.json");
    static readonly string VisibilityPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "GPTDaddy", "gemini-visible.txt");

    [DllImport("user32.dll")] static extern bool IsWindow(IntPtr h);
    [StructLayout(LayoutKind.Sequential)] struct RECT { public int Left, Top, Right, Bottom; }
    [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h, out RECT rect);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
    [StructLayout(LayoutKind.Sequential)] struct POINT { public int X, Y; }
    [DllImport("user32.dll")] static extern bool GetCursorPos(out POINT point);
    [DllImport("user32.dll")] static extern IntPtr WindowFromPoint(POINT point);
    [DllImport("user32.dll")] static extern short GetAsyncKeyState(int key);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, IntPtr processId);
    [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();
    [DllImport("user32.dll")] static extern bool AttachThreadInput(uint from, uint to, bool attach);
    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] static extern IntPtr SetFocus(IntPtr h);
    [DllImport("user32.dll")] static extern IntPtr GetFocus();
    [DllImport("user32.dll")] static extern bool IsZoomed(IntPtr h);
    [DllImport("user32.dll")] static extern bool IsIconic(IntPtr h);
    [DllImport("user32.dll")] static extern IntPtr GetSystemMenu(IntPtr h, bool revert);
    [DllImport("user32.dll")] static extern bool EnableMenuItem(IntPtr menu, uint item, uint flags);
    [DllImport("user32.dll")] static extern bool DrawMenuBar(IntPtr h);
    [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr h, int command);
    [DllImport("user32.dll")] static extern IntPtr GetParent(IntPtr h);
    [DllImport("user32.dll")] static extern IntPtr SetParent(IntPtr h, IntPtr parent);
    [DllImport("user32.dll", EntryPoint="SetWindowLongPtrW")] static extern IntPtr SetWindowLongPtr(IntPtr h, int index, IntPtr value);
    [DllImport("user32.dll", EntryPoint="GetWindowLongPtrW")] static extern IntPtr GetWindowLongPtr(IntPtr h, int index);
    [DllImport("user32.dll")] static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int w, int height, uint flags);

    sealed class DockState {
        public IntPtr Child, Parent;
        public bool Overlay;
        public long OldStyle, OldExStyle, DockStyle;
        public int X, Y, Width, Height;
    }
    static long Number(string json, string name) {
        var match = Regex.Match(json, "\\\"" + Regex.Escape(name) + "\\\"\\s*:\\s*(-?[0-9]+)");
        if (!match.Success) throw new InvalidDataException("Missing " + name);
        return long.Parse(match.Groups[1].Value);
    }
    static DockState Read() {
        if (!File.Exists(PathName)) return null;
        var json = File.ReadAllText(PathName);
        return new DockState {
            Overlay = Regex.IsMatch(json, "\\\"mode\\\"\\s*:\\s*\\\"overlay\\\""),
            Child = new IntPtr(Number(json, "child")), Parent = new IntPtr(Number(json, "parent")),
            OldStyle = Number(json, "oldStyle"), OldExStyle = Number(json, "oldExStyle"), DockStyle = Number(json, "dockStyle"),
            X = (int)Number(json, "x"), Y = (int)Number(json, "y"), Width = (int)Number(json, "width"), Height = (int)Number(json, "height")
        };
    }
    static void EnsureNoTaskbar(DockState state) {
        long ex = GetWindowLongPtr(state.Child, GWL_EXSTYLE).ToInt64();
        long desired = (ex & ~WS_EX_APPWINDOW) | WS_EX_TOOLWINDOW;
        if (ex != desired) SetWindowLongPtr(state.Child, GWL_EXSTYLE, new IntPtr(desired));
    }
    static void Fullscreen(DockState state) {
        var h = state.Child;
        ShowWindow(h, SW_RESTORE);
        if (state.Overlay) SetWindowLongPtr(h, -8, IntPtr.Zero);
        else SetParent(h, IntPtr.Zero);
        SetWindowLongPtr(h, GWL_STYLE, new IntPtr(state.OldStyle));
        SetWindowLongPtr(h, GWL_EXSTYLE, new IntPtr((state.OldExStyle & ~WS_EX_APPWINDOW) | WS_EX_TOOLWINDOW));
        EnableMenuItem(GetSystemMenu(h, false), 0xF020, 0);
        DrawMenuBar(h);
        SetWindowPos(h, IntPtr.Zero, 0, 0, 0, 0, SWP_FRAMECHANGED | SWP_NOZORDER | 0x0001 | 0x0002);
        ShowWindow(h, SW_MAXIMIZE);
    }
    static void Return(DockState state) {
        var h = state.Child;
        ShowWindow(h, SW_RESTORE);
        SetWindowLongPtr(h, GWL_STYLE, new IntPtr(state.DockStyle & ~WS_MINIMIZEBOX));
        SetWindowLongPtr(h, GWL_EXSTYLE, new IntPtr((state.OldExStyle & ~WS_EX_APPWINDOW) | WS_EX_TOOLWINDOW));
        if (state.Overlay) SetWindowLongPtr(h, -8, state.Parent);
        else SetParent(h, state.Parent);
        EnableMenuItem(GetSystemMenu(h, false), 0xF020, 1);
        DrawMenuBar(h);
        int x = state.X, y = state.Y;
        if (state.Overlay) {
            RECT parentRect;
            if (!GetWindowRect(state.Parent, out parentRect)) return;
            x += parentRect.Left; y += parentRect.Top;
        }
        SetWindowPos(h, IntPtr.Zero, x, y, state.Width, state.Height, SWP_FRAMECHANGED | SWP_NOZORDER);
        ShowWindow(h, SW_SHOWNOACTIVATE);
    }
    static bool WasDragged(DockState state) {
        RECT child, parent;
        if (!GetWindowRect(state.Child, out child) || !GetWindowRect(state.Parent, out parent)) return false;
        return Math.Abs(child.Left - parent.Left - state.X) > 45 || Math.Abs(child.Top - parent.Top - state.Y) > 45;
    }
    static void Release(DockState state) {
        RECT rect;
        if (!GetWindowRect(state.Child, out rect)) return;
        if (state.Overlay) SetWindowLongPtr(state.Child, -8, IntPtr.Zero);
        else SetParent(state.Child, IntPtr.Zero);
        SetWindowLongPtr(state.Child, GWL_STYLE, new IntPtr(state.OldStyle));
        SetWindowLongPtr(state.Child, GWL_EXSTYLE, new IntPtr((state.OldExStyle & ~WS_EX_APPWINDOW) | WS_EX_TOOLWINDOW));
        SetWindowPos(state.Child, IntPtr.Zero, rect.Left, rect.Top, rect.Right - rect.Left, rect.Bottom - rect.Top, SWP_FRAMECHANGED | SWP_NOZORDER);
    }
    static bool Focus(DockState state, bool gemini) {
        if (state.Overlay) return false;
        if (GetParent(state.Child) != state.Parent || GetForegroundWindow() != state.Parent) return false;
        var target = gemini ? state.Child : state.Parent;
        uint own = GetCurrentThreadId(), chrome = GetWindowThreadProcessId(state.Child, IntPtr.Zero);
        uint codex = GetWindowThreadProcessId(state.Parent, IntPtr.Zero);
        bool attachedChrome = AttachThreadInput(own, chrome, true);
        bool attachedCodex = codex != chrome && AttachThreadInput(own, codex, true);
        try {
            SetFocus(target);
            return GetFocus() == target;
        } finally {
            if (attachedCodex) AttachThreadInput(own, codex, false);
            if (attachedChrome) AttachThreadInput(own, chrome, false);
        }
    }
    static bool Contains(RECT rect, POINT point) { return point.X >= rect.Left && point.X < rect.Right && point.Y >= rect.Top && point.Y < rect.Bottom; }
    static void Raise(DockState state) { SetWindowPos(state.Child, IntPtr.Zero, 0, 0, 0, 0, 0x0001 | 0x0002 | 0x0010); }
    static bool IsAbove(DockState state) {
        RECT rect;
        if (!GetWindowRect(state.Child, out rect)) return false;
        var hit = WindowFromPoint(new POINT { X = (rect.Left + rect.Right) / 2, Y = rect.Bottom - Math.Min(70, (rect.Bottom - rect.Top) / 2) });
        for (int i = 0; i < 8 && hit != IntPtr.Zero; i++, hit = GetParent(hit)) if (hit == state.Child) return true;
        return false;
    }
    static int Main(string[] args) {
        if (args.Length != 1) return 2;
        if (args[0] == "watch") {
            using (var mutex = new Mutex(false, "Local\\GPTDaddyGeminiWindowWatcher")) {
                if (!mutex.WaitOne(0)) return 0;
                int missing = 0;
                bool fullscreen = false;
                bool wasPressed = false;
                while (missing < 750) {
                    DockState state = null;
                    try { state = Read(); } catch (IOException) { }
                    if (state == null || !IsWindow(state.Child)) { missing++; Thread.Sleep(80); continue; }
                    missing = 0;
                    EnsureNoTaskbar(state);
                    if (GetParent(state.Child) == state.Parent && IsZoomed(state.Child)) { Fullscreen(state); fullscreen = true; }
                    else if (fullscreen && IsIconic(state.Child) && GetParent(state.Child) == IntPtr.Zero) {
                        Return(state);
                        if (File.Exists(VisibilityPath) && File.ReadAllText(VisibilityPath) == "0") ShowWindow(state.Child, SW_HIDE);
                        fullscreen = false;
                    }
                    else if (GetParent(state.Child) == state.Parent && GetForegroundWindow() == state.Child &&
                             (GetAsyncKeyState(1) & 0x8000) != 0 && WasDragged(state)) Release(state);
                    if (!state.Overlay && GetParent(state.Child) == state.Parent && IsWindowVisible(state.Child) && GetForegroundWindow() == state.Parent && !IsAbove(state)) Raise(state);
                    bool pressed = (GetAsyncKeyState(1) & 0x8000) != 0;
                    if (!state.Overlay && pressed != wasPressed && GetParent(state.Child) == state.Parent && GetForegroundWindow() == state.Parent) {
                        POINT point; RECT childRect, parentRect;
                        if (GetCursorPos(out point) && GetWindowRect(state.Child, out childRect) && GetWindowRect(state.Parent, out parentRect)) {
                            if (Contains(childRect, point) && IsWindowVisible(state.Child)) Focus(state, true);
                            else if (Contains(parentRect, point)) Focus(state, false);
                        }
                    }
                    wasPressed = pressed;
                    Thread.Sleep(30);
                }
            }
            return 0;
        }
        try {
            var state = Read();
            if (state == null || !IsWindow(state.Child)) return 3;
            if (args[0] == "hide") { File.WriteAllText(VisibilityPath, "0"); if (GetParent(state.Child) == state.Parent) ShowWindow(state.Child, SW_HIDE); return 0; }
            if (args[0] == "show") {
                EnsureNoTaskbar(state);
                File.WriteAllText(VisibilityPath, "1");
                if (GetParent(state.Child) == state.Parent) {
                    if (state.Overlay) {
                        RECT parentRect;
                        if (GetWindowRect(state.Parent, out parentRect)) SetWindowPos(state.Child, IntPtr.Zero, parentRect.Left + state.X, parentRect.Top + state.Y, state.Width, state.Height, 0x0010);
                    }
                    ShowWindow(state.Child, SW_SHOWNOACTIVATE); Raise(state);
                }
                return 0;
            }
            if (args[0] == "focus") return Focus(state, true) ? 0 : 5;
            if (args[0] == "focusCodex") return Focus(state, false) ? 0 : 5;
            if (args[0] == "return") { Return(state); return 0; }
        } catch { return 4; }
        return 2;
    }
}
