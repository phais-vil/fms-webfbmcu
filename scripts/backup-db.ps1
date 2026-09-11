<#
.SYNOPSIS
  Automated Database Backup Script for Windows (Anti-Ransomware / Disaster Recovery)
.DESCRIPTION
  Dumps PostgreSQL database, compresses it, and keeps rolling 14-day history.
#>
param(
    [string]$BackupDir = "C:\Backups\fms-database",
    [int]$RetentionDays = 14
)

$ErrorActionPreference = "Stop"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$BackupFile = Join-Path $BackupDir "fms_backup_$Timestamp.sql"
Write-Host "[$(Get-Date)] 🗄️ Starting database backup to $BackupFile..." -ForegroundColor Cyan

# Run pg_dump (assumes PostgreSQL bin is in PATH or specify full path)
pg_dump -U postgres -d ums_dev -f $BackupFile

# Compress
$ZipFile = "$BackupFile.zip"
Compress-Archive -Path $BackupFile -DestinationPath $ZipFile -CompressionLevel Optimal
Remove-Item $BackupFile -Force

Write-Host "[$(Get-Date)] ✅ Backup created successfully: $ZipFile" -ForegroundColor Green

# Cleanup old backups
Write-Host "[$(Get-Date)] 🧹 Cleaning up backups older than $RetentionDays days..." -ForegroundColor Yellow
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "fms_backup_*.zip" | Where-Object { $_.LastWriteTime -lt $CutoffDate } | Remove-Item -Force

Write-Host "[$(Get-Date)] 🎉 Backup process completed." -ForegroundColor Green
