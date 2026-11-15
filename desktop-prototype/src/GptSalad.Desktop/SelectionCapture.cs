using System.Runtime.InteropServices;
using System.Windows.Automation;
using Forms = System.Windows.Forms;

namespace GptSalad.Desktop;

internal record CaptureResult(string Text, string Method, string? Error = null);
internal static class SelectionCapture
{
    public static CaptureResult Capture()
    {
        try
        {
            var element = AutomationElement.FocusedElement;
            if (element?.TryGetCurrentPattern(TextPattern.Pattern, out var pattern) == true)
            {
                var ranges = ((TextPattern)pattern).GetSelection();
                var text = string.Join("\n", ranges.Select(r => r.GetText(-1)).Where(s => !string.IsNullOrWhiteSpace(s))).Trim();
                if (text.Length > 0) return new(text, "UI Automation TextPattern");
            }
        }
        catch (Exception e) when (e is ElementNotAvailableException or InvalidOperationException or COMException)
        {
            return ClipboardFallback("UI Automation: " + e.Message);
        }
        return ClipboardFallback(null);
    }
    private static CaptureResult ClipboardFallback(string? automationError)
    {
        IntPtr original = IntPtr.Zero;
        try
        {
            int hr = OleGetClipboard(out original);
            if (hr != 0) return new("", "剪贴板回退失败", $"OleGetClipboard: 0x{hr:X8}");
            Forms.SendKeys.SendWait("^c");
            Thread.Sleep(120);
            string text = System.Windows.Clipboard.ContainsText() ? System.Windows.Clipboard.GetText() : "";
            hr = OleSetClipboard(original);
            return new(text, hr == 0 ? "Ctrl+C 剪贴板回退" : "剪贴板恢复失败", hr == 0 ? automationError : $"OleSetClipboard: 0x{hr:X8}");
        }
        catch (Exception e)
        {
            if (original != IntPtr.Zero) OleSetClipboard(original);
            return new("", "剪贴板回退失败", e.Message);
        }
        finally { if (original != IntPtr.Zero) Marshal.Release(original); }
    }
    [DllImport("ole32.dll")] private static extern int OleGetClipboard(out IntPtr dataObject);
    [DllImport("ole32.dll")] private static extern int OleSetClipboard(IntPtr dataObject);
}
