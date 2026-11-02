Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Code Meet\Jaanch AI\client\public\logo-brand.jpg"
$destPath = "C:\Code Meet\Jaanch AI\client\public\og-image.jpg"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)

# Source logo bounding box:
$minX = 758
$maxX = 1870
$minY = 378
$maxY = 702
$logoW = $maxX - $minX
$logoH = $maxY - $minY

# Target canvas: 1200 x 630
$canvasW = 1200
$canvasH = 630

$bmp = New-Object System.Drawing.Bitmap($canvasW, $canvasH)
$g = [System.Drawing.Graphics]::FromImage($bmp)

# High quality rendering settings
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Background: #FAF7F2 (250, 247, 242)
$bgColor = [System.Drawing.Color]::FromArgb(250, 247, 242)
$brush = New-Object System.Drawing.SolidBrush($bgColor)
$g.FillRectangle($brush, 0, 0, $canvasW, $canvasH)

# Scale logo to fit comfortably in both 1200x630 wide card and 630x630 square crop
# Let logo width be 540px (height = 540 * (324 / 1112) = ~157px)
$targetLogoW = 540
$targetLogoH = [int](540 * ($logoH / $logoW))

$destX = [int](($canvasW - $targetLogoW) / 2)
$destY = [int](($canvasH - $targetLogoH) / 2)

$srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $logoW, $logoH)
$destRect = New-Object System.Drawing.Rectangle($destX, $destY, $targetLogoW, $targetLogoH)

$g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

# Save with 95% JPEG quality
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)

$bmp.Save($destPath, $encoder, $encoderParams)

Write-Host "Created $destPath successfully."
Write-Host "Size: $( (Get-Item $destPath).Length ) bytes."

$g.Dispose()
$bmp.Dispose()
$src.Dispose()
