using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Interop;
using System.Windows.Media;
using Forms = System.Windows.Forms;

namespace GptSalad.Desktop;

public partial class MainWindow : Window
{
    private const int HotkeyId = 0x51A1;
    private readonly Forms.NotifyIcon tray;
    public MainWindow()
    {
        InitializeComponent();
        tray = new Forms.NotifyIcon { Icon = System.Drawing.SystemIcons.Information, Text = "GPT Salad", Visible = true };
        var menu = new Forms.ContextMenuStrip();
        menu.Items.Add("打开取词面板", null, (_, _) => Dispatcher.Invoke(CaptureAndShow));
        menu.Items.Add("退出", null, (_, _) => Dispatcher.Invoke(() => System.Windows.Application.Current.Shutdown()));
        tray.ContextMenuStrip = menu;
        tray.DoubleClick += (_, _) => Dispatcher.Invoke(CaptureAndShow);
        Loaded += (_, _) => Hide();
        Closed += (_, _) => { UnregisterHotKey(new WindowInteropHelper(this).Handle, HotkeyId); tray.Dispose(); };
        SourceInitialized += (_, _) =>
        {
            var hwnd = new WindowInteropHelper(this).Handle;
            HwndSource.FromHwnd(hwnd).AddHook(WndProc);
            if (!RegisterHotKey(hwnd, HotkeyId, 0x0003, 0x54))
                Forms.MessageBox.Show("Ctrl+Alt+T 已被其他程序占用。", "GPT Salad");
        };
    }
    private IntPtr WndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
    {
        if (msg == 0x0312 && wParam.ToInt32() == HotkeyId) { handled = true; CaptureAndShow(); }
        return IntPtr.Zero;
    }
    private void CaptureAndShow()
    {
        var result = SelectionCapture.Capture();
        SelectedText.Text = result.Text;
        SourceLabel.Text = result.Method + (result.Error is null ? "" : " · " + result.Error);
        var p = Forms.Cursor.Position; var dpi = VisualTreeHelper.GetDpi(this);
        Left = Math.Max(0, p.X / dpi.DpiScaleX + 12); Top = Math.Max(0, p.Y / dpi.DpiScaleY + 12);
        Show(); Activate();
    }
    private void Copy_Click(object sender, RoutedEventArgs e) => System.Windows.Clipboard.SetText(SelectedText.Text);
    private void Close_Click(object sender, RoutedEventArgs e) => Hide();
    [DllImport("user32.dll", SetLastError = true)] private static extern bool RegisterHotKey(IntPtr hwnd, int id, uint modifiers, uint key);
    [DllImport("user32.dll", SetLastError = true)] private static extern bool UnregisterHotKey(IntPtr hwnd, int id);
}
