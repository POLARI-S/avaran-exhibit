param([Parameter(Mandatory=$true)][string]$Source, [Parameter(Mandatory=$true)][string]$Destination)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$bitmap = [System.Drawing.Bitmap]::new($Source)
if ($bitmap.Width -ne 1257 -or $bitmap.Height -ne 944) { $bitmap.Dispose(); throw 'Screenshot size changed; review privacy mask coordinates.' }
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(27, 44, 59))
# Only local paths and serial-port identifiers are masked. Recorded numbers remain untouched.
$masks = @(@(1158,60,54,20), @(40,177,47,19), @(672,439,41,18), @(132,481,39,19), @(194,536,762,21), @(95,573,515,20))
foreach ($mask in $masks) { $graphics.FillRectangle($brush, $mask[0], $mask[1], $mask[2], $mask[3]) }
$bitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
$brush.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
